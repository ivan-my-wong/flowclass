import { Injectable, NotFoundException } from '@nestjs/common'
import * as dayjs from 'dayjs'
import { LessThanOrEqual, MoreThan, MoreThanOrEqual } from 'typeorm'

import { LocationRoomDto } from '@/application/admin/location-room/dto/location-room.dto'
import { ClassLessonRepository } from '@/models/class-lesson.repository'
import {
  LocationRoom,
  LocationRoomWithQuotaTimeSlot,
  QuotaTimeSlots,
} from '@/models/location-room.entity'
import { LocationRoomRepository } from '@/models/location-room.repository'
import { StudentLessonRepository } from '@/models/student-lesson.repository'

@Injectable()
export class LocationRoomService {
  constructor(
    private readonly locationRoomRepository: LocationRoomRepository,
    private readonly studentLessonsRepository: StudentLessonRepository,
    private readonly classLessonRepository: ClassLessonRepository
  ) {}
  async createLocationRoom(
    institutionId: number,
    siteId: number,
    locationRoomDto: LocationRoomDto
  ): Promise<LocationRoom> {
    const locationRoom = this.locationRoomRepository.create({
      ...locationRoomDto,
      institutionId,
      siteId,
    })
    return this.locationRoomRepository.save(locationRoom)
  }
  async findAllLocationRooms(institutionId: number, siteId: number): Promise<LocationRoom[]> {
    return this.locationRoomRepository.findAll({
      where: {
        institutionId,
        siteId,
      },
    })
  }
  async findLocationGroupAndEquipment(
    institutionId: number,
    siteId: number
  ): Promise<{ locationGroups: string[]; equipment: string[] }> {
    const locationGroups = await this.locationRoomRepository.findAll({
      where: {
        institutionId,
        siteId,
      },
      select: {
        locationGroups: true,
        equipment: true,
      },
    })
    return {
      locationGroups: Array.from(
        new Set(locationGroups.map((locationRoom) => locationRoom.locationGroups).flat())
      ),
      equipment: Array.from(
        new Set(locationGroups.map((locationRoom) => locationRoom.equipment).flat())
      ),
    }
  }
  async findLocationRoomById(
    institutionId: number,
    siteId: number,
    locationRoomId: number
  ): Promise<LocationRoom> {
    const locationRoom = await this.locationRoomRepository.findOne({
      where: {
        institutionId,
        siteId,
        id: locationRoomId,
      },
    })
    if (!locationRoom) {
      throw new NotFoundException('Location room not found')
    }
    return locationRoom
  }
  async updateLocationRoom(
    locationRoomId: number,
    locationRoomDto: LocationRoomDto,
    institutionId: number,
    siteId: number
  ): Promise<LocationRoom> {
    const updateResult = await this.locationRoomRepository.update(
      {
        id: locationRoomId,
        institutionId,
        siteId,
      },
      locationRoomDto
    )
    if (updateResult.affected === 0) {
      throw new NotFoundException('Location room not found')
    }
    return this.locationRoomRepository.findOne({
      where: {
        id: locationRoomId,
        institutionId,
        siteId,
      },
    })
  }
  async deleteLocationRoom(
    locationRoomId: number,
    institutionId: number,
    siteId: number
  ): Promise<void> {
    const deleteResult = await this.locationRoomRepository.softDelete({
      id: locationRoomId,
      institutionId,
      siteId,
    })
    if (deleteResult.affected === 0) {
      throw new NotFoundException('Location room not found')
    }
  }

  async getLocationRoomQuota(
    institutionId: number,
    siteId: number,
    locationRoomId: number
  ): Promise<LocationRoomWithQuotaTimeSlot> {
    const now = dayjs().toDate()
    const locationRoom = await this.findLocationRoomById(institutionId, siteId, locationRoomId)
    const capacity = locationRoom.capacity
    const studentLessons = await this.studentLessonsRepository.find({
      where: [
        {
          institutionId,
          classLesson: { locationId: locationRoomId, startTime: MoreThan(now) },
        },
        {
          institutionId,
          classLesson: { locationId: locationRoomId, changeStartTime: MoreThan(now) },
        },
      ],
      relations: {
        classLesson: true,
      },
    })
    // Group classLesson by startTime or changeStartTime
    const groupedByTime = studentLessons.reduce((acc, studentLesson) => {
      const timeKey = studentLesson.changeStartTime
        ? [
            studentLesson.changeStartTime.toISOString(),
            studentLesson.changeEndTime.toISOString(),
          ].join(' ')
        : [studentLesson.startTime.toISOString(), studentLesson.endTime.toISOString()].join(' ')

      if (!acc[timeKey]) {
        acc[timeKey] = {
          studentIds: [studentLesson.userId],
          quota: capacity ?? 0,
          quotaUsage: 1,
        }
      }
      const isUserIdExist = acc[timeKey].studentIds.includes(studentLesson.userId)
      if (!isUserIdExist) {
        acc[timeKey].studentIds.push(studentLesson.userId)
        acc[timeKey].quotaUsage += 1
      }
      return acc
    }, {} as Record<string, QuotaTimeSlots>)
    return {
      timeSlotQuota: groupedByTime,
    }
  }

  async getLocationRoomQuotaStudent(
    institutionId: number,
    siteId: number,
    locationRoomId: number
  ): Promise<LocationRoomWithQuotaTimeSlot> {
    const now = dayjs().toDate()
    const locationRoom = await this.findLocationRoomById(institutionId, siteId, locationRoomId)
    const capacity = locationRoom.capacity

    const classLessons = await this.classLessonRepository.find({
      where: [
        { locationId: locationRoomId, startTime: MoreThan(now) },
        { locationId: locationRoomId, changeStartTime: MoreThan(now) },
      ],
      relations: ['studentLessons'],
    })

    const groupedByTime = classLessons.reduce((acc, classLesson) => {
      const timeKey = classLesson.changeStartTime
        ? [classLesson.changeStartTime.toISOString(), classLesson.changeEndTime.toISOString()].join(
            ' '
          )
        : [classLesson.startTime.toISOString(), classLesson.endTime.toISOString()].join(' ')

      const totalStudentsInLesson = classLesson.studentLessons.length
      const fractionalUsage = totalStudentsInLesson > 0 ? 1 / totalStudentsInLesson : 0

      const roundedUsage = Math.ceil(fractionalUsage * totalStudentsInLesson)

      if (!acc[timeKey]) {
        acc[timeKey] = {
          studentIds: [],
          quota: capacity ?? 0,
          quotaUsage: 0,
        }
      }

      acc[timeKey].quotaUsage += roundedUsage

      const studentIds = classLesson.studentLessons.map((sl) => sl.userId)
      acc[timeKey].studentIds = [...new Set([...acc[timeKey].studentIds, ...studentIds])]

      return acc
    }, {} as Record<string, QuotaTimeSlots>)

    return {
      timeSlotQuota: groupedByTime,
    }
  }

  async getLocationRoomUsageInRange(
    locationId: number,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Fetch all studentLessons that overlap with [startDate, endDate] in this location
    const studentLessons = await this.studentLessonsRepository.find({
      where: [
        // Case 1: Original schedule overlaps
        {
          classLesson: {
            locationId,
            startTime: LessThanOrEqual(endDate),
            endTime: MoreThanOrEqual(startDate),
          },
        },
        // Case 2: Rescheduled (changeStartTime) overlaps
        {
          classLesson: {
            locationId,
            changeStartTime: LessThanOrEqual(endDate),
            changeEndTime: MoreThanOrEqual(startDate),
          },
        },
      ],
      relations: {
        classLesson: true,
      },
    })

    // Deduplicate by userId — same student in multiple lessons? Count once.
    const uniqueStudentIds = new Set<number>()

    for (const sl of studentLessons) {
      // Determine effective start/end time
      const effectiveStart = sl.classLesson.changeStartTime || sl.classLesson.startTime
      const effectiveEnd = sl.classLesson.changeEndTime || sl.classLesson.endTime

      // Double-check overlap (in case ORM didn't filter perfectly)
      if (effectiveStart <= endDate && effectiveEnd >= startDate) {
        uniqueStudentIds.add(sl.userId)
      }
    }

    return uniqueStudentIds.size
  }
}
