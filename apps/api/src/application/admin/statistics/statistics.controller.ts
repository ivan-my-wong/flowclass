import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { InvoiceStatisticsService } from '@/domain/service/invoice-statistics.service'
import { RequireParam, Role } from '@/models/enums/'

import {
  DashboardStatisticsDto,
  DropoutStudentsQueryDto,
  LessonDetailQueryDto,
  LessonListQueryDto,
  StudentCourseDetailsQueryDto,
  StudentStatisticsDto,
} from './dto/statistics.dto'

// =============================================================================
// Statistics Controller
// =============================================================================

@ApiTags('Statistics')
@ApiUnauthorizedResponse({ description: 'User not authenticated' })
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: InvoiceStatisticsService) {}

  // ===========================================================================
  // DASHBOARD STATISTICS
  // ===========================================================================

  /**
   * GET /statistics/dashboard
   *
   * Main dashboard endpoint supporting:
   * - type: 'revenue' | 'student'
   * - filter: 'overview' | 'by-course' | 'by-class' | 'by-instructor' | 'by-student'
   *
   * Examples:
   * - /statistics/dashboard?type=revenue&filter=overview&start=2025-03-01&end=2025-04-01
   * - /statistics/dashboard?type=revenue&filter=by-course&start=2025-03-01&end=2025-04-01
   * - /statistics/dashboard?type=student&filter=overview&start=2025-03-01&end=2025-04-01
   */
  @Get('dashboard')
  @ApiOperation({
    summary: 'Get dashboard statistics (revenue or student)',
    description: `
      Unified endpoint for all dashboard statistics.
      
      Revenue filters: overview, by-course, by-class, by-instructor
      Student filters: overview, by-student, by-instructor
      
      Returns different data structures based on type and filter.
    `,
  })
  @ApiOkResponse({ description: 'Statistics retrieved successfully' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID, RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getDashboard(@Query() query: DashboardStatisticsDto) {
    const { start, end, ...rest } = query

    // Normalize to full month boundaries
    const startDate = this.normalizeToMonthStart(start)
    const endDate = this.normalizeToMonthEnd(end)

    return this.statisticsService.getDashboardStatistics({
      ...rest,
      startDate,
      endDate,
    })
  }

  // ===========================================================================
  // LESSON ENDPOINTS
  // ===========================================================================

  /**
   * GET /statistics/lessons
   *
   * Get paginated list of lessons with revenue calculation
   *
   * Query params:
   * - startDate, endDate: Date range (required)
   * - page, limit: Pagination (default: page=1, limit=20)
   * - courseId, classId, instructorId: Filters (optional)
   * - studentName, lessonId, lessonName: Search (optional)
   */
  @Get('lessons')
  @ApiOperation({
    summary: 'Get paginated lesson list with revenue',
    description: `
      Returns lessons with:
      - Basic info (date, time, course, class, teachers)
      - Student count
      - Total revenue (sum of pay_amount/num_of_lesson for ATTENDED + PAID)
      
      Supports filtering by course, class, instructor, student name.
    `,
  })
  @ApiOkResponse({ description: 'Lesson list retrieved successfully' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID, RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getLessonList(@Query() query: LessonListQueryDto) {
    const { startDate, endDate, ...rest } = query

    return this.statisticsService.getLessonList({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      ...rest,
    })
  }

  /**
   * GET /statistics/lessons/:lessonId
   *
   * Get detailed breakdown for a single lesson
   *
   * Returns:
   * - Lesson metadata (date, time, course, class, instructor)
   * - Student-level breakdown (total value, credit, net payment, attendance, payment status)
   */
  @Get('lessons/:lessonId')
  @ApiOperation({
    summary: 'Get detailed student payments for a lesson',
    description: `
      Per-student breakdown showing:
      - Total Lesson Value = pay_amount / num_of_lesson
      - Credit Applied = used_balance / num_of_lesson
      - Net Payment = Total - Credit
      - Payment Status (PAID/PENDING/etc)
      - Attendance Status (ATTENDED/ABSENT/etc)
    `,
  })
  @ApiOkResponse({ description: 'Lesson detail retrieved successfully' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID, RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getLessonDetail(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Query() query: LessonDetailQueryDto
  ) {
    return this.statisticsService.getLessonDetail({
      lessonId,
      institutionId: query.institutionId,
      siteId: query.siteId,
    })
  }

  // ===========================================================================
  // STUDENT ENDPOINTS
  // ===========================================================================

  /**
   * GET /statistics/students
   *
   * Get student statistics overview
   *
   * Returns:
   * - Summary (active students, new students, dropouts, dropout rate)
   * - Student list with course counts
   */
  @Get('students')
  @ApiOperation({
    summary: 'Get student statistics overview',
    description: `
      Returns:
      - Summary metrics (active, new, dropouts, rate)
      - Student list with:
        - Number of courses (current)
        - New courses (started in period)
        - Dropped courses (no attendance in period)
        - Totally dropped out flag (no current courses)
    `,
  })
  @ApiOkResponse({ description: 'Student statistics retrieved successfully' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID, RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getStudentStats(@Query() query: StudentStatisticsDto) {
    const { start, end, ...rest } = query

    return this.statisticsService.getStudentStatisticsByStudent({
      startDate: new Date(start),
      endDate: new Date(end),
      ...rest,
    })
  }

  /**
   * GET /statistics/students/:studentId/courses
   *
   * Get course enrollment history for a specific student
   *
   * Returns:
   * - Current courses (attended in period)
   * - Dropped courses (no attendance in period)
   */
  @Get('students/:studentId/courses')
  @ApiOperation({
    summary: 'Get course details for a specific student',
    description: `
      Returns:
      - Current courses: courses student attended during period
      - Dropped courses: courses student was enrolled but didn't attend
      
      Each course shows: name, class, instructor, last attendance date
    `,
  })
  @ApiOkResponse({ description: 'Student course details retrieved successfully' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID, RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getStudentCourseDetails(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query() query: StudentCourseDetailsQueryDto
  ) {
    const { start, end, ...rest } = query

    return this.statisticsService.getStudentCourseDetails(studentId, {
      startDate: new Date(start),
      endDate: new Date(end),
      ...rest,
    })
  }

  /**
   * GET /statistics/classes/:classId/dropouts
   *
   * Get list of students who dropped out from a specific class
   *
   * Returns students enrolled but with no attendance during period
   */
  @Get('classes/:classId/dropouts')
  @ApiOperation({
    summary: 'Get dropout students for a specific class',
    description: `
      Returns students who:
      - Were enrolled in the class during period
      - Had NO attendance during period
      
      Shows: name, phone, email, last attendance date
    `,
  })
  @ApiOkResponse({ description: 'Dropout students retrieved successfully' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID, RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getClassDropouts(
    @Param('classId', ParseIntPipe) classId: number,
    @Query() query: DropoutStudentsQueryDto
  ) {
    const { start, end, ...rest } = query

    return this.statisticsService.getDropoutStudents({
      classId,
      startDate: new Date(start),
      endDate: new Date(end),
      ...rest,
    })
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  /**
   * Normalize date to start of month (1st day, 00:00:00)
   */
  private normalizeToMonthStart(dateString: string): Date {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD')
    }
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  /**
   * Normalize date to end of month (1st day of next month, 00:00:00)
   */
  private normalizeToMonthEnd(dateString: string): Date {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD')
    }
    return new Date(date.getFullYear(), date.getMonth() + 1, 1)
  }
}
