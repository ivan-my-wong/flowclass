import { Injectable, OnModuleInit } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { FindOptionsWhere } from 'typeorm'

import { SitesService } from '@/domain/service/sites.service'
import { Site } from '@/models/site.entity'

@ValidatorConstraint({ name: 'SiteExists', async: true })
@Injectable()
export class SiteExistsRule implements ValidatorConstraintInterface, OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}
  private sitesService: SitesService

  async onModuleInit() {
    this.sitesService = await this.moduleRef.create(SitesService)
  }

  async validate(value: number) {
    try {
      await this.sitesService.getOneOrFail({
        id: value,
      } as FindOptionsWhere<Site>)
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
