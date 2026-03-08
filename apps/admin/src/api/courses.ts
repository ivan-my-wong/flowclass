import { TypeCommonFieldItem } from '@/types/student'
import { CurrentlyEnrolledClass } from '@/types/studentInvoice.type'

import { Classes, EnrolledClassCount } from '../types/classes'
import {
  Course,
  CourseActivitiesOrder,
  SectionDescription,
  TypeEnrollmentFormDetail,
  UpdateCourseEmailSettingsProps,
  UpdateCourseTagsProps,
} from '../types/course'

import apiClient from './index'

export const getCourses = async (
  schoolId: number,
  userId?: number
): Promise<Course[]> => {
  let url = '/admin/courses'
  if (userId) {
    url = `/admin/courses/user/${userId}`
  }
  const res = await apiClient.get({
    url,
    needAuth: true,
    params: {
      institutionId: schoolId,
    },
  })

  return res.data.data.content
}

export const getCurrentCourse = async (id: number): Promise<Course> => {
  const res = await apiClient.get({
    url: '/admin/courses/detail',
    needAuth: true,
    params: {
      courseId: id,
    },
  })

  return res.data.data
}

export const updateCourseBasic = async (
  course: Partial<Course>
): Promise<Course> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/courses/basic',
    data: course,
  })

  return res.data.data
}

export const updateCourseSettings = async (
  courseId: number,
  {
    isPrivate,
    requireEmailVerification,
    blockDuplicateEmailEnrollment,
  }: {
    isPrivate?: boolean
    requireEmailVerification?: boolean
    blockDuplicateEmailEnrollment?: boolean
  }
): Promise<Course> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/courses/course-settings',
    data: {
      courseId,
      isPrivate,
      requireEmailVerification,
      blockDuplicateEmailEnrollment,
    },
  })

  return res.data.data
}

export const updateCourseFaq = async (
  course: Partial<Course>
): Promise<Course> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/courses/qna',
    data: course,
  })

  return res.data.data
}

export const updateCourseDescription = async (
  course: Partial<Course>
): Promise<Course> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/courses/description',
    data: course,
  })

  return res.data.data
}

export const updateCourseEnrollment = async (
  course: Partial<Course>
): Promise<Course> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/courses/enrollment',
    data: { ...course },
  })

  return res.data.data
}

export const updateCourseMessage = async (
  course: Partial<Course>
): Promise<Course> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/courses/message',
    data: { ...course },
  })

  return res.data.data
}

export const updateCourseRecruitment = async (
  course: Partial<Course>
): Promise<Course> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/courses/recruitment',
    data: { ...course },
  })

  return res.data.data
}

export type CreateCourseDto = {
  name: string
  path: string
  longDescriptions: SectionDescription[]
  // type: CourseType
}

export const createCourse = async (
  id: number,
  course: CreateCourseDto
): Promise<Course> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/courses/create',
    data: { institutionId: id, ...course },
  })

  return res.data.data
}

export const duplicateCourse = async (
  course: Partial<Course>
): Promise<Course> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/courses/duplicate',
    data: { ...course },
  })

  return res.data.data
}

export const duplicateCourseToAnotherInstitution = async (
  course: Partial<Course>,
  institutionId: number
): Promise<Course> => {
  const res = await apiClient.post({
    needAuth: true,
    url: `/admin/courses/duplicate/institution/${institutionId}`,
    data: { ...course },
  })

  return res.data.data
}

export const deleteCourse = async (id: number): Promise<Course> => {
  const res = await apiClient.delete({
    needAuth: true,
    url: '/admin/courses/delete',
    params: { courseId: id },
  })

  return res.data.data
}

export const getCourseClasses = async (
  courseId: number
): Promise<Classes[]> => {
  const res = await apiClient.get({
    needAuth: true,
    url: '/admin/regular-course/classes',
    params: { courseId },
  })

  return res.data.data.content
}

export const publishCourseDeprecated = async (
  courseId: number
): Promise<string> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/courses/publish',
    data: { courseId },
  })

  return res.data.data
}

export const unpublishCourseDeprecated = async (
  courseId: number
): Promise<string> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/courses/unpublish',
    data: { courseId },
  })

  return res.data.data
}

export const archiveCourse = async (courseId: number): Promise<string> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/courses/archive',
    data: { courseId },
  })

  return res.data.data
}

export const unarchiveCourse = async (courseId: number): Promise<string> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/courses/unarchive',
    data: { courseId },
  })

  return res.data.data
}

export const updateCourseTags = async (
  course: UpdateCourseTagsProps
): Promise<Course> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/courses/tags',
    data: { ...course },
  })

  return res.data.data
}

export const getListEnrollmentFormFields = async (
  id: number
): Promise<TypeCommonFieldItem[]> => {
  const res = await apiClient.get({
    url: '/admin/enrollment-form/fields',
    needAuth: true,
    params: {
      institutionId: id,
    },
  })

  return res.data.data
}

export type UpdateCourseActivitiesOrderDto = {
  institutionId: number
  courseId: number
  order: number[]
}

export type PrerequisiteCourseDto = {
  groups: {
    conditions: {
      courseId: number | null
      classId: number | null
      operator: 'AND' | 'OR'
    }[]
    groupOperator: 'AND' | 'OR'
  }[]
}

export const updateCourseActivitiesOrder = async (
  data: UpdateCourseActivitiesOrderDto
): Promise<CourseActivitiesOrder> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/course-activities-order/update',
    data: { ...data },
  })

  return res.data.data
}
export const getEnrollmentFormDetail = async (
  id: string
): Promise<TypeEnrollmentFormDetail> => {
  const res = await apiClient.get({
    url: '/admin/enrollment-form/form-detail',
    needAuth: true,
    params: {
      id,
    },
  })
  return res.data.data?.fields
}

export const getPrerequisiteCourse = async (
  courseId: number,
  institutionId: number
): Promise<PrerequisiteCourseDto> => {
  return apiClient
    .get({
      needAuth: true,
      url: `/admin/prerequisites-courses/${courseId}`,
      params: { institutionId },
    })
    .then(res => res.data.data || {})
}

export const updatePrerequisiteCourse = async (
  courseId: number,
  data: PrerequisiteCourseDto,
  institutionId: number
): Promise<Course> => {
  return apiClient
    .post({
      needAuth: true,
      url: `/admin/prerequisites-courses/${courseId}`,
      data,
      params: { institutionId },
    })
    .then(res => res.data.data?.prerequisites || {})
}

export const deletePrerequisiteCourse = async (
  courseId: number,
  institutionId: number
): Promise<Course> => {
  return apiClient
    .delete({
      needAuth: true,
      url: `/admin/prerequisites-courses/${courseId}`,
      params: { institutionId },
    })
    .then(res => res.data.data?.prerequisites || {})
}

export const getEnrolledClassesCount = async (
  institutionId: number,
  userId?: number
): Promise<EnrolledClassCount[]> => {
  let url = '/admin/enroll-courses/enrolled-classes'
  if (userId) {
    url = `/admin/enroll-courses/enrolled-classes/user/${userId}`
  }
  const response = await apiClient.get({
    url,
    needAuth: true,
    params: {
      institutionId,
    },
  })
  return response.data.data
}

export const getEnrolledClassesOfStudentByDate = async (
  institutionId: number,
  userAliasId: number | undefined,
  date: string
): Promise<CurrentlyEnrolledClass[]> => {
  const url = `/admin/enroll-courses/user/${userAliasId}/list`
  const response = await apiClient.get({
    url,
    needAuth: true,
    params: {
      institutionId,
      date,
    },
  })
  return response.data.data
}

export const hasInvoice = async (
  courseId: number
): Promise<{ hasInvoices: boolean; courseId: number }> => {
  const res = await apiClient.get({
    url: `/admin/courses/has-invoices?courseId=${courseId}`,
    needAuth: true,
  })

  return res.data
}

export const createUpdateEmailSettings = async (
  course: UpdateCourseEmailSettingsProps
): Promise<Course> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/courses/email-settings',
    data: {
      courseId: course.courseId,
      emailTitle: course.emailTitle,
      emailId: course.emailId,
      institutionId: course.institutionId,
      siteId: course.siteId,
    },
  })

  return res.data.data
}
