import { Process, Processor } from '@nestjs/bull'
import { Injectable, Scope } from '@nestjs/common'
import { Job } from 'bull'

import {
  QUEUE_ENROLL_COURSE,
  QUEUE_NAME_BLOCK_TIME,
  QUEUE_NAME_IMPORT_CSV,
} from '@/common/constants'
import { EnrollCoursesService } from '@/domain/service/enroll-courses.service'
import { InvoiceService } from '@/domain/service/invoice.service'
import { StudentOnbService } from '@/domain/service/student-onboard.service'

@Injectable()
@Processor(QUEUE_NAME_IMPORT_CSV)
export class ImportStudentConsumer {
  constructor(private readonly studentOnbService: StudentOnbService) {}

  @Process()
  async handleImportStudent(job: Job) {
    console.log('==== Execute import-student-job ====')
    await this.studentOnbService.handleImportStudent(job.data)
    console.log('==== Completed import-student-job ====!!')
  }
}

@Processor(QUEUE_NAME_BLOCK_TIME)
export class CreateNewInvoiceScheduleConsumer {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Process(QUEUE_NAME_BLOCK_TIME)
  async handleUpdateClassLesson(job: Job) {
    console.log('==== EXECUTE CREATE NEW SCHEDULE FOR INVOICE RENEW ====')
    await this.invoiceService.handleUpdateLessson(job.data)
    console.log('==== EXECUTE CREATE NEW SCHEDULE FOR INVOICE RENEW COMPLETED ====')
  }
}

@Processor({
  name: QUEUE_ENROLL_COURSE,
  scope: Scope.DEFAULT,
})
export class EnrollCourseProcessConsumer {
  constructor(private readonly enrollCourseService: EnrollCoursesService) {}

  @Process()
  async handleEnrollCourse(job: Job) {
    console.log('==== RUNNING JOB ENROLL COURSE ====')
    const {
      createEnrollCourseDto,
      selectedClassMeta,
      currentUser,
      course,
      isCustomised,
      isSendEmail,
      studentData,
    } = job.data
    createEnrollCourseDto.selectedClassMeta = JSON.parse(selectedClassMeta)
    createEnrollCourseDto.studentData = JSON.parse(studentData)
    try {
      const { finalResponse: result } = await this.enrollCourseService.enrollClasses({
        jobId: `ec-${job.id}`,
        createEnrollCourseDto,
        currentUser,
        course: JSON.parse(course),
        isCustomised,
        isSendEmail,
      })
      await job.moveToCompleted(JSON.stringify(result))
    } catch (error) {
      await job.moveToFailed({ message: error.message })
      throw error
    }
  }
}
