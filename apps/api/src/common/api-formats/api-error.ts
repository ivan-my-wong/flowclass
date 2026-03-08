import { HttpException, HttpStatus } from '@nestjs/common'

export class ApiError extends HttpException {
  public data: any

  constructor(message: string, data?: any) {
    super(message, HttpStatus.BAD_REQUEST)
    this.data = data
  }

  static error(message: string, data?: any) {
    throw new ApiError(message, data)
  }
}
