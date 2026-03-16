import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as dayjs from 'dayjs'
import { FindOptionsWhere, ILike, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm'

import {
  ClassMaterialsDto,
  FILE_TYPE_MAP,
  SendClassMaterialDto,
  UpdateClassMaterialsStudentExpiryDto,
} from '@/application/admin/class-materials/dto/class-materials.dto'
import {
  MaterialSearchParamsDto,
  PaginationParamsDto,
} from '@/application/admin/class-materials/dto/search-params.dto'
import { ALLOWED_MIME_TYPES } from '@/common/constants/files.constants'
import { ClassLesson } from '@/models/class-lessons.entity'
import { ClassMaterials } from '@/models/class-materials.entity'
import { ClassMaterialsRepository } from '@/models/class-materials.repository'
import { MediaMaterials } from '@/models/class-media-materials.entity'
import { ClassMediaMaterialsRepository } from '@/models/class-media-materials.repository'
import { ClassRepository } from '@/models/classes.repository'
import { CoursesRepository } from '@/models/courses.repository'
import { Institution } from '@/models/institutions.entity'
import { StudentLesson } from '@/models/student-lesson.entity'
import { UserAlias } from '@/models/user-aliases.entity'
import { UserAliasesRepository } from '@/models/user-aliases.repository'
import { UsersRepository } from '@/models/users.repository'

import { EmailService } from '../external/email.service'
import { GoogleDriveFile, IntegrationGoogleService } from '../external/integration-google.service'
import { UploadProgressService } from '../external/upload-progress'

import { WhatsappWebService } from './whatsapp-web.service'

@Injectable()
export class ClassMaterialsService {
  constructor(
    private readonly classMediaMaterialsRepository: ClassMediaMaterialsRepository,
    private readonly classMaterialsRepository: ClassMaterialsRepository,
    private readonly integrationGoogleService: IntegrationGoogleService,
    private readonly classRepository: ClassRepository,
    private readonly courseRepository: CoursesRepository,
    private readonly uploadProgressService: UploadProgressService,
    private readonly userRepository: UsersRepository,
    private readonly userAliasRepository: UserAliasesRepository,
    @InjectRepository(StudentLesson)
    private readonly studentLessonRepository: Repository<StudentLesson>,
    @InjectRepository(ClassLesson)
    private readonly classLessonRepository: Repository<ClassLesson>,
    private readonly whatsappWebService: WhatsappWebService,
    private readonly emailService: EmailService
  ) {}

  getAllowedFileTypes(): any {
    return {
      allowedTypes: ALLOWED_MIME_TYPES,
      categories: {
        documents: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/plain',
          'text/csv',
        ],
        images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        archives: [
          'application/zip',
          'application/x-rar-compressed',
          'application/x-7z-compressed',
        ],
        media: ['audio/mpeg', 'audio/wav', 'video/mp4', 'video/mpeg', 'video/quicktime'],
      },
    }
  }

  async getListMaterials(
    institutionId: number,
    params: MaterialSearchParamsDto & PaginationParamsDto
  ) {
    const { search, type, lessonIds, classIds, startDate, endDate, page = 1, limit = 20 } = params

    const where: FindOptionsWhere<ClassMaterials> = {
      institutionId,
    }
    if (type) {
      const fileTypes = FILE_TYPE_MAP[type]
      if (fileTypes?.length) {
        where.mediaMaterials = Object.assign({}, where.mediaMaterials ?? {}, {
          fileType: In(fileTypes),
        })
      } else {
        where.mediaMaterials = Object.assign({}, where.mediaMaterials ?? {}, {
          type,
        })
      }
    }
    if (search) {
      where.mediaMaterials = {
        ...(where.mediaMaterials as FindOptionsWhere<MediaMaterials>),
        name: ILike(`%${search}%`),
      }
    }
    if (lessonIds) {
      where.classLessonId = In(lessonIds.split(',').map(Number))
    }
    if (classIds) {
      where.classId = In(classIds.split(',').map(Number))
    }
    if (startDate && endDate) {
      where.classLesson = {
        startTime: MoreThanOrEqual(dayjs(startDate).toDate()),
        endTime: LessThanOrEqual(dayjs(endDate).toDate()),
      }
    }
    const findCount = await this.classMaterialsRepository.count({
      where,
      relations: {
        mediaMaterials: true,
      },
    })
    const materials = await this.classMaterialsRepository.find({
      where,
      relations: {
        mediaMaterials: true,
        classEntity: true,
        course: true,
        classLesson: true,
      },
      select: {
        classEntity: {
          name: true,
        },
        course: {
          name: true,
        },
        classLesson: {
          id: true,
          lessonId: true,
          startTime: true,
          endTime: true,
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    })
    return {
      data: await this.classMaterialsWithStudents(institutionId, materials),
      total: findCount,
    }
  }

  async classMaterialsWithStudents(
    institutionId: number,
    materials: ClassMaterials[]
  ): Promise<ClassMaterials[]> {
    const result: ClassMaterials[] = []
    for (const material of materials) {
      const studentLessons = await this.studentLessonRepository.find({
        where: {
          classLessonId: material.classLessonId,
        },
        relations: {
          user: true,
        },
      })
      const userAliases = await this.userAliasRepository.find({
        where: {
          userId: In(studentLessons.map((d) => d.userId)),
          institutionId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          userId: true,
          user: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
      })
      const studentExpiryDates = material.studentExpiryDates ?? []
      material.students = userAliases.map((user) => ({
        ...user,
        expiryDate: studentExpiryDates.find((d) => d.studentId === user.id)?.expiryDate,
      }))
      result.push(material)
    }
    return result
  }
  createClassMaterialsSync(
    userId: number,
    institutionId: number,
    dto: ClassMaterialsDto,
    files?: Express.Multer.File[]
  ) {
    const jobId = `upload_${Date.now()}_${userId}`
    const progress = this.uploadProgressService.createUpload(jobId, userId, files?.length || 0)
    this.createClassMaterials(userId, institutionId, dto, files ?? [], jobId)
    return progress
  }

  async createClassMaterials(
    userId: number,
    institutionId: number,
    dto: ClassMaterialsDto,
    files?: Express.Multer.File[],
    jobId?: string
  ) {
    const uploadFiles = files ?? []
    const isValid = this.integrationGoogleService.validateFileTypes(uploadFiles, jobId)
    if (!isValid) {
      return
    }
    // Create class materials record
    const classEntity = await this.classRepository.findOne({
      where: { id: dto.classId, institutionId },
    })
    const course = await this.courseRepository.findOne({
      where: { id: dto.courseId, institutionId },
    })
    if (!classEntity || !course) {
      this.uploadProgressService.updateProgress(jobId, {
        completedFiles: 0,
        status: 'failed',
        message: 'Class or course not found.',
        results: [],
      })
      return
    }
    const classLesson = await this.classLessonRepository.findOne({
      where: { id: dto.classLessonId, institutionId },
      select: ['id', 'startTime', 'changeStartTime'],
    })

    let classMaterial = await this.classMaterialsRepository.findOne({
      where: {
        classLessonId: dto.classLessonId,
        classId: dto.classId,
        courseId: dto.courseId,
        institutionId,
      },
    })

    const lessonStartTime = classLesson
      ? classLesson.changeStartTime ?? classLesson.startTime
      : undefined

    const classFolderName = classEntity.name
    const lessonFolderName = lessonStartTime
      ? dayjs(lessonStartTime).format('YYYYMMDD_HHmm')
      : undefined

    let filesData: GoogleDriveFile[] = []
    try {
      const { filesFolder } = await this.integrationGoogleService.createClassFolderStructure({
        userId,
        institutionId,
        classLessonId: dto.classLessonId,
        type: 'classFiles',
        additionalFolderName: classFolderName,
        lessonFolderName,
      })

      if (uploadFiles.length > 0)
        filesData = await this.integrationGoogleService.uploadFilesToDriveBatch(
          institutionId,
          uploadFiles.map((file) => ({
            name: file.originalname,
            content: file.buffer,
            mimeType: file.mimetype,
            parentId: filesFolder.id,
          })),
          'classFiles',
          {
            uploadId: jobId,
            onConflict: 'overwrite',
          }
        )
    } catch (error) {
      console.log('error', error)
      this.uploadProgressService.updateProgress(jobId, {
        status: 'failed',
        results: [],
        message: error.message,
      })
      return
    }
    const mediaMaterials = []
    for (const media of dto.mediaMaterials) {
      const fileType = FILE_TYPE_MAP[media.type]
      const mediaMaterial = {
        type: media.type,
        fileType: media.fileType,
        driveId: null,
        fileId: null,
        link: null,
        size: 0,
        name: media.name,
        expiryDate: media.expiryDate || dayjs().add(6, 'month').toDate(),
      }
      if ((fileType ?? []).includes(media.fileType)) {
        const fileIndex = filesData.findIndex((d) => d.name === media.name)
        if (fileIndex === -1) continue

        const file = filesData[fileIndex]
        mediaMaterial.size = +(file.size || uploadFiles?.[fileIndex]?.size || 0)
        mediaMaterial.driveId = file.driveId || null
        mediaMaterial.fileId = file.id
      } else {
        mediaMaterial.driveId = null
        mediaMaterial.fileId = null
        mediaMaterial.link = media.link
      }
      mediaMaterials.push(mediaMaterial)
    }
    if (!classMaterial) {
      classMaterial = await this.classMaterialsRepository.save({
        ...dto,
        name: `Materials_${classEntity.name}_${course.name}`,
        institutionId,
      })
    } else if (classMaterial.name !== `Materials_${classEntity.name}_${course.name}`) {
      classMaterial.name = `Materials_${classEntity.name}_${course.name}`
      classMaterial = await this.classMaterialsRepository.save(classMaterial)
    }
    await this.classMediaMaterialsRepository.save(
      mediaMaterials.map((media) => ({
        ...media,
        classMaterialId: classMaterial.id,
      }))
    )
    this.uploadProgressService.updateProgress(jobId, {
      status: 'completed',
      results: [],
      message: 'Class materials created successfully',
    })
  }

  async getMaterialsStatus(jobId: string) {
    return this.uploadProgressService.getProgress(jobId)
  }

  async sendNotificationToStudents(classMaterialsId: number, payload: SendClassMaterialDto) {
    const { sendViaEmail, sendViaWhatsapp, whatsappContent } = payload
    const classMaterial = await this.classMaterialsRepository.findOne({
      where: { id: classMaterialsId },
      relations: {
        course: true,
        mediaMaterials: true,
        institution: { site: true },
        classLesson: {
          classEntity: true,
        },
      },
    })
    const withStudents = await this.classMaterialsWithStudents(classMaterial.institutionId, [
      classMaterial,
    ])
    const institution = classMaterial.institution
    const site = institution.site
    for (const student of withStudents[0].students) {
      const user = await this.userRepository.findOne({
        where: { id: student.userId },
      })
      if (sendViaEmail && site.email && student.email) {
        await this.sendViaEmail(
          site.email,
          student.email,
          institution,
          student,
          classMaterial,
          site?.customDomain || site.url
        )
      }
      if (sendViaWhatsapp && user.phone) {
        await this.sendViaWhatsapp(
          whatsappContent,
          user.phone,
          classMaterial.institution,
          student,
          classMaterial,
          site?.customDomain || site.url
        )
      }
    }
  }

  buildContentWithVariable(
    content: string,
    userAlias: UserAlias,
    classMaterial: ClassMaterials,
    siteLink: string,
    institutionName: string
  ) {
    const classEntity = classMaterial.classLesson?.classEntity
    const course = classMaterial.course
    if (!classEntity || !course) return
    return content
      .replace(/{{studentName}}/g, userAlias.name || '')
      .replace(/{{className}}/g, classEntity.name || '')
      .replace(/{{courseName}}/g, course.name || '')
      .replace(/{{siteLink}}/g, siteLink)
      .replace(/{{institutionName}}/g, institutionName)
  }

  async sendViaWhatsapp(
    content: string,
    phone: string,
    institution: Institution,
    userAlias: UserAlias,
    classMaterial: ClassMaterials,
    siteLink: string
  ) {
    await this.whatsappWebService.sendMessage(
      institution.id,
      phone,
      this.buildContentWithVariable(content, userAlias, classMaterial, siteLink, institution.name)
    )
  }
  async sendViaEmail(
    _siteEmail: string,
    _email: string,
    institution: Institution,
    userAlias: UserAlias,
    classMaterial: ClassMaterials,
    siteLink: string
  ) {
    const classEntity = classMaterial.classLesson?.classEntity
    const course = classMaterial.course
    if (!classEntity || !course) return
    await this.emailService.sendClassMaterialsEmail({
      emailAddress: userAlias.email,
      courseName: course.name,
      className: classEntity?.name,
      institutionId: institution.id,
      institutionName: institution.name,
      studentName: userAlias.name,
      siteLink,
      contactEmail: institution.email,
    })
  }

  async updateMaterialExpiryForStudent(
    classMaterialsId: number,
    institutionId: number,
    payload: UpdateClassMaterialsStudentExpiryDto
  ) {
    const classMaterial = await this.classMaterialsRepository.findOne({
      where: { id: classMaterialsId, institutionId },
    })

    if (!classMaterial) {
      throw new Error('Class material not found')
    }
    const studentExpiryDates = classMaterial.studentExpiryDates ?? []
    const studentExpiryDate = studentExpiryDates.find((d) => d.studentId === payload.studentId)
    if (studentExpiryDate) {
      studentExpiryDate.expiryDate = payload.expiryDate
    } else {
      studentExpiryDates.push({
        studentId: payload.studentId,
        expiryDate: payload.expiryDate,
      })
    }

    classMaterial.studentExpiryDates = studentExpiryDates
    await this.classMaterialsRepository.save(classMaterial)

    return classMaterial
  }

  async updateMediaMaterialExpiry(
    classMaterialsId: number,
    mediaMaterialId: number,
    expiryDate: string,
    institutionId: number
  ) {
    // Find the class material to ensure it belongs to the institution
    const classMaterial = await this.classMaterialsRepository.findOne({
      where: { id: classMaterialsId, institutionId },
    })

    if (!classMaterial) {
      throw new Error('Class material not found')
    }

    // Find the media material to ensure it belongs to the class material
    const mediaMaterial = await this.classMediaMaterialsRepository.findOne({
      where: { id: mediaMaterialId, classMaterialId: classMaterialsId },
    })

    if (!mediaMaterial) {
      throw new Error('Media material not found')
    }

    // Update the expiry date
    mediaMaterial.expiryDate = new Date(expiryDate)
    await this.classMediaMaterialsRepository.save(mediaMaterial)

    return {
      success: true,
      message: 'Media material expiry date updated successfully',
      data: mediaMaterial,
    }
  }

  async deleteMediaMaterial(
    classMaterialsId: number,
    mediaMaterialId: number,
    institutionId: number,
    userId: number
  ) {
    // Find the class material to ensure it belongs to the institution
    const classMaterial = await this.classMaterialsRepository.findOne({
      where: { id: classMaterialsId, institutionId },
    })

    if (!classMaterial) {
      throw new Error('Class material not found')
    }

    // Find the media material to ensure it belongs to the class material
    const mediaMaterial = await this.classMediaMaterialsRepository.findOne({
      where: { id: mediaMaterialId, classMaterialId: classMaterialsId },
    })

    if (!mediaMaterial) {
      throw new Error('Media material not found')
    }

    // Delete the media material from Google Drive if it exists
    if (mediaMaterial.fileId) {
      try {
        await this.integrationGoogleService.deleteDriveFile(userId, mediaMaterial.fileId)
        console.log('Successfully deleted file from Google Drive:', mediaMaterial.fileId)
      } catch (error) {
        console.error('Failed to delete file from Google Drive:', error)
        // Continue with database deletion even if Google Drive deletion fails
      }
    }

    // Delete the media material from database
    await this.classMediaMaterialsRepository.softDelete(mediaMaterial.id)

    return {
      success: true,
      message: 'Media material deleted successfully',
      data: { id: mediaMaterial.id },
    }
  }
}
