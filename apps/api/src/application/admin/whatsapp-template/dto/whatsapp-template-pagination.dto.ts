import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

import { PageDto } from '@/common/pagination/page.dto'
import { PageOptionsDto } from '@/common/pagination/page-options.dto'

import { WhatsappTemplateResponseDTO } from './whatsapp-template.dto'

export class WhatsappTemplatePageDto extends PageDto<WhatsappTemplateResponseDTO> {}
export class WhatsappTemplatePaginationDTO extends PageOptionsDto {
  @ApiPropertyOptional({
    example: 'Filter by institution of template',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  institutionId: number

  @ApiPropertyOptional({
    example: 'Filter by name of template',
    required: false,
  })
  @IsString()
  @IsOptional()
  name: string

  @ApiPropertyOptional({
    example: 'Filter by Status of template',
    required: false,
  })
  @IsString()
  @IsOptional()
  status: string

  @ApiPropertyOptional({
    example: 'Filter by assigned to template',
    required: false,
  })
  @IsString()
  @IsOptional()
  assignedTo: string
}
