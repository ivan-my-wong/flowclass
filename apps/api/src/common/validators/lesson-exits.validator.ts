import { Injectable, OnModuleInit } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { FindOptionsWhere } from 'typeorm'

import { RegularPeriodsService } from '@/domain/service/regular-periods.service'
import { RegularPeriods } from '@/models/course-regular-periods.entity'

@ValidatorConstraint({ name: 'LessonExists', async: true })
@Injectable()
export class LessonExistsRule implements ValidatorConstraintInterface, OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}
  private regularPeriodsService: RegularPeriodsService

  async onModuleInit() {
    this.regularPeriodsService = await this.moduleRef.create(RegularPeriodsService)
  }

  async validate(value: number) {
    if (value == 0 || value == null) {
      return true
    }

    try {
      await this.regularPeriodsService.getOneOrFail({
        id: value,
      } as FindOptionsWhere<RegularPeriods>)
    } catch (e) {
      console.log(e)
      return false
    }

    return true
  }

  defaultMessage(_args: ValidationArguments) {
    return `Regular Periods doesn't exist`
  }
}
