import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { mkdir, readFile, writeFile } from 'fs/promises'
import * as path from 'path'
import * as AWS from 'aws-sdk'

@Injectable()
export class ObjectStorageProvider {
  private readonly uploadRoot: string
  private readonly apiBaseUrl: string
  private readonly s3: AWS.S3 | null = null
  private readonly s3Bucket: string | null = null
  private readonly s3PrivateBucket: string | null = null
  private readonly s3Region: string | null = null

  constructor() {
    this.uploadRoot = process.env.FILE_UPLOAD_LOCATION || path.resolve(process.cwd(), '__uploads')
    this.apiBaseUrl = (process.env.API_BASE_URL || '').replace(/\/+$/, '')

    if (
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_BUCKET_NAME
    ) {
      this.s3Region = process.env.AWS_REGION || 'ap-east-1'
      this.s3Bucket = process.env.AWS_BUCKET_NAME
      this.s3PrivateBucket = process.env.AWS_PRIVATE_BUCKET_NAME || process.env.AWS_BUCKET_NAME
      this.s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: this.s3Region,
        signatureVersion: 'v4',
      })
      console.log('[Storage] S3 storage client initialized (using S3 upload mode)')
    } else {
      console.log('[Storage] S3 credentials missing (using local filesystem fallback)')
    }
  }

  async getObjectBuffer(key: string): Promise<Buffer> {
    const s3Key = this.extractS3Key(key)
    if (this.s3 && s3Key && this.s3Bucket) {
      try {
        const isPrivate = key.includes('private') || key.includes('-private-')
        const bucket = isPrivate ? this.s3PrivateBucket! : this.s3Bucket
        const params = {
          Bucket: bucket,
          Key: s3Key,
        }
        const data = await this.s3.getObject(params).promise()
        return data.Body as Buffer
      } catch (err) {
        console.error(`[Storage] S3 getObjectBuffer error for key ${key}:`, err)
        // Fall back to local if S3 fails or key was local
      }
    }
    const resolvedPath = this.resolveStoragePath(key)
    return await readFile(resolvedPath)
  }

  getObjectUrl = (key: string): string | null => {
    if (!key) return null
    if (key.startsWith('http://') || key.startsWith('https://')) {
      return key
    }
    if (this.s3 && this.s3Bucket) {
      const isPrivate = key.includes('private') || key.includes('-private-')
      const bucket = isPrivate ? this.s3PrivateBucket! : this.s3Bucket
      return `https://${bucket}.s3.${this.s3Region}.amazonaws.com/${key}`
    }
    const encodedKey = key
      .split('/')
      .filter(Boolean)
      .map((segment) => encodeURIComponent(segment))
      .join('/')
    return `${this.apiBaseUrl}/media/file/${encodedKey}`
  }

  async getObjectAccessUrl(key: string): Promise<string | null> {
    const s3Key = this.extractS3Key(key)
    if (this.s3 && s3Key && this.s3Bucket) {
      const isPrivate = key.includes('private') || key.includes('-private-')
      const bucket = isPrivate ? this.s3PrivateBucket! : this.s3Bucket
      
      if (isPrivate) {
        const params = {
          Bucket: bucket,
          Key: s3Key,
          Expires: parseInt(process.env.AWS_PRESIGNED_URL_EXPIRES || '3600', 10),
        }
        return this.s3.getSignedUrl('getObject', params)
      }
    }
    return this.getObjectUrl(key)
  }

  async uploadObject(
    keyPrefix: string,
    buffer: Buffer,
    options?: { isPrivateBucket?: boolean; contentType?: string; extension?: string }
  ): Promise<string> {
    const extension = options?.extension || 'png'
    const key = `${keyPrefix}/${randomUUID()}.${extension}`.replace(/\\/g, '/')

    if (this.s3 && this.s3Bucket) {
      try {
        const bucket = options?.isPrivateBucket ? this.s3PrivateBucket! : this.s3Bucket
        const params = {
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: options?.contentType || `image/${extension}`,
          ACL: options?.isPrivateBucket ? 'private' : 'public-read',
        }
        await this.s3.putObject(params).promise()
        return this.getObjectUrl(key)!
      } catch (err) {
        console.error('[Storage] S3 uploadObject error, falling back to local storage:', err)
      }
    }

    const resolvedPath = this.resolveStoragePath(key)
    await mkdir(path.dirname(resolvedPath), { recursive: true })
    await writeFile(resolvedPath, buffer)

    const fileUrl = this.getObjectUrl(key)
    if (!fileUrl) {
      throw new Error('Unable to generate storage URL')
    }
    return fileUrl
  }

  private extractS3Key(keyOrUrl: string): string | null {
    if (!keyOrUrl) return null
    if (keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://')) {
      try {
        const parsedUrl = new URL(keyOrUrl)
        if (parsedUrl.hostname.includes('amazonaws.com')) {
          return parsedUrl.pathname.replace(/^\/+/, '')
        }
      } catch {
        return null
      }
    }
    return keyOrUrl.replace(/^\/+/, '')
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
