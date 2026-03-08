import { Injectable } from '@nestjs/common'
import { FindOptionsOrder, FindOptionsWhere, ObjectLiteral } from 'typeorm'

import { CommentPageOptionDTO, CreateCommentDTO } from '@/application/admin/courses/dto/comment.dto'
import { CommentEntity } from '@/models/comments.entity'
import { CommentRepository } from '@/models/comments.entity'
import { BaseService } from '@/modules/base/base.service'

@Injectable()
export class CommentService extends BaseService<CommentEntity> {
  constructor(private commentRepository: CommentRepository) {
    super(commentRepository)
  }

  async findAllWithPaginate(pageOptionDto: CommentPageOptionDTO) {
    const whereOption: FindOptionsWhere<CommentEntity> = {}

    whereOption.courseId = pageOptionDto.courseId

    const orderOption: FindOptionsOrder<CommentEntity> = {}
    if (pageOptionDto.orderBy) {
      orderOption[pageOptionDto.orderBy] = pageOptionDto.order
    }

    const comments = await this.commentRepository.pagination(
      pageOptionDto,
      whereOption,
      orderOption
    )
    return comments
  }

  async createNewComment(createCommentDTO: CreateCommentDTO) {
    const created = this.commentRepository.create(createCommentDTO)
    return await this.commentRepository.save(created)
  }

  async deleteComment(id: number) {
    const whereDeleteObject: FindOptionsWhere<ObjectLiteral> = {
      id: id | 0,
    }
    await this.commentRepository.manager.softDelete('CommentEntity', whereDeleteObject)

    return true
  }
}
