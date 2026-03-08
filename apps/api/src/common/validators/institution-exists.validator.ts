import { Injectable, OnModuleInit } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { FindOptionsWhere } from 'typeorm'

import { InstitutionsService } from '@/domain/service/institutions.service'
import { Institution } from '@/models/institutions.entity'

@ValidatorConstraint({ name: 'InstitutionExists', async: true })
@Injectable()
export class InstitutionExistsRule implements ValidatorConstraintInterface, OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}
  private institutionsService: InstitutionsService

  async onModuleInit() {
    this.institutionsService = await this.moduleRef.create(InstitutionsService)
  }

  async validate(value: number) {
    if (value == 0) {
      return true
    }

    try {
      await this.institutionsService.getOneOrFail({
        id: value,
      } as FindOptionsWhere<Institution>)
    } catch (e) {
      console.log(e)
      return false
    }

    return true
  }

  defaultMessage(_args: ValidationArguments) {
    return `Institution doesn't exist`
  }
}
