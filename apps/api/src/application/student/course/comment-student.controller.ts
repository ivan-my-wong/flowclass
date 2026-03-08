import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { CreateCommentDTO } from '@/application/admin/courses/dto/comment.dto'
import { CurrentCourse } from '@/common/decorators/current-course.decorator'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { StudentAuthGuard } from '@/common/guards/student-auth.guard'
import { CommentService } from '@/domain/service/comment.service'
import { Course } from '@/models/courses.entity'
import { RequireParam } from '@/models/enums/'
import { createCommentSchema, responseGetAllComment } from '@/models/schemas/comment.schema'
import { User } from '@/models/user.entity'

import { StudentCommentPageOptionDTO, StudentPostCommentDTO } from './dto/comment-student.dto'

@ApiBadRequestResponse({
  description: 'This response may be when the request is in wrong format or value is out of range',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiUnauthorizedResponse({
  description: `This is because the token is expired or user haven't login yet`,
})
@ApiTags('Student Comments')
@UseGuards(StudentAuthGuard)
@ApiBearerAuth('access-token')
@Controller('comments')
export class CommentStudentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiOperation({
    operationId: 'studentCourseCommentAll',
    summary: 'This api for user use to get all comments of a course by institutionId and courseId',
  })
  @ApiOkResponse({
    schema: responseGetAllComment,
  })
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @Get('all')
  async getAllComments(
    @Query() commentPageOptionDTO: StudentCommentPageOptionDTO,
    @CurrentCourse() course: Course
  ) {
    commentPageOptionDTO.siteId = course.siteId
    commentPageOptionDTO.institutionId = course.institutionId
    const founds = await this.commentService.findAllWithPaginate(commentPageOptionDTO)
    return founds
  }

  @ApiOperation({
    operationId: 'studentCourseCommentPost',
    summary: 'This api for user use to post a comment on a course',
  })
  @ApiOkResponse({
    schema: createCommentSchema,
  })
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @Post('post')
  async postComment(
    @Body() postCommentDTO: StudentPostCommentDTO,
    @CurrentUser() user: User,
    @CurrentCourse() course: Course
  ) {
    const userId = user.id
    postCommentDTO.userId = userId
    postCommentDTO.siteId = course.siteId
    postCommentDTO.institutionId = course.institutionId
    postCommentDTO.courseId = course.id
    const createCommentDTO = new CreateCommentDTO()
    Object.assign(createCommentDTO, postCommentDTO)
    return await this.commentService.createNewComment(createCommentDTO)
  }
}
