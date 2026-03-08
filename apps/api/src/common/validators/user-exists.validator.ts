import { Injectable, OnModuleInit } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { FindOptionsWhere } from 'typeorm'

import { UsersService } from '@/domain/service/users.service'
import { User } from '@/models/user.entity'

@ValidatorConstraint({ name: 'UserExists', async: true })
@Injectable()
export class UserExistsRule implements ValidatorConstraintInterface, OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}
  private usersService: UsersService

  async onModuleInit() {
    this.usersService = await this.moduleRef.create(UsersService)
  }

  async validate(value: number) {
    if (value == 0) {
      return true
    }

    try {
      await this.usersService.getOneOrFail({
        id: value,
      } as FindOptionsWhere<User>)
    } catch (e) {
      console.log(e)
      return false
    }

    return true
  }

  defaultMessage(_args: ValidationArguments) {
    return `User doesn't exist`
  }
}
