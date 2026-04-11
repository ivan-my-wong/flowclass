import { PaymentState } from '@/constants/payment'
import { CustomFieldFilterOption } from '@/pages/StudentCRM/components/CustomFormFieldFilter'
import { ClassTypeEnum } from '@/types/course'
import {
  EditStudentFormResponse,
  EnrollConfirmState,
  EnrollCourseInstance,
  Invoice,
  PayLaterMethod,
  SendCustomMessage,
  StudentFormResponse,
} from '@/types/enrollCourse'
import { FilterMatchMode } from '@/types/options'
import {
  CheckImportStudentType,
  GetChargeFrequencyValues,
  ImportStudentResponse,
  QRCodeStudentAttendanceData,
  SendAddLessonEmailParams,
  SendApplicationLinkEmailParams,
  SendChangeLessonEmailParams,
  StudentEnrolmentRecord,
  StudentLesson,
  StudentNotificationResponse,
  TypeCreateStudent,
  TypeDeleteStudentParams,
  TypeEditStatusStudentParams,
  TypeGetCouponParams,
  TypeGetLessonOpt,
  TypeGetStudentDetail,
  TypeGetTeachingServiceOpt,
  TypeParamsExportStudent,
  TypeParamsGetColumnName,
  TypeParamsImportStudent,
  TypeStudentEnrollment,
  TypeUpdateEnrollCourse,
  TypeUserIdAndInstitutionId,
  UpdateInvoicePaymentStateDto,
} from '@/types/student'
import {
  StudentAddEnrollmentFormRequestDto,
  StudentAddLessonRequestDto,
  StudentChangeLessonRequestDto,
  StudentCreateTeachingServiceRequestDto,
  StudentDeleteEnrollmentFormRequestDto,
  StudentDeleteTeachingServiceRequestDto,
  StudentUpdateTeachingServiceRequestDto,
} from '@/types/studentAddTeachingService'
import {
  EditStudentContactInfoRequestDto,
  EditStudentContactInfoV2RequestDto,
  StudentInfoResponse,
  UserAlias,
} from '@/types/studentMemo'
import { SELECT_STUDENT_FIELDS } from '@/types/studentOnboard'
import { StudentUser } from '@/types/user'

import apiClient from './index'

export type GetTeachingServiceResponseDto = {
  classId: number
  className: string
  confirmState: EnrollConfirmState // You might want to define other possible states
  courseId: number
  courseImg: string
  courseName: string
  enrollCourseId: number
  invoiceId: number
  lessons: StudentLesson[]
  paymentState: PaymentState // You might want to define other possible states
  registrationForm: StudentFormResponse[]
  classType: ClassTypeEnum
}

export const getStudentList = async ({
  siteId,
  schoolId,
  courseId,
}: {
  siteId: number
  schoolId: number
  courseId?: number
}): Promise<Invoice[]> => {
  const res = await apiClient.get({
    url: '/admin/enroll-courses',
    needAuth: true,
    params: {
      siteId,
      institutionId: schoolId,
      courseId,
    },
  })
  // not sure changed to res.data?.content
  // can change back if needed
  return res.data?.data.content
}

export const getStudentInvoiceList = async ({
  siteId,
  schoolId,
  courseId,
  payload,
  userId,
}: {
  siteId: number
  schoolId: number
  courseId?: number
  payload?: Record<string, any>
  userId?: number
}): Promise<Invoice[]> => {
  let url = '/admin/invoices/all'
  if (userId) {
    url = `/admin/invoices/all/user/${userId}`
  }
  const res = await apiClient.post({
    url,
    needAuth: true,
    params: {
      siteId,
      institutionId: schoolId,
      courseId,
    },
    data: {
      ...payload,
      institutionId: schoolId,
    },
  })
  // not sure changed to res.data?.content
  // can change back if needed
  return res.data?.data.content
}

export const getStudentInvoiceStatistics = async ({
  startDate,
  endDate,
  siteId,
  institutionId,
}: {
  startDate?: string
  endDate?: string
  siteId: number
  institutionId: number
}): Promise<Invoice[]> => {
  const res = await apiClient.get({
    url: '/admin/invoices/statistics/basic',
    needAuth: true,
    params: { siteId, institutionId, startDate, endDate },
  })
  return res.data.data
}

export const getStudentSingleInvoice = async (
  institutionId: number,
  invoiceId: number
): Promise<Invoice> => {
  const res = await apiClient.get({
    url: `/admin/invoices/detail/${invoiceId}`,
    needAuth: true,
    params: { institutionId },
  })
  return res.data.data
}

export const getAllStudentsOfInstitutionNew = async ({
  id,
  siteId,
  userRoleId,
  type,
  payload,
}: {
  id: number
  siteId: number
  userRoleId?: number
  type: string
  payload?: Record<string, any>
}): Promise<StudentEnrolmentRecord[]> => {
  // It will call another API if it has to limit by user role
  let url = '/admin/student-onboard/list-student'

  if (userRoleId) {
    url = `/admin/student-onboard/list-student/user-role/${userRoleId}`
  }

  const res = await apiClient.post({
    url,
    needAuth: true,
    params: {
      institutionId: id,
      siteId,
      type,
    },
    data: {
      select: SELECT_STUDENT_FIELDS,
      ...payload,
    },
  })
  return res.data.data
}

export const getStudentsByCustomFieldFilter = async (
  id: number,
  siteId: number,
  type: string,
  matchMode: FilterMatchMode,
  customFieldFilterList: CustomFieldFilterOption[]
): Promise<StudentEnrolmentRecord[]> => {
  const res = await apiClient.post({
    url: '/admin/student-onboard/filter/custom-field',
    needAuth: true,
    data: {
      institutionId: id,
      siteId,
      type,
      matchMode,
      filterRules: customFieldFilterList,
    },
  })
  return res.data.data
}

export const getCurrentStudentQrCodeAttendanceData = async (
  id: number,
  institutionId: number
): Promise<QRCodeStudentAttendanceData[]> => {
  const res = await apiClient.get({
    url: '/admin/student-onboard/student-lessons',
    needAuth: true,
    params: {
      userId: id,
      institutionId,
    },
  })

  return res.data.data
}
export const createStudent = async (
  params: Partial<TypeCreateStudent>
): Promise<StudentUser> => {
  const res = await apiClient.post({
    url: `/admin/student-onboard/create`,
    needAuth: true,
    data: params,
  })

  return res.data.data
}

export const getStudentDetail = async (
  params: TypeGetStudentDetail
): Promise<StudentUser> => {
  const res = await apiClient.get({
    url: `/admin/student-onboard/view/${params?.userAliasId}`,
    needAuth: true,
    params,
  })

  return res.data.data
}

export const getStudentEnrollLesson = async (
  studentLessonIds: number[],
  invoiceId: number
): Promise<any> => {
  const res = await apiClient.post({
    url: `/admin/student-onboard/get-enroll-student-lesson`,
    needAuth: true,
    data: { studentLessonIds, invoiceId },
  })

  return res.data.data
}

export const deleteStudent = async (
  params: Partial<TypeDeleteStudentParams>
): Promise<any> => {
  const res = await apiClient.post({
    url: `/admin/student-onboard/delete`,
    needAuth: true,
    params: {
      institutionId: params.institutionId,
      siteId: params.siteId,
    },
    data: params,
  })

  return res.data.data
}

export const mergeStudent = async (params: {
  institutionId: number
  siteId: number
  sourceUserAliasId: number
  targetUserAliasId: number
}): Promise<any> => {
  const res = await apiClient.post({
    url: `/admin/student-onboard/merge-student`,
    needAuth: true,
    params: {
      institutionId: params.institutionId,
      siteId: params.siteId,
    },
    data: params,
  })
  return res.data.data
}

export const editStatusStudent = async (
  params: Partial<TypeEditStatusStudentParams>
): Promise<any> => {
  const res = await apiClient.post({
    url: `/admin/student-onboard/update-status`,
    needAuth: true,
    params: {
      institutionId: params.institutionId,
      siteId: params.siteId,
    },
    data: params,
  })

  return res.data
}

export const getCoupon = async (
  params: Partial<TypeGetCouponParams>
): Promise<any> => {
  const res = await apiClient.get({
    url: `/admin/student-onboard/coupon`,
    needAuth: true,
    params,
  })
  return res.data
}

export const getTeachingService = async (
  params: TypeUserIdAndInstitutionId
): Promise<GetTeachingServiceResponseDto[]> => {
  const res = await apiClient.get({
    url: `/admin/student-onboard/get-student-teaching-service`,
    needAuth: true,
    params: {
      userId: params.userId,
      institutionId: params.institutionId,
      siteId: params.siteId,
      userAliasId: params.userAliasId,
      invoiceId: params.invoiceId,
    },
  })

  return res.data.data
}

export const getTeachingServiceOpts = async (
  params: TypeGetTeachingServiceOpt
): Promise<any> => {
  const res = await apiClient.get({
    url: `/admin/student-onboard/teaching-service-opt`,
    needAuth: true,
    params,
  })

  return res.data.data
}

export const addTeachingService = async (
  params: StudentCreateTeachingServiceRequestDto
): Promise<EnrollCourseInstance> => {
  const res = await apiClient.post({
    url: `/admin/student-onboard/add-teaching-service`,
    needAuth: true,
    params: {
      institutionId: params.institutionId,
      siteId: params.siteId,
    },
    data: params,
  })

  return res.data.data
}

export const bulkAddTeachingService = async (
  params: StudentCreateTeachingServiceRequestDto
): Promise<{ jobId: string }> => {
  const res = await apiClient.post({
    url: `/admin/student-onboard/bulk-add-teaching-service`,
    needAuth: true,
    params: {
      institutionId: params.institutionId,
      siteId: params.siteId,
    },
    data: params,
  })

  return res.data.data
}

export const updateTeachingService = async (
  params: StudentCreateTeachingServiceRequestDto,
  enrolId: number
): Promise<EnrollCourseInstance> => {
  const payload = {
    ...params,
  }

  if (typeof payload.email === 'string' && payload.email.trim() === '') {
    delete payload.email
  }

  const res = await apiClient.patch({
    url: `/admin/student-onboard/update-teaching-service/${enrolId}`,
    needAuth: true,
    params: {
      institutionId: params.institutionId,
      siteId: params.siteId,
    },
    data: payload,
  })

  return res.data.data
}

export const getLessonOpts = async (params: TypeGetLessonOpt): Promise<any> => {
  const res = await apiClient.get({
    url: `/admin/student-onboard/student-change-lesson-opt`,
    needAuth: true,
    params,
  })
  return res.data.data
}

export const studentAddLesson = async (
  params: StudentAddLessonRequestDto
): Promise<string> => {
  const res = await apiClient.post({
    url: `/admin/student-onboard/add-extra-lesson`,
    needAuth: true,
    params: {
      extraLessons: params.extraLessons,
      enrolId: params.enrollId,
      numOfLesson: params.numOfLesson,
      feePerLesson: params.feePerLesson,
      isCustomised: true,
      recurringScheduleId: params.recurringScheduleId,
      studentScheduleId: params.studentScheduleId,
    },
    data: params,
  })

  return res.data.data
}

export const studentChangeLesson = async (
  params: StudentChangeLessonRequestDto
): Promise<StudentLesson> => {
  const res = await apiClient.post({
    url: `/admin/student-onboard/student-change-lesson`,
    needAuth: true,
    params: {
      siteId: params.siteId,
      institutionId: params.institutionId,
      courseId: params.courseId,
      classId: params.classId,
      currentLessonId: params.currentLessonId,
      lessonDateTime: params.lessonDateTime,
    },
    data: params,
  })

  return res.data.data
}

export const DeleteTeachingService = async (
  params: StudentDeleteTeachingServiceRequestDto
): Promise<any> => {
  const res = await apiClient.post({
    url: `/admin/student-onboard/delete-teaching-service`,
    needAuth: true,
    params: {
      institutionId: params.institutionId,
      siteId: params.siteId,
    },
    data: params,
  })

  return res.data.data
}

export type GetStudentEnrollmentParams = {
  userId: number
  institutionId: number
  siteId: number
  userAliasId: number
}

export const GetStudentEnrollment = async (
  params: GetStudentEnrollmentParams
): Promise<Record<string, TypeStudentEnrollment>> => {
  const res = await apiClient.get({
    url: `/admin/student-onboard/student-enrollment`,
    needAuth: true,
    params: {
      userId: params.userId,
      institutionId: params.institutionId,
      siteId: params.siteId,
      userAliasId: params.userAliasId,
    },
  })
  return res.data.data
}

export const UpdateStudentEnrollment = async (
  data: StudentUpdateTeachingServiceRequestDto
): Promise<EditStudentFormResponse[]> => {
  const res = await apiClient.post({
    url: `/admin/student-onboard/update-student-enrollment`,
    needAuth: true,
    params: {
      institutionId: data.institutionId,
      siteId: data.siteId,
    },
    data: {
      institutionId: data.institutionId,
      userId: data.userId,
      userAliasId: data.userAliasId,
      metadata: data.metadata,
      invoiceId: data.invoiceId,
    },
  })
  return res.data.data
}

export const addEnrollmentForm = async (
  data: StudentAddEnrollmentFormRequestDto
): Promise<EnrollCourseInstance> => {
  const res = await apiClient.post({
    url: `/admin/student-onboard/add-fields-to-student-record`,
    needAuth: true,
    params: {
      userId: data.userId,
      institutionId: data.institutionId,
      userAliasId: data.userAliasId,
      fields: data.fields,
    },
    data,
  })
  return res.data.data
}

export const deleteEnrollmentForm = async (
  data: StudentDeleteEnrollmentFormRequestDto
): Promise<EnrollCourseInstance> => {
  const res = await apiClient.delete({
    url: `/admin/student-onboard/delete-field-from-student-record`,
    needAuth: true,
    params: {
      userId: data.userId,
      institutionId: data.institutionId,
      userAliasId: data.userAliasId,
      fieldId: data.fieldId,
    },
    data,
  })
  return res.data.data
}

export const updateEnrollCourse = async (
  params: Partial<TypeUpdateEnrollCourse>
): Promise<any> => {
  const res = await apiClient.post({
    url: `/admin/student-onboard/update-enroll-course`,
    needAuth: true,
    params: {
      institutionId: params.institutionId,
      siteId: params.siteId,
    },
    data: params,
  })
  return res.data.data
}

export const updateInvoicePaymentState = async (
  params: Partial<UpdateInvoicePaymentStateDto>
): Promise<any> => {
  const res = await apiClient.post({
    url: `/admin/invoices/update-payment-state`,
    needAuth: true,
    params: {
      institutionId: params.institutionId,
      siteId: params.siteId,
    },
    data: params,
  })
  return res.data.data
}

export const deleteSingleStudentLesson = async (id: number) => {
  const res = await apiClient.delete({
    url: `/admin/student-onboard/delete-lesson/${id}`,
    needAuth: true,
  })
  return res.data.data
}

export const checkImportStudentDataValid = async (
  params: CheckImportStudentType
): Promise<any> => {
  const { mapDbValue, institutionId, siteId, file } = params
  const formData = new FormData()
  formData.append('file', file)
  formData.append('mapDbValue', JSON.stringify(mapDbValue))

  const res = await apiClient.post({
    url: `/admin/student-onboard/check-csv`,
    needAuth: true,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: {
      siteId,
      institutionId,
    },
  })
  return res.data.data
}

export const getChargeFrequencyValues = async (
  params: GetChargeFrequencyValues
): Promise<any> => {
  const { fields, file } = params
  const formData = new FormData()
  formData.append('file', file)
  formData.append('fields', JSON.stringify(fields))

  const res = await apiClient.post({
    url: `/admin/student-onboard/get-charge-frequency-values`,
    needAuth: true,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data.data
}

export const importStudent = async (
  params: TypeParamsImportStudent
): Promise<ImportStudentResponse[]> => {
  // const { fields, institutionId, siteId, file } = params
  const res = await apiClient.post({
    url: `/admin/student-onboard/import`,
    needAuth: true,
    data: params,
  })
  return res.data.data
}

export const exportStudent = async (
  params: TypeParamsExportStudent
): Promise<any> => {
  const res = await apiClient.post({
    url: `/admin/student-onboard/export`,
    needAuth: true,
    params: {
      institutionId: params.institutionId,
      siteId: params.siteId,
    },
    data: params,
  })
  return res.data.data
}

export const getColumnName = async (
  params: TypeParamsGetColumnName
): Promise<any> => {
  const formData = new FormData()
  formData.append('file', params.file)
  // formData.append('institutionId', params.institutionId.toString())
  // formData.append('siteId', params.siteId.toString())

  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/student-onboard/column-names',
    data: formData,
    // headers: {
    //   'Content-Type': 'multipart/form-data',
    // },
    params: {
      institutionId: params.institutionId,
      siteId: params.siteId,
    },
  })

  return res.data.data
}

export const sendApplicationLink = async (
  params: SendApplicationLinkEmailParams
): Promise<void> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/notification-reminder/send-application-link-email',
    data: params,
  })
  return res.data.data
}

export const sendChangeLessonNotiReq = async (
  params: SendChangeLessonEmailParams
): Promise<any> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/notification-reminder/send-change-lesson-email',
    data: params,
  })
  return res.data.data
}

export const sendAddLessonNotiReq = async (
  params: SendAddLessonEmailParams
): Promise<any> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/notification-reminder/send-add-lesson-email',
    data: params,
  })
  return res.data.data
}

export const updateRemarks = async (params: {
  userAliasId: number
  remarks: string | null
}): Promise<{ id: number; remarks: string | null }> => {
  const res = await apiClient.patch({
    needAuth: true,
    url: '/admin/student-onboard/update-remarks',
    data: params,
  })
  return res.data.data
}

/**
 * @deprecated Use updateStudentContactInfoV2 instead
 */
export const updateStudentContactInfo = async (
  params: EditStudentContactInfoRequestDto
): Promise<StudentInfoResponse> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/student-onboard/update-contact-info',
    data: {
      userId: params.userId,
      institutionId: params.institutionId,
      contactEmail: params.contactEmail,
      contactPhone: params.contactPhone,
      contactName: params.contactName,
    },
  })
  return res.data.data
}

export const updateStudentContactInfoV2 = async (
  params: EditStudentContactInfoV2RequestDto
): Promise<StudentInfoResponse> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/student-onboard/update-contact-info-v2',
    data: {
      userId: params.userId,
      institutionId: params.institutionId,
      userAliasId: params.userAliasId,
      alias: params.alias,
      email: params.email,
      phone: params.phone,
      invoiceId: params.invoiceId,
      secondaryEmail: params.secondaryEmail,
    },
  })
  return res.data.data
}

export const updateAttendance = async (params: any): Promise<any> => {
  const res = await apiClient.patch({
    needAuth: true,
    url: '/admin/student-onboard/update-attendance',
    data: params,
  })
  return res.data.data
}

export const updateStudentLessonRemarks = async (params: {
  studentLessonId: number
  remarks: string | null
}): Promise<{ id: number; remarks: string | null }> => {
  const res = await apiClient.patch({
    needAuth: true,
    url: '/admin/student-onboard/update-student-lesson-remarks',
    data: params,
  })
  return res.data.data
}

export const getStudentFormFieldsValue = async (
  institutionId: number,
  studentId: number
): Promise<StudentFormResponse[]> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/student-onboard/student-form-field',
    data: {
      institutionId,
      userId: studentId,
    },
  })
  return res.data.data
}

export const getStudentNotification = async (
  institutionId: number,
  userId: number
): Promise<StudentNotificationResponse[]> => {
  const res = await apiClient.get({
    needAuth: true,
    url: '/admin/student-onboard/notification-setting',
    params: { institutionId, userId },
  })
  return res.data.data
}

export const submitStudentNotification = async (data: {
  institutionId: number
  userId: number
  data: StudentNotificationResponse[]
}): Promise<StudentNotificationResponse[]> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/student-onboard/notification-setting',
    data,
  })
  return res.data.data
}

export const sendInvoiceCustomMessage = async (
  institutionId: number,
  payload: SendCustomMessage
): Promise<null | undefined> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/invoices/send-custom-messages',
    params: { institutionId },
    data: payload,
  })
  return res.data
}

export const updatePaymentAmount = async (
  institutionId: number,
  payload: { invoiceId: number; paymentAmount: number }
): Promise<void> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/invoices/update-payment-amount',
    params: { institutionId },
    data: payload,
  })
  return res.data.data
}

export const updateAmountPaid = async (
  institutionId: number,
  payload: { invoiceId: number; amountPaid: number }
): Promise<void> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/invoices/update-amount-paid',
    params: { institutionId },
    data: payload,
  })
  return res.data.data
}

export const updatePayLaterMethod = async (
  institutionId: number,
  payload: { invoiceId: number; payLaterMethod?: PayLaterMethod }
): Promise<void> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/invoices/update-pay-later-method',
    params: { institutionId },
    data: payload,
  })
  return res.data.data
}

export const updateRemarkInvoice = async (
  institutionId: number,
  payload: { invoiceId: number; remark: string }
): Promise<void> => {
  const res = await apiClient.put({
    needAuth: true,
    url: `/admin/invoices/remark/${payload.invoiceId}`,
    params: { institutionId },
    data: payload,
  })
  return res.data.data
}

export const deleteRemarkInvoice = async (
  institutionId: number,
  invoiceId: number
): Promise<void> => {
  const res = await apiClient.delete({
    needAuth: true,
    url: `/admin/invoices/remark/${invoiceId}`,
    params: { institutionId },
  })
  return res.data.data
}

export const getParentAccount = async (
  institutionId: number
): Promise<UserAlias[]> => {
  const res = await apiClient.get({
    needAuth: true,
    url: '/admin/student-onboard/get-parent-account',
    params: { institutionId },
  })
  return res.data.data
}

// set-parent-account
export const setParentAccount = async (data: {
  isParent: boolean
  userAliasId: number
  institutionId: number
}): Promise<UserAlias> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/student-onboard/set-parent-account',
    params: { institutionId: data.institutionId },
    data,
  })
  return res.data.data
}

// add-to-parent-group
export const addToParentGroup = async (data: {
  parentId: number
  userAliasId: number
  institutionId: number
}): Promise<UserAlias> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/student-onboard/add-to-parent-group',
    params: { institutionId: data.institutionId },
    data,
  })
  return res.data.data
}

// change-parent-group
export const changeParentGroup = async (data: {
  oldParentId: number
  newParentId: number
  userAliasId: number
  institutionId: number
}): Promise<UserAlias> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/student-onboard/change-parent-group',
    params: { institutionId: data.institutionId },
    data,
  })
  return res.data.data
}

// remove-from-parent-group
export const removeFromParentGroup = async (data: {
  oldParentId: number
  newParentId?: number
  userAliasId: number
  institutionId: number
  isDeleted: boolean
}): Promise<UserAlias> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/student-onboard/remove-from-parent-group',
    params: { institutionId: data.institutionId },
    data,
  })
  return res.data.data
}

// detail-account-group/:aliasId
export const getDetailAccountGroup = async (
  userAliasId: number,
  institutionId: number
): Promise<UserAlias> => {
  const res = await apiClient.get({
    needAuth: true,
    url: `/admin/student-onboard/detail-account-group/${userAliasId}`,
    params: { institutionId },
  })
  return res.data.data
}

// get-students-by-phone
export const getStudentsByPhone = async (
  phone: string,
  institutionId: number
): Promise<UserAlias[]> => {
  const res = await apiClient.get({
    needAuth: true,
    url: '/admin/student-onboard/get-students-by-phone',
    params: { phone, institutionId },
  })
  return res.data.data
}

export const updatePaymentDate = async (
  institutionId: number,
  payload: {
    invoiceId: number
    paymentDate?: string
    createdAt?: string
    updatedAt?: string
  }
): Promise<void> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/invoices/update-payment-date',
    params: { institutionId },
    data: payload,
  })
  return res.data.data
}
