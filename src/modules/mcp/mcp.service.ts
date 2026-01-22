/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Server } from '@modelcontextprotocol/sdk/server';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Repository } from 'typeorm';
import { CallLog } from './mcp.entity';
import { InjectRepository } from '@nestjs/typeorm';

interface ToolArgs {
  intent?: string;
  transcript?: string;
  customerId?: string;
}

@Injectable()
export class McpService implements OnModuleInit {
  private mcpServer!: Server;
  private readonly logger = new Logger(McpService.name);

  constructor(
    @InjectRepository(CallLog)
    private callLogRepository: Repository<CallLog>,
  ) {}

  onModuleInit() {
    try {
      this.mcpServer = new Server(
        { name: 'SaaS-Voice-MCP', version: '1.0.0' },
        { capabilities: { tools: {} } },
      );
      this.setupTools();
      this.logger.log('MCP Server initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize MCP Server:', error);
    }
  }

  private setupTools() {
    // Define the list of available tools
    this.mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'handle_call_logic',
            description: 'Process voice call logic for transfers and summaries',
            inputSchema: {
              type: 'object',
              properties: {
                intent: { type: 'string', enum: ['transfer', 'summarize'] },
                transcript: { type: 'string' },
                customerId: { type: 'string' },
              },
              required: ['intent', 'transcript'],
            },
          },
        ],
      };
    });

    // Handle tool calls and route them to appropriate handlers
    this.mcpServer.setRequestHandler(
      CallToolRequestSchema,
      async (request: any) => {
        const { name, arguments: args } = request.params;

        if (name === 'handle_call_logic') {
          return await this.processVoiceLogic(args as ToolArgs);
        }
        throw new Error('Tool not found');
      },
    );
  }

  private async processVoiceLogic(args: ToolArgs) {
    const { intent, transcript, customerId } = args;

    // Handle call transfer logic - check for urgent keywords
    if (intent === 'transfer') {
      const urgentKeywords = ['order', 'talk to agent', 'urgent', 'agent'];
      const shouldTransfer = urgentKeywords.some((key) =>
        transcript?.toLowerCase().includes(key),
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ transfer: shouldTransfer }),
          },
        ],
      };
    }

    // Save call summary and transcript for admin dashboard review
    if (intent === 'summarize') {
      try {
        const newLog = this.callLogRepository.create({
          companyId: args?.customerId || 'DEFAULT_TENANT', // SaaS Tenant ID
          customerId: customerId,
          fullTranscript: transcript,
          summary: await this.generateSummary(transcript),
          wasTransferred: false,
        });

        await this.callLogRepository.save(newLog);

        return {
          content: [
            { type: 'text', text: 'Call log and summary saved to dashboard.' },
          ],
        };
      } catch (error) {
        this.logger.error('Database save error:', error);
        return {
          content: [{ type: 'text', text: 'Failed to save call log.' }],
        };
      }
    }

    return { content: [{ type: 'text', text: 'Unknown intent' }] };
  }

  // Generate AI-powered call summary (can be integrated with OpenAI or Claude API)
  private async generateSummary(text: string | undefined): Promise<string> {
    // Returns first 150 characters as summary preview
    return `Summary: ${text?.substring(0, 150) || 'No transcript available'}...`;
  }

  // Execute tool requests through the MCP server
  async handleRequest(payload: any) {
    try {
      // Validate request has method and optionally params
      if (!payload.method) {
        throw new Error('Request must have a method');
      }

      // Process tool calls via the server's request handler
      return await this.mcpServer.request(payload, {} as any);
    } catch (error) {
      this.logger.error('Error handling request:', error);
      throw error;
    }
  }
}
