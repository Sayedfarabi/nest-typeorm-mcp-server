/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Post, Body } from '@nestjs/common';
import { McpService } from './mcp.service';

@Controller('mcp')
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Post('rpc')
  async handleMcpRequest(@Body() body: any) {
    // ভয়েস AI বা অন্য কোনো ক্লায়েন্ট এখান থেকে টুল কল করবে
    return await this.mcpService.handleRequest(body);
  }
}
