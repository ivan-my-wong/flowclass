import { Injectable, NotFoundException } from '@nestjs/common'
import * as AdmZip from 'adm-zip'
import * as dayjs from 'dayjs'
import {
  FindOptionsRelations,
  FindOptionsWhere,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

import {
  FILE_TYPE_MAP,
  TypeSupported,
} from '@/application/admin/class-materials/dto/class-materials.dto'
import {
  MaterialSearchParamsDto,
  PaginationParamsDto,
} from '@/application/admin/class-materials/dto/search-params.dto'
import { BulkUploadTeacherFeedbackDto } from '@/application/admin/student-submission/dto/student-submission.dto'
import { StudentMaterialsDto } from '@/application/student/student-submission/dto/student-submission.dto'
import { ErrorCode } from '@/exceptions/error-message/errors'
import { ClassLessonRepository } from '@/models/class-lesson.repository'
import { ClassLesson } from '@/models/class-lessons.entity'
import { ClassMediaMaterialsRepository } from '@/models/class-media-materials.repository'
import { ClassEntity } from '@/models/classes.entity'
import { ClassRepository } from '@/models/classes.repository'
import { SendTeacherUploadedSubmissionFeedback } from '@/models/custom-types/email-params'
import {
  ClassLessonWithStudentLessons,
  StudentLessonWithUserAlias,
} from '@/models/custom-types/student-lessons'
import { EnrollCourseRepository } from '@/models/enroll-courses.repository'
import { Institution } from '@/models/institutions.entity'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { StudentLesson } from '@/models/student-lesson.entity'
import { StudentLessonRepository } from '@/models/student-lesson.repository'
import { StudentSubmissions } from '@/models/student-submission.entity'
import { StudentSubmissionRepository } from '@/models/student-submission.repository'
import { TeacherFeedbackRepository } from '@/models/teacher-feedback.repository'
import { UserAlias } from '@/models/user-aliases.entity'
import { UserAliasesRepository } from '@/models/user-aliases.repository'
import { shallow } from '@/utils/shallow.utils'

import { EmailService } from '../external/email.service'
import { GoogleDriveFile, IntegrationGoogleService } from '../external/integration-google.service'
import { UploadProgressService } from '../external/upload-progress'

import { UserRolesService } from './user-roles.service'
import { WhatsappWebService } from './whatsapp-web.service'

@Injectable()
export class StudentSubmissionService {
  constructor(
    private readonly uploadProgressService: UploadProgressService,
    private readonly institutionRepository: InstitutionsRepository,
    private readonly userRoleService: UserRolesService,
    private readonly studentLessonRepository: StudentLessonRepository,
    private readonly integrationGoogleService: IntegrationGoogleService,
    private readonly classMediaMaterialsRepository: ClassMediaMaterialsRepository,
    private readonly studentSubmissionRepository: StudentSubmissionRepository,
    private readonly teacherFeedbackRepository: TeacherFeedbackRepository,
    private readonly userAliasRepository: UserAliasesRepository,
    private readonly classLessonRepository: ClassLessonRepository,
    private readonly emailService: EmailService,
    private readonly whatsappWebService: WhatsappWebService,
    private readonly enrollCourseRepository: EnrollCourseRepository,
    private readonly classRepository: ClassRepository
  ) {}
  async getMaterialsList(
    institutionId: number,
    params: MaterialSearchParamsDto & PaginationParamsDto
  ) {
    const { search, lessonIds, classIds, startDate, endDate, page = 1, limit = 20 } = params
    const where: FindOptionsWhere<StudentSubmissions> = {
      studentLesson: {
        institutionId,
      },
    }

    if (search && search.length > 0) {
      where.mediaMaterials = {
        name: ILike(`%${search}%`),
      }
    }
    if (classIds) {
      where.studentLesson = {
        ...(where.studentLesson as FindOptionsWhere<StudentLesson>),
        classId: In(classIds.split(',').map(Number)),
      }
    }
    if (lessonIds) {
      where.studentLesson = {
        ...(where.studentLesson as FindOptionsWhere<StudentLesson>),
        classLessonId: In(lessonIds.split(',').map(Number)),
      }
    }
    if (startDate && endDate) {
      where.studentLesson = {
        ...(where.studentLesson as FindOptionsWhere<StudentLesson>),
        startTime: MoreThanOrEqual(dayjs(startDate).toDate()),
        endTime: LessThanOrEqual(dayjs(endDate).toDate()),
      }
    }
    const relations = {
      student: true,
      mediaMaterials: true,
      studentLesson: {
        class: true,
        course: true,
        classLesson: true,
      },
    }
    const findCount = await this.studentSubmissionRepository.count({
      where,
      relations,
    })
    const materials = await this.studentSubmissionRepository.find({
      where,
      relations,
      select: {
        studentLesson: {
          id: true,
          startTime: true,
          endTime: true,
          classLessonId: true,
          classLesson: {
            id: true,
            startTime: true,
            endTime: true,
            changeStartTime: true,
            changeEndTime: true,
          },
          class: {
            id: true,
            name: true,
          },
          course: {
            id: true,
            name: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    })
    return {
      data: await this.studentSubmissionWithStudents(institutionId, materials),
      total: findCount,
    }
  }
  async studentSubmissionWithStudents(
    institutionId: number,
    submissions: StudentSubmissions[]
  ): Promise<StudentSubmissions[]> {
    const result: StudentSubmissions[] = []
    for (const submission of submissions) {
      const userAlias = await this.userAliasRepository.findOne({
        where: {
          userId: submission.studentId,
          institutionId,
        },
      })
      const teacherFeedbacks = await this.teacherFeedbackRepository.find({
        where: {
          studentLessonId: submission.studentLessonId,
        },
        relations: {
          mediaMaterials: true,
        },
        select: {
          mediaMaterials: true,
        },
      })
      submission.teacherResponses =
        teacherFeedbacks.flatMap((teacherFeedback) => teacherFeedback.mediaMaterials) || []
      submission.studentAlias = shallow({
        source: userAlias,
        fields: ['name', 'userId', 'id', 'email'],
      })

      if (!submission.studentLesson) {
        continue
      }

      const userStudent =
        (submission.studentLesson.user &&
          shallow({
            source: submission.studentLesson.user,
            fields: ['fullName', 'firstName', 'lastName', 'id', 'phone'],
          })) ||
        null
      const { classLesson, ...rest } = submission.studentLesson
      submission.studentLesson = {
        ...rest,
        user: userStudent,
      } as StudentLesson
      submission.student = userStudent
      result.push(submission)
    }
    return result
  }

  async getStudentSubmissionsListByLesson(
    institutionId: number,
    params: MaterialSearchParamsDto & PaginationParamsDto
  ) {
    const { search, lessonIds, classIds, startDate, endDate, page = 1, limit = 20 } = params
    const { classLessonIds } = await this.classLessonIdsWithStudentSubmissions(
      institutionId,
      search,
      lessonIds,
      classIds,
      startDate,
      endDate
    )
    const where: FindOptionsWhere<ClassLesson> = {
      institutionId,
      id: In(classLessonIds),
    }
    if (lessonIds) {
      where.id = In(lessonIds.split(',').map(Number))
    }
    if (classIds) {
      where.classId = In(classIds.split(',').map(Number))
    }
    if (startDate && endDate) {
      where.startTime = MoreThanOrEqual(dayjs(startDate).toDate())
      where.endTime = LessThanOrEqual(dayjs(endDate).toDate())
    }
    const relations: FindOptionsRelations<ClassLesson> = {
      class: true,
      course: true,
      studentLessons: {
        user: {
          aliases: true,
        },
        studentSubmissions: {
          mediaMaterials: true,
        },
        teacherFeedbacks: {
          mediaMaterials: true,
        },
      },
    }
    const findCount = await this.classLessonRepository.count({
      where,
      relations,
    })
    const classLessons = await this.classLessonRepository.find({
      where,
      relations,
      skip: (page - 1) * limit,
      take: limit,
    })
    const userIds = classLessons
      .flatMap((classLesson) =>
        classLesson.studentLessons.map((studentLesson) => studentLesson.userId)
      )
      .filter(Boolean)
    const userAliases = await this.userAliasRepository.find({
      where: {
        userId: In(userIds),
        institutionId,
      },
    })
    return {
      data: classLessons.map((classLesson) => ({
        ...classLesson,
        className: classLesson.class?.name,
        courseName: classLesson.course?.name,
        studentLessons: this.studentLessonsWithUserAlias(classLesson.studentLessons, userAliases),
      })) as unknown as ClassLessonWithStudentLessons[],
      total: findCount,
    }
  }
  studentLessonsWithUserAlias(
    studentLessons: StudentLesson[],
    userAliases: UserAlias[]
  ): StudentLessonWithUserAlias[] {
    return studentLessons.map((studentLesson) => ({
      ...studentLesson,
      userAlias: userAliases.find((d) => d.userId === studentLesson.userId),
    }))
  }
  async classLessonIdsWithStudentSubmissions(
    institutionId: number,
    search?: string,
    lessonIds?: string,
    classIds?: string,
    startDate?: string,
    endDate?: string
  ) {
    const where: FindOptionsWhere<StudentSubmissions> = {}
    if (search) {
      where.studentLesson = {
        user: {
          aliases: {
            name: ILike(`%${search}%`),
            institutionId,
          },
        },
      }
    }
    if (classIds) {
      where.studentLesson = {
        classId: In(classIds.split(',').map(Number)),
      }
    }
    if (lessonIds) {
      where.classLessonId = In(lessonIds.split(',').map(Number))
    }
    if (startDate && endDate) {
      where.studentLesson = {
        ...(where.studentLesson as FindOptionsWhere<StudentLesson>),
        startTime: MoreThanOrEqual(dayjs(startDate).toDate()),
        endTime: LessThanOrEqual(dayjs(endDate).toDate()),
      }
    }
    const studentSubmissions = await this.studentSubmissionRepository.find({
      where,
      relations: {
        classLesson: true,
        studentLesson: {
          user: {
            aliases: true,
          },
        },
        mediaMaterials: true,
      },
    })
    return {
      studentSubmissions: await this.studentSubmissionWithStudents(
        institutionId,
        studentSubmissions
      ),
      classLessonIds: studentSubmissions
        .map((studentSubmission) => studentSubmission.studentLesson?.classLessonId)
        .filter(Boolean),
    }
  }
  async uploadStudentMaterialsSync(
    institutionId: number,
    dto: StudentMaterialsDto,
    files: Express.Multer.File[]
  ) {
    const jobId = `upload_${Date.now()}_${dto.studentId}`
    this.uploadStudentMaterials(institutionId, dto, files, jobId)
    const progress = this.uploadProgressService.createUpload(
      jobId,
      +dto.studentId,
      files?.length || 0
    )
    return progress
  }

  async uploadStudentMaterials(
    institutionId: number,
    dto: StudentMaterialsDto,
    files: Express.Multer.File[],
    jobId?: string
  ) {
    const institution = await this.institutionRepository.findOne({
      where: { id: institutionId },
    })
    if (!institution) {
      this.uploadProgressService.updateProgress(jobId, {
        status: 'failed',
        results: [],
        message: ErrorCode.INSTITUTION_NOT_FOUND,
      })
      return
    }
    const owner = await this.userRoleService.findOneBy({
      siteId: institution.siteId,
      isSiteManager: true,
      isInstitutionManager: true,
      institutionId,
    })
    if (!owner) {
      this.uploadProgressService.updateProgress(jobId, {
        status: 'failed',
        results: [],
        message: ErrorCode.USERID_NOT_FOUND,
      })
      return
    }
    const isValid = this.integrationGoogleService.validateFileTypes(files)
    if (!isValid) {
      this.uploadProgressService.updateProgress(jobId, {
        status: 'failed',
        results: [],
        message: ErrorCode.FILE_TYPE_NOT_ALLOWED,
      })
      return
    }
    const { studentLessonId, studentId } = dto
    const studentLesson = await this.studentLessonRepository.findOne({
      where: { id: +studentLessonId, userId: +studentId },
    })
    if (!studentLesson) {
      this.uploadProgressService.updateProgress(jobId, {
        status: 'failed',
        results: [],
        message: ErrorCode.STUDENT_LESSON_NOT_FOUND,
      })
      return
    }

    let filesData: GoogleDriveFile[] = []
    try {
      let additionalFolderName = ''
      const enrollCourse = await this.enrollCourseRepository.findOne({
        where: { userId: studentLesson.userId, institutionId },
      })

      if (enrollCourse) {
        const userAlias = await this.userAliasRepository.findOne({
          where: { id: enrollCourse.userAliasId, institutionId },
        })

        if (userAlias) {
          additionalFolderName = userAlias.name
        }
      }

      const { filesFolder } = await this.integrationGoogleService.createClassFolderStructure({
        userId: owner.userId,
        classLessonId: +dto.studentLessonId,
        type: 'studentFiles',
        additionalFolderName,
        institutionId,
      })

      if (files.length > 0)
        filesData = await this.integrationGoogleService.uploadFilesToDriveBatch(
          institutionId,
          files.map((file) => ({
            name: file.originalname,
            content: file.buffer,
            mimeType: file.mimetype,
            parentId: filesFolder.id,
          })),
          'studentFiles',
          {
            uploadId: jobId,
            onConflict: 'overwrite',
          }
        )
    } catch (error) {
      this.uploadProgressService.updateProgress(jobId, {
        status: 'failed',
        results: [],
        message: error.message,
      })
      return
    }
    const studentMaterials = []
    for (const media of files) {
      const fileType = FILE_TYPE_MAP[media.mimetype]
      const file = filesData.find((d) => d.name === media.originalname)
      if (!file) continue
      const mediaMaterial = this.classMediaMaterialsRepository.create({
        type: fileType || TypeSupported.DOCUMENT,
        fileType: media.mimetype,
        driveId: file.driveId,
        fileId: file.id,
        link: null,
        size: +(file.size || media.size || 0),
        name: media.originalname,
      })

      studentMaterials.push(mediaMaterial)
    }
    // Find or create student submission
    let studentSubmission = await this.studentSubmissionRepository.findOne({
      where: {
        studentId: +studentId,
        studentLessonId: studentLesson.id,
      },
    })
    if (!studentSubmission) {
      studentSubmission = await this.studentSubmissionRepository.save({
        institutionId,
        studentId: +studentId,
        studentLessonId: studentLesson.id,
        classLessonId: studentLesson.classLessonId,
      })
    }
    await this.classMediaMaterialsRepository.save(
      studentMaterials.map((media) => ({
        ...media,
        studentSubmissionId: studentSubmission.id,
      }))
    )
    this.uploadProgressService.updateProgress(jobId, {
      status: 'completed',
      results: [],
      message: 'Student submission created successfully',
    })
  }

  async removeTeacherFeedback(
    institutionId: number,
    materialId: number,
    teacherFeedbackId: number
  ) {
    const teacherFeedback = await this.teacherFeedbackRepository.findOne({
      where: { id: teacherFeedbackId, institutionId },
    })
    if (!teacherFeedback) {
      throw new NotFoundException(ErrorCode.TEACHER_FEEDBACK_NOT_FOUND)
    }
    const institution = await this.institutionRepository.findOne({
      where: { id: institutionId },
    })
    if (!institution) {
      throw new NotFoundException(ErrorCode.INSTITUTION_NOT_FOUND)
    }
    const owner = await this.userRoleService.findOneBy({
      siteId: institution.siteId,
      isSiteManager: true,
      isInstitutionManager: true,
      institutionId,
    })
    if (!owner) {
      throw new NotFoundException(ErrorCode.USERID_NOT_FOUND)
    }
    const removedMaterial = await this.classMediaMaterialsRepository.findOne({
      where: {
        id: materialId,
      },
    })
    if (!removedMaterial) {
      throw new NotFoundException(ErrorCode.MATERIAL_NOT_FOUND)
    }
    if (removedMaterial?.fileId)
      await this.integrationGoogleService.deleteDriveFile(owner.userId, removedMaterial.fileId)
    // Remove permanently material because the file inside google drive is also deleted
    // So we need to remove the material permanently for consistency
    await this.classMediaMaterialsRepository.delete(removedMaterial.id)
    // If the teacher feedback has no materials, delete the teacher feedback
    const newTeacherFeedback = await this.teacherFeedbackRepository.findOne({
      where: {
        id: teacherFeedback.id,
        institutionId,
      },
      relations: {
        mediaMaterials: true,
      },
    })
    if (newTeacherFeedback?.mediaMaterials.length === 0) {
      await this.teacherFeedbackRepository.delete(teacherFeedback.id)
    }
  }

  async removeStudentMaterialByAdmin(
    institutionId: number,
    materialId: number,
    studentSubmissionId: number
  ) {
    const studentSubmission = await this.studentSubmissionRepository.findOne({
      where: {
        id: studentSubmissionId,
        institutionId,
      },
    })
    if (!studentSubmission) {
      throw new NotFoundException(ErrorCode.STUDENT_SUBMISSION_NOT_FOUND)
    }
    await this.removeStudentMaterial(institutionId, materialId, studentSubmission.studentId)
  }

  async removeStudentMaterial(institutionId: number, materialId: number, studentId: number) {
    const institution = await this.institutionRepository.findOne({
      where: { id: institutionId },
    })
    if (!institution) {
      throw new NotFoundException(ErrorCode.INSTITUTION_NOT_FOUND)
    }
    const owner = await this.userRoleService.findOneBy({
      siteId: institution.siteId,
      isSiteManager: true,
      isInstitutionManager: true,
      institutionId,
    })
    if (!owner) {
      throw new NotFoundException(ErrorCode.USERID_NOT_FOUND)
    }
    const removedMaterial = await this.classMediaMaterialsRepository.findOne({
      where: {
        id: materialId,
      },
    })
    if (!removedMaterial) {
      throw new NotFoundException(ErrorCode.MATERIAL_NOT_FOUND)
    }
    const studentSubmissionId = removedMaterial.studentSubmissionId
    if (removedMaterial?.fileId)
      await this.integrationGoogleService.deleteDriveFile(institutionId, removedMaterial.fileId)
    // Remove permanently material because the file inside google drive is also deleted
    // So we need to remove the material permanently for consistency
    await this.classMediaMaterialsRepository.delete(removedMaterial.id)
    // If the student submission has no materials, delete the student submission
    const studentSubmission = await this.studentSubmissionRepository.findOne({
      where: {
        id: studentSubmissionId,
        studentId,
      },
      relations: {
        mediaMaterials: true,
      },
    })
    if (studentSubmission?.mediaMaterials.length === 0) {
      await this.studentSubmissionRepository.delete(studentSubmission.id)
    }
  }

  async bulkDownloadStudentSubmissionsByLesson(institutionId: number, classLessonId: number) {
    const studentSubmissions = await this.studentSubmissionRepository.find({
      where: { studentLesson: { classLessonId }, institutionId },
      relations: {
        mediaMaterials: true,
      },
    })
    const materials = studentSubmissions
      .flatMap((studentSubmission) => studentSubmission.mediaMaterials)
      .filter((material) => material.type !== TypeSupported.LINK && material.link)
    const institution = await this.institutionRepository.findOne({
      where: { id: institutionId },
    })
    if (!institution) {
      throw new NotFoundException(ErrorCode.INSTITUTION_NOT_FOUND)
    }
    const owner = await this.userRoleService.findOneBy({
      siteId: institution.siteId,
      isSiteManager: true,
      isInstitutionManager: true,
      institutionId,
    })
    if (!owner) {
      throw new NotFoundException(ErrorCode.USERID_NOT_FOUND)
    }
    const zip = new AdmZip()
    for (const material of materials) {
      const fileData = await this.integrationGoogleService.downloadFileFromDriveUrl(
        owner.userId,
        material.link
      )
      zip.addFile(material.name || `file_${material.id}`, fileData.content)
    }
    const zipFileName = `student_submission_${classLessonId}_${Date.now()}.zip`

    // Return zip buffer untuk download
    return {
      fileName: zipFileName,
      content: zip.toBuffer(),
      mimeType: 'application/zip',
      size: zip.toBuffer().length,
    }
  }
  async bulkDownloadStudentMaterials(institutionId: number, studentSubmissionId: number) {
    const studentSubmission = await this.studentSubmissionRepository.findOne({
      where: { id: studentSubmissionId, institutionId },
      relations: {
        mediaMaterials: true,
      },
    })
    if (!studentSubmission) {
      throw new NotFoundException(ErrorCode.STUDENT_SUBMISSION_NOT_FOUND)
    }
    if (studentSubmission.mediaMaterials.length === 0) {
      throw new NotFoundException(ErrorCode.MATERIAL_NOT_FOUND)
    }
    const institution = await this.institutionRepository.findOne({
      where: { id: institutionId },
    })
    if (!institution) {
      throw new NotFoundException(ErrorCode.INSTITUTION_NOT_FOUND)
    }
    const owner = await this.userRoleService.findOneBy({
      siteId: institution.siteId,
      isSiteManager: true,
      isInstitutionManager: true,
      institutionId,
    })
    if (!owner) {
      throw new NotFoundException(ErrorCode.USERID_NOT_FOUND)
    }
    const zip = new AdmZip()
    const materials = studentSubmission.mediaMaterials.filter(
      (material) => material.type !== TypeSupported.LINK && material.link
    )
    for (const material of materials) {
      const fileData = await this.integrationGoogleService.downloadFileFromDriveUrl(
        owner.userId,
        material.link
      )
      zip.addFile(material.name || `file_${material.id}`, fileData.content)
    }
    const zipFileName = `student_submission_${studentSubmissionId}_${Date.now()}.zip`

    // Return zip buffer untuk download
    return {
      fileName: zipFileName,
      content: zip.toBuffer(),
      mimeType: 'application/zip',
      size: zip.toBuffer().length,
    }
  }

  async uploadTeacherFeedbackSync(
    userId: number,
    institutionId: number,
    studentLessonId: number,
    files: Express.Multer.File[]
  ) {
    const jobId = `upload_${Date.now()}_teacher_feedback_${studentLessonId}`
    const progress = this.uploadProgressService.createUpload(jobId, userId, files?.length || 0)
    this.uploadTeacherFeedback(userId, institutionId, studentLessonId, files ?? [], jobId)
    return progress
  }

  async bulkUploadTeacherFeedbackSync(
    userId: number,
    institutionId: number,
    payload: BulkUploadTeacherFeedbackDto,
    files: Express.Multer.File[]
  ) {
    const jobId = `bulk_upload_${Date.now()}_teacher_feedback_${uuidv4()}`
    const progress = this.uploadProgressService.createUpload(jobId, userId, files?.length || 0)
    this.bulkUploadTeacherFeedback(userId, institutionId, payload, files ?? [], jobId)
    return progress
  }

  async bulkUploadTeacherFeedback(
    userId: number,
    institutionId: number,
    payload: BulkUploadTeacherFeedbackDto,
    files: Express.Multer.File[],
    jobId?: string
  ) {
    const { classLessonId, notificationSettings, fileStudentMap } = payload
    const institution = await this.institutionRepository.findOneById(institutionId)
    if (!institution) {
      return
    }
    const classLesson = await this.classLessonRepository.findOne({
      where: { id: classLessonId },
    })
    if (!classLesson) {
      throw new NotFoundException(ErrorCode.CLASS_LESSON_NOT_FOUND)
    }
    const studentLessonIds = Object.values(fileStudentMap)
      .flat()
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n)) // guard against bad inputs <== value is array of student lesson ids
    const studentLessons = await this.studentLessonRepository.find({
      where: { classLessonId: classLesson.id, id: In(studentLessonIds) },
      relations: {
        class: true,
      },
    })
    const studentIds = studentLessons.map((d) => d.userId)
    const userAliases = await this.userAliasRepository.find({
      where: { userId: In(studentIds), institutionId: institution.id },
      relations: {
        user: true,
      },
    })

    for (const studentLesson of studentLessons) {
      const studentLessonId = studentLesson.id
      const userAlias = userAliases.find((d) => d.userId === studentLesson.userId)
      if (!userAlias) continue
      const fileNames = Object.keys(fileStudentMap).filter((key) =>
        fileStudentMap[key].includes(studentLessonId.toString())
      )
      if (fileNames.length <= 0) continue
      const relatedFiles = files.filter((f) => fileNames.includes(f.originalname))
      if (relatedFiles.length <= 0) continue
      await this.uploadTeacherFeedback(userId, institutionId, studentLesson.id, relatedFiles, jobId)
      const fileBuffers = relatedFiles.map((f) => f.buffer)
      if (notificationSettings.sendViaEmail) {
        await this.sendEmailUploadedTeacherFeedback(
          institution,
          studentLesson.userId,
          userAlias,
          studentLesson,
          fileBuffers
        )
      }
      if (notificationSettings.sendViaWhatsapp && notificationSettings.whatsappContent) {
        await this.sendWhatsappUploadedTeacherFeedback(
          institution,
          userAlias,
          notificationSettings.whatsappContent,
          studentLesson
        )
      }
    }
  }

  async sendWhatsappUploadedTeacherFeedback(
    institution: Institution,
    userAlias: UserAlias,
    whatsappContent: string,
    studentLesson: StudentLesson
  ) {
    try {
      await this.whatsappWebService.sendMessage(
        institution.id,
        userAlias.user?.phone,
        this.buildContentWithVariable(
          whatsappContent,
          userAlias,
          studentLesson.class,
          institution.name
        )
      )
    } catch (error) {
      console.error('Whatsapp send failed', error)
    }
  }

  buildContentWithVariable(
    content: string,
    userAlias: UserAlias,
    classEntity: ClassEntity,
    institutionName: string
  ) {
    // Replace variables in the content with userAlias data
    return content
      .replace(/{{studentName}}/g, userAlias.name || '')
      .replace(/{{institutionName}}/g, institutionName)
      .replace(/{{className}}/g, classEntity.name || '')
  }

  async sendEmailUploadedTeacherFeedback(
    institution: Institution,
    studentId: number,
    userAlias: UserAlias,
    studentLesson: StudentLesson,
    fileBuffers: Buffer[]
  ) {
    const emailAddress = userAlias.email ?? userAlias?.user?.email
    if (!emailAddress) {
      return
    }
    const emailPayload: SendTeacherUploadedSubmissionFeedback = {
      institutionId: institution.id,
      userId: studentId,
      emailAddress: userAlias.email ?? userAlias?.user?.email,
      adminEmail: institution.email,
      className: studentLesson.class?.name ?? '',
      studentName: userAlias?.name ?? userAlias?.user?.firstName ?? '',
      institutionName: institution.name,
      siteId: institution.siteId,
      fileBuffers,
    }
    try {
      await this.emailService.sendUploadedTeacherFeedback(emailPayload)
    } catch (error) {
      console.error('Email send failed', error)
    }
  }

  async uploadTeacherFeedback(
    userId: number,
    institutionId: number,
    studentLessonId: number,
    files: Express.Multer.File[],
    jobId?: string
  ) {
    const institution = await this.institutionRepository.findOne({
      where: { id: institutionId },
    })
    if (!institution) {
      this.uploadProgressService.updateProgress(jobId, {
        status: 'failed',
        results: [],
        message: ErrorCode.INSTITUTION_NOT_FOUND,
      })
      return
    }
    const owner = await this.userRoleService.findOneBy({
      siteId: institution.siteId,
      isSiteManager: true,
      isInstitutionManager: true,
      institutionId,
    })
    if (!owner) {
      this.uploadProgressService.updateProgress(jobId, {
        status: 'failed',
        results: [],
        message: ErrorCode.USERID_NOT_FOUND,
      })
      return
    }
    const isValid = this.integrationGoogleService.validateFileTypes(files)
    if (!isValid) {
      this.uploadProgressService.updateProgress(jobId, {
        status: 'failed',
        results: [],
        message: ErrorCode.FILE_TYPE_NOT_ALLOWED,
      })
      return
    }
    const studentLesson = await this.studentLessonRepository.findOne({
      where: { id: +studentLessonId },
    })
    if (!studentLesson) {
      this.uploadProgressService.updateProgress(jobId, {
        status: 'failed',
        results: [],
        message: ErrorCode.STUDENT_LESSON_NOT_FOUND,
      })
      return
    }

    let filesData: GoogleDriveFile[] = []
    try {
      let additionalFolderName = ''

      const enrollCourse = await this.enrollCourseRepository.findOne({
        where: { userId: studentLesson.userId, institutionId },
      })

      if (enrollCourse) {
        const userAlias = await this.userAliasRepository.findOne({
          where: { id: enrollCourse.userAliasId, institutionId },
        })

        const classEntity = await this.classRepository.findOne({
          where: { id: studentLesson.classId, institutionId },
        })

        if (userAlias) {
          additionalFolderName = `${classEntity?.name}_${userAlias.name}`
        }
      }

      const { filesFolder } = await this.integrationGoogleService.createClassFolderStructure({
        userId: owner.userId,
        institutionId,
        classLessonId: studentLessonId,
        type: 'teacherFeedbackFiles',
        studentId: studentLesson.userId,
        additionalFolderName,
      })

      if (files.length > 0)
        filesData = await this.integrationGoogleService.uploadFilesToDriveBatch(
          institutionId,
          files.map((file) => ({
            name: file.originalname,
            content: file.buffer,
            mimeType: file.mimetype,
            parentId: filesFolder.id,
          })),
          'studentFiles',
          {
            uploadId: jobId,
            onConflict: 'overwrite',
          }
        )
    } catch (error) {
      this.uploadProgressService.updateProgress(jobId, {
        status: 'failed',
        results: [],
        message: error.message,
      })
      throw error
    }
    const teacherFeedbackMaterials = []
    for (const media of files) {
      const fileType = FILE_TYPE_MAP[media.mimetype]
      const file = filesData.find((d) => d.name === media.originalname)
      if (!file) continue
      const mediaMaterial = this.classMediaMaterialsRepository.create({
        type: fileType || TypeSupported.DOCUMENT,
        fileType: media.mimetype,
        driveId: file.driveId,
        fileId: file.id,
        link: null,
        size: +(file.size || media.size || 0),
        name: media.originalname,
      })

      teacherFeedbackMaterials.push(mediaMaterial)
    }
    // Find or create student submission
    let teacherFeedback = await this.teacherFeedbackRepository.findOne({
      where: {
        teacherId: userId,
        studentLessonId: studentLesson.id,
      },
    })
    if (!teacherFeedback) {
      teacherFeedback = await this.teacherFeedbackRepository.save({
        institutionId,
        teacherId: userId,
        studentLessonId: studentLesson.id,
        classLessonId: studentLesson.classLessonId,
      })
    }
    await this.classMediaMaterialsRepository.save(
      teacherFeedbackMaterials.map((media) => ({
        ...media,
        teacherFeedbackId: teacherFeedback.id,
      }))
    )
    this.uploadProgressService.updateProgress(jobId, {
      status: 'completed',
      results: [],
      message: 'Teacher feedback created successfully',
    })
    return filesData
  }
}
