import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { ArrayMinSize, IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator'
import Stripe from 'stripe'

import { StripeWebhookResponse } from '../admin/stripe-connect/dto/stripe-connect.dto'

import { DataMigrationService } from './data-migration.service'

class SeparateSharedUsersDto {
  @IsOptional()
  @IsNumber()
  institutionId?: number

  @IsOptional()
  @IsNumber()
  userId?: number

  @IsOptional()
  @IsBoolean()
  dryRun?: boolean = false

  @IsString()
  accessToken: string
}

class MergeClassLessonsDto {
  @IsArray()
  @ArrayMinSize(2, { message: 'At least 2 class lesson IDs are required' })
  @IsNumber({}, { each: true })
  classLessonIds: number[]

  @IsOptional()
  @IsBoolean()
  dryRun?: boolean = false

  @IsString()
  accessToken: string
}

class AddStudentLessonsForClassLessonDto {
  @IsNumber()
  periodId: number

  @IsNumber()
  classLessonId: number
}

@Controller('migration')
@ApiTags('Data Migration')
export class DataMigrationController {
  constructor(private readonly dataMigrationService: DataMigrationService) {}

  /**
   * Validate migration password
   */
  private validateMigrationPassword(password: string): void {
    const validPassword = process.env.FLOWCLASS__API_TOKEN

    if (!validPassword) {
      throw new UnauthorizedException('FLOWCLASS__API_TOKEN not configured')
    }

    if (!password || password !== validPassword) {
      throw new UnauthorizedException('Invalid password for data migration operations')
    }
  }

  @Get('run')
  @ApiOperation({
    summary: 'Run migration',
    description: 'Run various migration tasks',
  })
  @ApiQuery({
    name: 'password',
    required: true,
    description: 'Data migration password',
    type: String,
  })
  async runMigration(@Query('password') password: string): Promise<boolean> {
    this.validateMigrationPassword(password)

    // await this.dataMigrationService.migrateAppointment();

    await this.dataMigrationService.migratePeriodsToRepeatFormats()
    return true
  }

  @Get('run-enroll')
  @ApiOperation({
    summary: 'Run enrollment migration',
    description: 'Run enrollment-related migration tasks',
  })
  @ApiQuery({
    name: 'password',
    required: true,
    description: 'Data migration password',
    type: String,
  })
  async runEnrollMigration(@Query('password') password: string): Promise<boolean> {
    this.validateMigrationPassword(password)

    // await this.dataMigrationService.migrateAppointment();

    await this.dataMigrationService.migrateEnrollCoursesPayLaterMethodToInvoice()
    await this.dataMigrationService.migrateEnrollCoursesSessionIdToClassId()
    await this.dataMigrationService.copyCourseTypeToClassesType()
    return true
  }

  @Get('run-event')
  @ApiOperation({
    summary: 'Run event migration',
    description: 'Run event-related migration tasks',
  })
  @ApiQuery({
    name: 'password',
    required: true,
    description: 'Data migration password',
    type: String,
  })
  async runEventMigration(@Query('password') password: string): Promise<boolean> {
    this.validateMigrationPassword(password)

    // await this.dataMigrationService.migrateAppointment();

    await this.dataMigrationService.copyEventSessionToClassesAndAddPeriod()
    return true
  }

  @Get('run-repeat')
  @ApiOperation({
    summary: 'Run repeat format migration',
    description: 'Run repeat format migration tasks',
  })
  @ApiQuery({
    name: 'password',
    required: true,
    description: 'Data migration password',
    type: String,
  })
  async runRepeatFormatMigration(@Query('password') password: string): Promise<boolean> {
    this.validateMigrationPassword(password)

    await this.dataMigrationService.convertRecurringToRepeatFormat()
    return true
  }

  @Get('run-student')
  @ApiOperation({
    summary: 'Run student schedule migration',
    description: 'Run student schedule migration tasks',
  })
  @ApiQuery({
    name: 'password',
    required: true,
    description: 'Data migration password',
    type: String,
  })
  async runStudentScheduleMigration(@Query('password') password: string): Promise<boolean> {
    this.validateMigrationPassword(password)

    await this.dataMigrationService.convertSessionIdToPeriodIdStudentSchedule()
    await this.dataMigrationService.convertStudentScheduleFirstScheduleToStudentLesson()
    return true
  }

  @Get('run-coupon')
  @ApiOperation({
    summary: 'Run coupon migration',
    description: 'Run coupon-related migration tasks',
  })
  @ApiQuery({
    name: 'password',
    required: true,
    description: 'Data migration password',
    type: String,
  })
  async runCouponMigration(@Query('password') password: string): Promise<boolean> {
    this.validateMigrationPassword(password)

    await this.dataMigrationService.saveCouponUsedRecordLog()
    return true
  }

  @Get('send-reminder-email')
  @ApiOperation({
    summary: 'Send reminder email',
    description: 'Send reminder emails',
  })
  @ApiQuery({
    name: 'password',
    required: true,
    description: 'Data migration password',
    type: String,
  })
  async sendReminderEmail(@Query('password') password: string): Promise<boolean> {
    this.validateMigrationPassword(password)

    await this.dataMigrationService.sendReminderEmail()
    return true
  }

  @Get('import-company-data')
  @ApiOperation({
    summary: 'Import company data',
    description: 'Import company data from external source',
  })
  @ApiQuery({
    name: 'password',
    required: true,
    description: 'Data migration password',
    type: String,
  })
  async importCompanyData(@Query('password') password: string): Promise<boolean> {
    this.validateMigrationPassword(password)

    await this.dataMigrationService.importCompanyData()
    return true
  }

  @Get('export-attendance-data')
  @ApiOperation({
    summary: 'Export attendance data',
    description: 'Export attendance data to external format',
  })
  @ApiQuery({
    name: 'password',
    required: true,
    description: 'Data migration password',
    type: String,
  })
  async exportAttendanceData(@Query('password') password: string): Promise<boolean> {
    this.validateMigrationPassword(password)

    await this.dataMigrationService.exportAttendanceData()
    return true
  }

  @ApiOperation({
    summary: 'Test Redis Connection',
  })
  @Get('test-redis-connection')
  @ApiQuery({
    name: 'password',
    required: true,
    description: 'Data migration password',
    type: String,
  })
  async testRedisConnection(@Query('password') password: string): Promise<any> {
    this.validateMigrationPassword(password)

    return await this.dataMigrationService.checkRedisConnection()
  }

  @Get('run-form-fields')
  @ApiOperation({
    summary: 'Run form fields migration',
    description: 'Run form fields migration tasks',
  })
  @ApiQuery({
    name: 'password',
    required: true,
    description: 'Data migration password',
    type: String,
  })
  async runFormFields(@Query('password') password: string): Promise<boolean> {
    this.validateMigrationPassword(password)

    await this.dataMigrationService.runFormFields()
    return true
  }

  @Post('test-stripe-webhook-complete-payment')
  @ApiOperation({
    summary: 'Test Stripe webhook complete payment',
    description: 'Test Stripe webhook for complete payment',
  })
  @ApiQuery({
    name: 'password',
    required: true,
    description: 'Data migration password',
    type: String,
  })
  @ApiBody({
    type: StripeWebhookResponse,
  })
  async testStripeWebhookCompletePayment(
    @Query('password') password: string,
    @Query('connectAccountId') connectAccountId: string,
    @Body() body: Stripe.Checkout.Session
  ): Promise<boolean> {
    this.validateMigrationPassword(password)

    await this.dataMigrationService.testStripeWebhookCompletePayment(connectAccountId, body)
    return true
  }

  @Post('separate-shared-users')
  @ApiOperation({
    summary: 'Separate shared users',
    description:
      'Separate a user with multiple UserAlias into independent users. This operation will create new users for each additional UserAlias and update all related records.',
  })
  @ApiBody({
    type: SeparateSharedUsersDto,
    description: 'Separate shared users request parameters',
    examples: {
      example1: {
        summary: 'Test mode - specific institution/user',
        value: {
          institutionId: 1198,
          userId: 6660,
          dryRun: true,
          accessToken: 'your-access-token-here',
        },
      },
      example2: {
        summary: 'Actual execution - specific institution/user',
        value: {
          institutionId: 1198,
          userId: 6660,
          dryRun: false,
          accessToken: 'your-access-token-here',
        },
      },
      example3: {
        summary: 'Actual execution - all institutions',
        value: {
          dryRun: false,
          accessToken: 'your-access-token-here',
        },
      },
    },
  })
  async separateSharedUsers(@Body() body: SeparateSharedUsersDto): Promise<{
    success: boolean
    message: string
    data: {
      processed: number
      created: number
      errors: Array<{ userAliasId: number; error: string }>
    }
  }> {
    console.log('Received body:', body)
    console.log('Access token:', body.accessToken)
    console.log('Token type:', typeof body.accessToken)
    this.validateAccessToken(body.accessToken)

    try {
      const result = await this.dataMigrationService.separateSharedUsers(
        body.institutionId,
        body.userId,
        body.dryRun ?? false
      )

      const mode = body.dryRun ? 'DRY RUN' : 'EXECUTION'
      const scope = this.buildScopeDescription(body.institutionId, body.userId)

      return {
        success: true,
        message: `[${mode}] Successfully processed shared users for ${scope}`,
        data: result,
      }
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: `Failed to separate shared users: ${error.message}`,
        data: {
          processed: 0,
          created: 0,
          errors: [],
        },
      })
    }
  }

  /**
   * Build scope description for logging and response messages
   */
  private buildScopeDescription(institutionId?: number, userId?: number): string {
    const parts: string[] = []

    if (userId) {
      parts.push(`User ${userId}`)
    } else {
      parts.push('All users')
    }

    if (institutionId) {
      parts.push(`in Institution ${institutionId}`)
    }

    return parts.join(' ')
  }

  /**
   * validate access token
   */
  private validateAccessToken(accessToken: string): void {
    // get valid access tokens from environment variables
    const validTokens = (process.env.FLOWCLASS__API_TOKEN || '')
      .split(',')
      .filter((token) => token.trim())

    if (!validTokens.length) {
      throw new UnauthorizedException('Data migration access tokens not configured')
    }

    if (!accessToken || !validTokens.includes(accessToken.trim())) {
      throw new UnauthorizedException('Invalid access token for data migration operations')
    }
  }

  @Get('debug-user-aliases')
  @ApiOperation({
    summary: 'Debug user aliases',
    description: 'Debug endpoint to check specific user aliases data',
  })
  @ApiQuery({
    name: 'password',
    required: true,
    description: 'Data migration password',
    type: String,
  })
  @ApiQuery({
    name: 'accessToken',
    required: true,
    description: 'Access token',
    type: String,
  })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'User ID to debug',
    type: Number,
  })
  @ApiQuery({
    name: 'institutionId',
    required: false,
    description: 'Institution ID filter',
    type: Number,
  })
  async debugUserAliases(
    @Query('password') password: string,
    @Query('accessToken') accessToken: string,
    @Query('userId') userIdStr: string,
    @Query('institutionId') institutionIdStr?: string
  ): Promise<{
    success: boolean
    data: {
      userId: number
      totalAliases: number
      aliasesByInstitution: Array<{
        institutionId: number
        aliasCount: number
        aliases: Array<{
          id: number
          name: string
          phone: string | null
          institutionId: number
        }>
      }>
      queryUsed: string
    }
  }> {
    this.validateMigrationPassword(password)
    this.validateAccessToken(accessToken)

    const userId = parseInt(userIdStr, 10)
    const institutionId = institutionIdStr ? parseInt(institutionIdStr, 10) : undefined

    if (isNaN(userId)) {
      throw new BadRequestException('Invalid userId: must be a number')
    }
    if (institutionIdStr && isNaN(institutionId!)) {
      throw new BadRequestException('Invalid institutionId: must be a number')
    }

    try {
      const result = await this.dataMigrationService.debugUserAliases(userId, institutionId)
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: `Failed to debug user aliases: ${error.message}`,
      })
    }
  }

  @Post('merge-class-lessons')
  @ApiOperation({
    summary: 'Merge multiple ClassLesson records',
    description:
      'Merge multiple ClassLesson records into one. The first ClassLesson ID in the array will be kept as the primary record, and all related StudentLesson records will be updated to reference the primary record. Other ClassLesson records will be deleted.',
  })
  @ApiBody({
    type: MergeClassLessonsDto,
    description: 'Merge ClassLessons request parameters',
    examples: {
      example1: {
        summary: 'Test mode - merge 3 class lessons',
        value: {
          classLessonIds: [10759, 10974],
          dryRun: true,
          accessToken: 'your-access-token-here',
        },
      },
      example2: {
        summary: 'Actual execution - merge 2 class lessons',
        value: {
          classLessonIds: [10759, 10974],
          dryRun: false,
          accessToken: 'your-access-token-here',
        },
      },
    },
  })
  async mergeClassLessons(@Body() body: MergeClassLessonsDto): Promise<{
    success: boolean
    message: string
    data: {
      primaryClassLessonId: number
      mergedClassLessonIds: number[]
      updatedStudentLessonsCount: number
      deletedClassLessonsCount: number
      errors: Array<{ classLessonId: number; error: string }>
    }
  }> {
    console.log('Received merge ClassLessons request:', body)
    this.validateAccessToken(body.accessToken)

    try {
      const result = await this.dataMigrationService.mergeClassLessons(
        body.classLessonIds,
        body.dryRun ?? false
      )

      const mode = body.dryRun ? 'DRY RUN' : 'EXECUTION'

      return {
        success: true,
        message: `[${mode}] Successfully merged ClassLessons [${body.classLessonIds.join(
          ', '
        )}] into primary ClassLesson ${result.primaryClassLessonId}`,
        data: {
          primaryClassLessonId: result.primaryClassLessonId,
          mergedClassLessonIds: result.mergedClassLessonIds,
          updatedStudentLessonsCount: result.updatedStudentLessonsCount,
          deletedClassLessonsCount: result.deletedClassLessonsCount,
          errors: result.errors,
        },
      }
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: `Failed to merge ClassLessons: ${error.message}`,
        data: {
          primaryClassLessonId: 0,
          mergedClassLessonIds: [],
          updatedStudentLessonsCount: 0,
          deletedClassLessonsCount: 0,
          errors: [{ classLessonId: 0, error: error.message }],
        },
      })
    }
  }

  @Get('combine-user-aliases-with-same-email-patterns')
  @ApiOperation({
    summary: 'Combine user aliases with same email patterns',
    description: 'Combine user aliases that have the same email patterns (+1, +2, etc.)',
  })
  @ApiQuery({
    name: 'password',
    required: true,
    description: 'Data migration password',
    type: String,
  })
  async combineUserAliasesWithSameEmailPatterns(@Query('password') password: string): Promise<{
    success: boolean
    message: string
    data: {
      consolidated: number
      skipped: number
      total: number
    }
  }> {
    this.validateMigrationPassword(password)

    try {
      const result = await this.dataMigrationService.combineUserAliasesWithSameEmailPatterns()

      return {
        success: true,
        message: 'Successfully combined user aliases with same email patterns',
        data: result,
      }
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: `Failed to combine user aliases with same email patterns: ${error.message}`,
        data: {
          consolidated: 0,
          skipped: 0,
          total: 0,
        },
      })
    }
  }

  @Get('combine-user-aliases-with-same-name')
  @ApiOperation({
    summary: 'Combine user aliases with same name',
    description: 'Combine user aliases that have the same name (case-insensitive)',
  })
  @ApiQuery({
    name: 'password',
    required: true,
    description: 'Data migration password',
    type: String,
  })
  async combineUserAliasesWithSameName(@Query('password') password: string): Promise<{
    success: boolean
    message: string
    data: {
      consolidated: number
      skipped: number
      total: number
    }
  }> {
    this.validateMigrationPassword(password)

    try {
      const result = await this.dataMigrationService.combineUserAliasesWithSameName()

      return {
        success: true,
        message: 'Successfully combined user aliases with same names',
        data: result,
      }
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: `Failed to combine user aliases with same names: ${error.message}`,
        data: {
          consolidated: 0,
          skipped: 0,
          total: 0,
        },
      })
    }
  }

  @Get('fix-invoice-applicants-array')
  @ApiOperation({
    summary: 'Fix applicants array in invoices',
    description:
      'Check and fix the applicants array in invoices table by replacing the closest ID with the correct user_id',
  })
  @ApiQuery({
    name: 'password',
    required: true,
    description: 'Data migration password',
    type: String,
  })
  async fixInvoiceApplicantsArray(@Query('password') password: string): Promise<{
    success: boolean
    message: string
    data: {
      fixed: number
      skipped: number
      errors: number
      total: number
    }
  }> {
    this.validateMigrationPassword(password)

    try {
      const result = await this.dataMigrationService.fixInvoiceApplicantsArray()

      return {
        success: true,
        message: 'Successfully fixed applicants array in invoices',
        data: result,
      }
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: `Failed to fix applicants array in invoices: ${error.message}`,
        data: {
          fixed: 0,
          skipped: 0,
          errors: 0,
          total: 0,
        },
      })
    }
  }

  @Get('cleanup-duplicate-user-aliases')
  @ApiOperation({
    summary: 'Cleanup duplicate user aliases',
    description:
      'Remove duplicate user_aliases (multiple user_aliases for the same user_id in the same institution) while keeping the one with the most activity',
  })
  @ApiQuery({
    name: 'password',
    required: true,
    description: 'Data migration password',
    type: String,
  })
  async cleanupDuplicateUserAliases(@Query('password') password: string): Promise<{
    success: boolean
    message: string
    data: {
      totalGroups: number
      duplicatesFound: number
      deletedCount: number
      errors: number
    }
  }> {
    this.validateMigrationPassword(password)

    try {
      const result = await this.dataMigrationService.cleanupDuplicateUserAliases()

      return {
        success: true,
        message: 'Successfully cleaned up duplicate user aliases',
        data: result,
      }
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: `Failed to cleanup duplicate user aliases: ${error.message}`,
        data: {
          totalGroups: 0,
          duplicatesFound: 0,
          deletedCount: 0,
          errors: 0,
        },
      })
    }
  }

  @Get('send-new-account-created')
  @ApiOperation({
    summary: 'Send new account created',
    description: 'Send new account created',
  })
  @ApiQuery({
    name: 'password',
    required: true,
    description: 'Data migration password',
    type: String,
  })
  async sendNewAccountCreated(@Query('password') password: string): Promise<boolean> {
    this.validateMigrationPassword(password)

    return true
  }

  @Get('add-student-lessons-for-class-lesson')
  @ApiOperation({
    summary: 'Add student lessons for class lesson',
    description:
      "Get all student_schedules with the specified period_id, and for each one that doesn't have a student_lesson with the given classLessonId, create a student_lesson with the same start_time and end_time as the class lesson. Then update the first_student_lesson_id of the student_schedule.",
  })
  @ApiQuery({
    name: 'periodId',
    required: true,
    description: 'Period ID',
    type: Number,
  })
  @ApiQuery({
    name: 'classLessonId',
    required: true,
    description: 'Class lesson ID',
    type: Number,
  })
  @ApiQuery({
    name: 'accessToken',
    required: true,
    description: 'Access token',
    type: String,
  })
  async addStudentLessonsForClassLesson(
    @Query('periodId') periodId: number,
    @Query('classLessonId') classLessonId: number,
    @Query('accessToken') accessToken: string
  ): Promise<{
    success: boolean
    message: string
    data: {
      createdCount: number
      studentSchedulesProcessed: number
      updatedFirstLessonIds: number
      errors: Array<{ studentScheduleId: number; error: string }>
    }
  }> {
    console.log('Received add student lessons for class lesson request:', {
      periodId,
      classLessonId,
    })
    this.validateAccessToken(accessToken)

    try {
      const result = await this.dataMigrationService.addStudentLessonsForClassLesson(
        periodId,
        classLessonId
      )

      return {
        success: true,
        message: `Successfully added student lessons for class lesson ${classLessonId}`,
        data: result,
      }
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: `Failed to add student lessons for class lesson: ${error.message}`,
        data: {
          createdCount: 0,
          studentSchedulesProcessed: 0,
          updatedFirstLessonIds: 0,
          errors: [],
        },
      })
    }
  }
}
