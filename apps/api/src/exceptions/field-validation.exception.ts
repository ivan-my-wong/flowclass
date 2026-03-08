import { BadRequestException } from '@nestjs/common'

interface FieldValidationError {
  field: string
  message: string
}

export class FieldValidationFailedException extends BadRequestException {
  constructor(errors: FieldValidationError[]) {
    super(errors)
  }
}
