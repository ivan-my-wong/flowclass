import { Controller, Param, Sse } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { SSEService } from '@/modules/sse/sse.service'

@ApiTags('SSE Stream API')
@Controller('stream')
export class SSEController {
  public constructor(private readonly sseService: SSEService) {}

  @ApiOperation({
    summary: 'Stream upload progress data through Server-Sent Events',
    description: `
      Connect to this endpoint to receive real-time upload progress updates.
      
      Usage:
      - For Google Drive uploads: Use the uploadId returned from upload endpoints
      - Event format: { data: { uploadId, userId, totalFiles, completedFiles, percentage, status, currentFile, message } }
      
      Example:
      GET /stream/upload_1234567890_abc123def
      
      Events:
      - Progress updates during upload
      - Completion notification with results
      - Error notifications
    `,
  })
  @Sse(':jobId')
  public async getStreamedData(@Param('jobId') jobId: string) {
    return this.sseService.getEvent(jobId)
  }
}
