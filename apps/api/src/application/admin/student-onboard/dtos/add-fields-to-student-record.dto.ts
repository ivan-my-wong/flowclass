import { ApiProperty } from '@nestjs/swagger'

import { StudentFormMetadata } from '@/models/student-form.entity'

export class AddFieldsToStudentRecordDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  userId: number

  @ApiProperty({ description: 'Institution ID', example: 1 })
  institutionId: number

  @ApiProperty({
    description: 'Fields to add',
    items: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        type: { type: 'string' },
        value: { type: 'string' },
        question: { type: 'string' },
      },
    },
    example: [{ id: 1, type: 'text', value: 'value1' }],
  })
  fields: StudentFormMetadata[]
}
