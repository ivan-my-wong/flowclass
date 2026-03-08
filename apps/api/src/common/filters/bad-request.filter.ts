import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { isArray, ValidationError } from 'class-validator'
import { Response } from 'express'

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  constructor(public reflector: Reflector) {}

  catch(exception: BadRequestException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    let statusCode = exception.getStatus()
    const r = exception.getResponse() as any

    if (isArray(r.message) && r.message[0] instanceof ValidationError) {
      statusCode = HttpStatus.UNPROCESSABLE_ENTITY
      const validationErrors = r.message as ValidationError[]

      r.message = validationErrors.map((e: ValidationError) => {
        const constraintArr: Array<any> = []
        if (e.constraints) {
          Object.entries(e.constraints).forEach(([k, v]: [string, string]) => {
            if (v) {
              constraintArr.push(v)
            } else constraintArr.push(k)
          })
        } else if (e.children) {
          this.processNestedError(e, constraintArr)
        } else {
          Logger.error(BadRequestExceptionFilter.name, e)
        }
        return { [e.property]: constraintArr }
      })
    }

    r.statusCode = statusCode
    r.errorCode = HttpStatus[statusCode]
    delete r.error

    response.status(statusCode).json(r)
  }

  processNestedError(e: ValidationError, constraintArr: Array<any>): void {
    e.children.forEach((element: ValidationError, _index: number) => {
      const childConstrainArr: Array<string> = []

      if (element.constraints) {
        let _mess = `${e.property}[${_index}].${element.property}: ${element.value} has rule `
        Object.entries(element.constraints).forEach(([k, v]: [string, string]) => {
          _mess = _mess.concat(k)
          if (v) {
            _mess = _mess.concat(' -> Error: ').concat(v)
          }
        })
        childConstrainArr.push(_mess)
        constraintArr.push(childConstrainArr)
      } else if (element.children) {
        const nestedConstraintArr: Array<any> = []
        this.processNestedError(element, nestedConstraintArr)
        constraintArr.push(nestedConstraintArr)
      }
    })
  }
}
