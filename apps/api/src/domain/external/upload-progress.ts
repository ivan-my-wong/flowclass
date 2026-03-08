import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'

export interface UploadProgress {
  uploadId: string
  userId: number
  totalFiles: number
  completedFiles: number
  currentFile?: string
  percentage: number
  message?: string
  status: 'pending' | 'uploading' | 'completed' | 'failed'
  results?: any[]
  startedAt: Date
  updatedAt: Date
}

@Injectable()
export class UploadProgressService {
  private uploads = new Map<string, UploadProgress>()

  constructor(private eventEmitter: EventEmitter2) {}

  createUpload(uploadId: string, userId: number, totalFiles: number): UploadProgress {
    const progress: UploadProgress = {
      uploadId,
      userId,
      totalFiles,
      completedFiles: 0,
      percentage: 0,
      status: 'pending',
      startedAt: new Date(),
      updatedAt: new Date(),
    }

    this.uploads.set(uploadId, progress)
    this.updateProgress(uploadId, { status: 'uploading' })
    return progress
  }

  updateProgress(uploadId: string, update: Partial<UploadProgress>) {
    const progress = this.uploads.get(uploadId)
    if (!progress) return

    Object.assign(progress, update, { updatedAt: new Date() })
    progress.percentage = Math.round((progress.completedFiles / progress.totalFiles) * 100)

    // Emit event for real-time updates
    this.eventEmitter.emit(uploadId, progress)
  }

  getProgress(uploadId: string): UploadProgress | undefined {
    return this.uploads.get(uploadId)
  }

  completeUpload(uploadId: string, results: any[]) {
    this.updateProgress(uploadId, {
      status: 'completed',
      results,
      completedFiles: results.length,
    })

    // Clean up after 5 minutes
    setTimeout(() => this.uploads.delete(uploadId), 5 * 60 * 1000)
  }
}
