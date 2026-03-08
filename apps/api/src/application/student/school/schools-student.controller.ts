import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { getInstitutionSchema } from '@/application/admin/institutions/dto/institution.schema'
import { Public } from '@/common/decorators/public.decorator'
import { StudentAuthGuard } from '@/common/guards/student-auth.guard'
import { InstitutionsService } from '@/domain/service/institutions.service'

import { StudentGetSingleSchoolDTO } from './dto/schools-student.dto'

@ApiBadRequestResponse({
  description: 'This response may be when the request is in wrong format or value is out of range',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiUnauthorizedResponse({
  description: `This is because the token is expired or user haven't login yet`,
})
@ApiTags('Student Schools')
@UseGuards(StudentAuthGuard)
@ApiBearerAuth('access-token')
@Controller('schools')
export class SchoolsStudentController {
  constructor(private readonly schoolsService: InstitutionsService) {}

  @ApiOperation({
    operationId: 'studentSchoolsDetailGet',
    summary: 'This api for user use to get the detail of a school under a domain',
  })
  @ApiOkResponse({
    schema: getInstitutionSchema,
  })
  @Get('detail')
  @Public()
  async getSingleSchool(@Query() { domain, url }: StudentGetSingleSchoolDTO) {
    return this.schoolsService.findOneByUrl(domain, url)
  }
}
