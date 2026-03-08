import { HttpStatus } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'

export enum ApiStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface IApiResult<T> {
  success(data?: T, message?: string): ApiResult<T>
  error(message: string, code: number, errorCode?: string): ApiResult<T>
  setMessage(message: string): ApiResult<T>
}

export class ApiResult<T> implements IApiResult<T> {
  @ApiProperty()
  public status: ApiStatus = ApiStatus.ERROR

  @ApiProperty()
  public code: number

  @ApiProperty()
  public errorCode: string

  @ApiProperty()
  public message: string

  @ApiProperty()
  public data: T

  @ApiProperty()
  public isApiResult = true

  public success(data?: T, message?: string): ApiResult<T> {
    this.status = ApiStatus.SUCCESS
    this.code = HttpStatus.OK
    if (message) {
      this.message = 'OK'
    }
    this.data = data

    return this
  }

  public notModified(data?: T): ApiResult<T> {
    this.status = ApiStatus.SUCCESS
    this.code = HttpStatus.NOT_MODIFIED
    this.message = 'Not Modified'
    this.data = data

    return this
  }

  public setMessage(message: string): ApiResult<T> {
    this.message = message

    return this
  }

  public error(message: string, code: number, errorCode?: string): ApiResult<T> {
    this.status = ApiStatus.ERROR
    this.errorCode = errorCode
    this.message = message
    this.code = code

    return this
  }
}
