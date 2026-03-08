import { Injectable } from '@nestjs/common'

import { Media } from '@/models/media.entity'
import { MediaRepository } from '@/models/media.repository'

import { CreateMediaDto } from './dto/media.dto'
@Injectable()
export class MediaService {
  constructor(private mediaRepository: MediaRepository) {}

  public async createMedia(dto: CreateMediaDto): Promise<Media> {
    const data = await this.mediaRepository.create(dto)
    const media = await this.mediaRepository.save({
      ...data,
    })
    return media
  }

  public getMedia(id: number): Promise<Media> {
    return this.mediaRepository.findOne({ where: { id } })
  }
}
