import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
@Injectable()
export class S3ClientFactory {
  public client: S3Client
  public bucketName: string
  public privateBucketName: string
  private region: string

  constructor() {
    this.region = process.env.AWS_REGION
    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })

    this.bucketName = process.env.AWS_BUCKET_NAME
    this.privateBucketName = process.env.AWS_PRIVATE_BUCKET_NAME
  }

  getS3Client() {
    return this.client
  }

  async getObjectBuffer(key: string, options?: { isPrivateBucket?: boolean }): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: options.isPrivateBucket ? this.privateBucketName : this.bucketName,
      Key: key,
    })
    try {
      const response = await this.client.send(command)
      const imageArray = await response.Body.transformToByteArray()
      return Buffer.from(imageArray)
    } catch (error) {
      console.log(error)
    }
  }

  getS3ObjectUrl = (key: string): string | null => {
    if (!key) return null
    return `https://s3.${this.region}.amazonaws.com/${this.bucketName}/${key}`
  }

  async getS3ObjectPresignedUrl(key: string): Promise<string | null> {
    if (!key) return null
    return await getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.privateBucketName, Key: key }),
      {
        expiresIn: parseInt(process.env.AWS_PRESIGNED_URL_EXPIRES),
      }
    )
  }

  async uploadObject(
    keyPrefix: string,
    buffer: Buffer,
    options?: { isPrivateBucket?: boolean; contentType?: string; extension?: string }
  ): Promise<string> {
    const extension = options?.extension || 'png'
    const key = `${keyPrefix}/${randomUUID()}.${extension}`

    const command = new PutObjectCommand({
      Bucket: options?.isPrivateBucket ? this.privateBucketName : this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: options?.contentType || 'image/png',
    })

    try {
      await this.client.send(command)

      return options?.isPrivateBucket
        ? await this.getS3ObjectPresignedUrl(key)
        : this.getS3ObjectUrl(key)
    } catch (error) {
      console.error('Error uploading to S3:', error)
      throw error
    }
  }
}

// --for later use--
// typeorm entity does not have direct access to the NestJS providers via constructors
// typeorm entities are not part of the nestjs dependency injection system
// so we can't inject dependencies in entities directly
// we need to create a factory provider to inject the dependencies
// not sure if this is the best way to do it
export function s3ClientFactory() {
  return new S3ClientFactory()
}
