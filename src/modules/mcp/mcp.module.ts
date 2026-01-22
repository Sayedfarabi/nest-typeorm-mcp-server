import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { McpService } from './mcp.service';
import { McpController } from './mcp.controller';
import { CallLog } from './mcp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CallLog])],
  providers: [McpService],
  controllers: [McpController],
})
export class McpModule {}
