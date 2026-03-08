import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { CurrentCourse } from '@/common/decorators/current-course.decorator'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { CommentService } from '@/domain/service/comment.service'
import { Course } from '@/models/courses.entity'
import { RequireParam, Role } from '@/models/enums/'
import {
  createCommentSchema,
  deleteCommentSchema,
  responseGetAllComment,
} from '@/models/schemas/comment.schema'
import { User } from '@/models/user.entity'

import { CommentPageOptionDTO, CreateCommentDTO, PostCommentDTO } from './dto/comment.dto'

@ApiBadRequestResponse({
  description: 'This response may be when the request is in wrong format or value is out of range',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiUnauthorizedResponse({
  description: `This is because the token is expired or user haven't login yet`,
})
@ApiTags('Comments')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiOperation({
    summary: 'This api for user use to get all comments of a course by institutionId and courseId',
  })
  @ApiOkResponse({
    schema: responseGetAllComment,
  })
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @Get('')
  async getAllComments(@Query() commentPageOptionDTO: CommentPageOptionDTO) {
    const founds = await this.commentService.findAllWithPaginate(commentPageOptionDTO)
    return founds
  }

  @ApiOperation({
    summary: 'This api for user use to post a comment on a course',
  })
  @ApiOkResponse({
    schema: createCommentSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @Post('post')
  async postComment(
    @Body() postCommentDTO: PostCommentDTO,
    @CurrentUser() user: User,
    @CurrentCourse() course: Course
  ) {
    postCommentDTO.institutionId = course.institutionId
    const createCommentDTO = new CreateCommentDTO()
    Object.assign(createCommentDTO, postCommentDTO)
    createCommentDTO.siteId = course.siteId
    createCommentDTO.userId = user.id

    return await this.commentService.createNewComment(createCommentDTO)
  }

  @ApiOperation({
    summary: 'This api for manger use to delete a comment on a course',
  })
  @ApiOkResponse({
    schema: deleteCommentSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COMMENT_ID)
  @UseGuards(RequireParamsGuard)
  @Delete('delete')
  async deleteComment(@Query('commentId') id: number) {
    return await this.commentService.deleteComment(+id)
  }
}
