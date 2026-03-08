import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import {
  Availability,
  AvailabilityRepository,
  AvailableSchedules,
  DateOverride,
} from '@/models/availability.entity'

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(AvailabilityRepository)
    private readonly availabilityRepository: AvailabilityRepository
  ) {}

  async create(createAvailabilityDto: {
    siteId: number
    institutionId: number
    name: string
  }): Promise<Availability> {
    const availability = this.availabilityRepository.create(createAvailabilityDto)
    return await this.availabilityRepository.save(availability)
  }

  async findAll(): Promise<Availability[]> {
    return await this.availabilityRepository.find()
  }

  async findOne(id: number): Promise<Availability> {
    return await this.availabilityRepository.findOne({
      where: { id },
      relations: {
        appointments: {
          class: {
            course: true,
          },
        },
      },
    })
  }

  async findByInstitution(institutionId: number): Promise<Availability[]> {
    return await this.availabilityRepository.find({
      where: { institutionId },
      relations: ['institution'],
    })
  }

  async findByInstitutionAndUser(institutionId: number, userId: number): Promise<Availability[]> {
    return await this.availabilityRepository.find({
      where: { institutionId, appointments: { class: { instructorId: userId } } },
      relations: {
        institution: true,
        appointments: {
          class: true,
        },
      },
    })
  }

  async findBySite(siteId: number): Promise<Availability[]> {
    return await this.availabilityRepository.find({
      where: { siteId },
      relations: ['institution', 'integrationCalendar'],
    })
  }

  async update(
    id: number,
    updateAvailabilityDto: Partial<{
      availableSchedules: AvailableSchedules[]
      integrationCalendarId: number
      dateOverrides: DateOverride[]
      assignedUserId: number
      name: string
    }>
  ): Promise<Availability> {
    let { availableSchedules, dateOverrides } = updateAvailabilityDto
    availableSchedules = availableSchedules.map((o) => ({ ...o })) as AvailableSchedules[]
    dateOverrides = dateOverrides.map((o) => ({ ...o })) as DateOverride[]
    await this.availabilityRepository.update(id, {
      ...updateAvailabilityDto,
      availableSchedules,
      dateOverrides,
    })
    return await this.findOne(id)
  }

  async remove(id: number): Promise<void> {
    await this.availabilityRepository.delete(id)
  }

  async updateAvailableSchedules(
    id: number,
    availableSchedules: AvailableSchedules[]
  ): Promise<Availability> {
    return await this.update(id, { availableSchedules })
  }

  async updateDateOverrides(id: number, dateOverrides: DateOverride[]): Promise<Availability> {
    return await this.update(id, { dateOverrides })
  }

  async updateIntegrationCalendar(
    id: number,
    integrationCalendarId: number
  ): Promise<Availability> {
    return await this.update(id, { integrationCalendarId })
  }

  async removeIntegrationCalendar(id: number): Promise<Availability> {
    return await this.update(id, { integrationCalendarId: null })
  }
}
