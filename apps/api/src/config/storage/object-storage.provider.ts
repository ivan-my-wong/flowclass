import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { mkdir, readFile, writeFile } from 'fs/promises'
import * as path from 'path'

@Injectable()
export class ObjectStorageProvider {
  private readonly uploadRoot: string
  private readonly apiBaseUrl: string

  constructor() {
    this.uploadRoot = process.env.FILE_UPLOAD_LOCATION || path.resolve(process.cwd(), '__uploads')
    this.apiBaseUrl = (process.env.API_BASE_URL || '').replace(/\/+$/, '')
  }

  async getObjectBuffer(key: string): Promise<Buffer> {
    const resolvedPath = this.resolveStoragePath(key)
    return await readFile(resolvedPath)
  }

  getObjectUrl = (key: string): string | null => {
    if (!key) return null
    const encodedKey = key
      .split('/')
      .filter(Boolean)
      .map((segment) => encodeURIComponent(segment))
      .join('/')
    return `${this.apiBaseUrl}/media/file/${encodedKey}`
  }

  async getObjectAccessUrl(key: string): Promise<string | null> {
    return this.getObjectUrl(key)
  }

  async uploadObject(
    keyPrefix: string,
    buffer: Buffer,
    options?: { isPrivateBucket?: boolean; contentType?: string; extension?: string }
  ): Promise<string> {
    const extension = options?.extension || 'png'
    const key = `${keyPrefix}/${randomUUID()}.${extension}`.replace(/\\/g, '/')
    const resolvedPath = this.resolveStoragePath(key)

    await mkdir(path.dirname(resolvedPath), { recursive: true })
    await writeFile(resolvedPath, buffer)

    const fileUrl = this.getObjectUrl(key)
    if (!fileUrl) {
      throw new Error('Unable to generate storage URL')
    }
    return fileUrl
  }

  private resolveStoragePath(keyOrUrl: string): string {
    const normalizedKey = this.normalizeKey(keyOrUrl)
    const resolved = path.resolve(this.uploadRoot, normalizedKey)
    const rootResolved = path.resolve(this.uploadRoot)

    if (!resolved.startsWith(rootResolved)) {
      throw new Error('Invalid storage key path')
    }

    return resolved
  }

  private normalizeKey(keyOrUrl: string): string {
    if (!keyOrUrl) {
      throw new Error('Storage key is required')
    }

    const rawValue = keyOrUrl.trim()
    let key = rawValue

    if (rawValue.startsWith('http://') || rawValue.startsWith('https://')) {
      const parsedUrl = new URL(rawValue)
      const mediaPrefix = '/media/file/'
      if (parsedUrl.pathname.startsWith(mediaPrefix)) {
        key = parsedUrl.pathname.slice(mediaPrefix.length)
      } else {
        key = parsedUrl.pathname.replace(/^\/+/, '')
      }
    } else {
      key = rawValue.replace(/^\/+/, '')
    }

    const decoded = decodeURIComponent(key)
    const normalized = path.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, '')
    return normalized
  }
}

export function objectStorageFactory() {
  return new ObjectStorageProvider()
}
