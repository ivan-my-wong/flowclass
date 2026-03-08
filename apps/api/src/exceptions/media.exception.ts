import { NotFoundException } from '@nestjs/common'

export class FileNotFoundException extends NotFoundException {
  constructor(objectOrError?: string | object | any, description?: string) {
    super(objectOrError, description)
  }
}
