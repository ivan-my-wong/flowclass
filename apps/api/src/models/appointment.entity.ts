import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm'
import { Repository } from 'typeorm'

import { CreateWithClassAppointmentDTO } from '@/application/admin/courses/dto/appointment.dto'
import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

import { Availability } from './availability.entity'
import { ClassEntity } from './classes.entity'
import { Institution } from './institutions.entity'

export enum BookingConditionType {
  DAYS_INTO_FUTURE = 'days_into_future',
  WITHIN_DATE_RANGE = 'within_date_range',
  INDEFINITELY_INTO_FUTURE = 'indefinitely_into_future',
}
export class BookingCondition {
  @IsEnum(BookingConditionType)
  type: BookingConditionType

  @IsNumber()
  @IsOptional()
  hoursIntoFuture?: number

  @IsOptional()
  @IsDateString()
  withinDateRangeStartTime?: string | null // yyyy-MM-dd - yyyy-MM-dd

  @IsOptional()
  @IsDateString()
  withinDateRangeEndTime?: string | null // yyyy-MM-dd - yyyy-MM-dd

  @IsOptional()
  @IsBoolean()
  indefinitelyIntoFuture?: boolean | null

  static example = {
    type: 'days_into_future | within_date_range',
    daysIntoFuture: 60,
    withinDateRangeStartTime: '2023-05-14',
    withinDateRangeEndTime: '2023-06-15',
    indefinitelyIntoFuture: true,
  }
}

enum ConditionType {
  DAY = 'day_after_booking',
  DATE = 'certain_date',
}

export class ExpireCondition {
  @IsNotEmpty()
  @IsEnum(ConditionType)
  type: ConditionType // day_after_booking | certain_date

  @IsNotEmpty()
  daysAfterBooking: number

  @IsNotEmpty()
  @IsDateString()
  @IsOptional()
  certainExpireDate?: string | null // yyyy-MM-dd

  static example = {
    type: ConditionType.DAY + ' | ' + ConditionType.DATE,
    daysAfterBooking: 60,
    certainExpireDate: 'yyyy-MM-dd',
  }
}

@Entity('appointment')
export class Appointment extends BaseEntity {
  @Index('IX_availability_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'class_id' })
  classId: number

  @Column({ name: 'availability_id', nullable: true })
  availabilityId: number

  @Column({ name: 'need_confirm', default: false })
  needConfirm: boolean

  @Column('jsonb', { name: 'booking_condition', nullable: true })
  bookingCondition: BookingCondition

  @Column({ name: 'buffer_before_minutes', nullable: true })
  bufferBeforeMinutes: number

  @Column({ name: 'buffer_after_minutes', nullable: true })
  bufferAfterMinutes: number

  @Column({ name: 'daily_limit', nullable: true })
  dailyLimit: number

  @Column({ name: 'duration_minutes', nullable: true })
  durationMinutes: number

  @Column({ name: 'gap_between_appointments_minutes', nullable: true })
  gapBetweenAppointmentsMinutes: number

  @Column({ name: 'minimum_notice_minutes', nullable: true })
  minimumNoticeMinutes: number

  @Column('jsonb', { name: 'expire_condition', nullable: true })
  expireCondition?: ExpireCondition

  @OneToOne(() => ClassEntity, (classEntity) => classEntity.appointment, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'class_id' })
  class: ClassEntity

  @ManyToOne(() => Institution, (institution) => institution.appointments, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution

  @ManyToOne(() => Availability, (availability) => availability.appointments, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'availability_id' })
  availability: Availability

  getBookingPeriod() {
    if (this.bookingCondition.type === BookingConditionType.DAYS_INTO_FUTURE) {
      const from = new Date()
      const to = new Date(from)
      to.setDate(from.getDate() + this.bookingCondition.hoursIntoFuture - 1)
      to.setUTCHours(23)
      to.setUTCMinutes(59)
      to.setUTCSeconds(59)
      to.setUTCMilliseconds(999)
      return { from, to }
    } else if (this.bookingCondition.type === BookingConditionType.WITHIN_DATE_RANGE) {
      // yyyy-MM-dd - yyyy-MM-dd
      const start = this.bookingCondition.withinDateRangeStartTime
      const end = this.bookingCondition.withinDateRangeEndTime
      const from = new Date(start)
      const to = new Date(end)
      return { from, to }
    }
    return null
  }
}

@Injectable()
export class AppointmentRepository extends BaseAbstractRepository<Appointment> {
  private _repository: Repository<Appointment>

  constructor(
    @InjectRepository(Appointment)
    repository: Repository<Appointment>
  ) {
    super(repository)
    this._repository = repository
  }

  async updateWith(appointment: Appointment, dto: CreateWithClassAppointmentDTO, userId: number) {
    // Remove the availability property from dto to prevent overwriting availabilityId
    const { availability: _availbility, ...appointmentWithoutAvailability } = appointment

    return await this.save({
      ...appointmentWithoutAvailability,
      ...dto,
      availabilityId: dto.availabilityId,
      updatedBy: userId,
    })
  }

  async getAllAppointmentInCourse(courseId: number) {
    return this._repository
      .createQueryBuilder('appointments')
      .where('appointments.courseId = :courseId', {
        courseId,
      })
      .getMany()
  }
}
