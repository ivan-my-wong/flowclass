import { IsString } from 'class-validator'

import { PageOptionsDto } from '@/common/pagination/page-options.dto'

export class StudentGetAllSiteDTO extends PageOptionsDto {
  @IsString()
  domain: string
}
