import { CustomMessage, SupportedType } from '@/types/customMessage'
import {
  CustomMessageType,
  WhatsappTemplateCategory,
  WhatsappTemplateStatus,
} from '@/types/whatsappTemplate'

import { CustomMessageVariable } from './common'

export const defaultWhatsappTemplate: CustomMessage = {
  name: '',
  content: '',
  repeaterFormat: '',
  type: SupportedType.STUDENT_NOTIF_AFTER_ENROLLMENT_SUBMITTED,
}

export const customMessageOptions: CustomMessageType[] = [
  {
    name: `setting:whatsappSetting.customMessageVariable.studentName`,
    value: CustomMessageVariable.STUDENT_NAME,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.schoolName`,
    value: CustomMessageVariable.SCHOOL_NAME,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.className`,
    value: CustomMessageVariable.CLASS_NAME,
  },

  {
    name: `setting:whatsappSetting.customMessageVariable.courseName`,
    value: CustomMessageVariable.COURSE_NAME,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.adminPhone`,
    value: CustomMessageVariable.ADMIN_PHONE,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.location`,
    value: CustomMessageVariable.LOCATION,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.classLessonDate`,
    value: CustomMessageVariable.CLASS_LESSON_DATE,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.newClassLessonDate`,
    value: CustomMessageVariable.NEW_CLASS_LESSON_DATE,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.period`,
    value: CustomMessageVariable.PERIOD,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.payAmount`,
    value: CustomMessageVariable.PAY_AMOUNT,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.uploadPaymentUrl`,
    value: CustomMessageVariable.UPLOAD_PAYMENT_URL,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.courseItems`,
    value: CustomMessageVariable.COURSE_ITEMS,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.lessonItems`,
    value: CustomMessageVariable.LESSON_ITEMS,
  },
]

export const courseItemVariableOptions: CustomMessageType[] = [
  {
    name: `setting:whatsappSetting.customMessageVariable.courseIndex`,
    value: CustomMessageVariable.COURSE_INDEX,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.courseName`,
    value: CustomMessageVariable.COURSE_NAME,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.schedule`,
    value: CustomMessageVariable.COURSE_SCHEDULE,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.lessonCount`,
    value: CustomMessageVariable.LESSON_COUNT,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.teacherName`,
    value: CustomMessageVariable.TEACHER_NAME,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.lessonDatesLabel`,
    value: CustomMessageVariable.LESSON_DATES_LABEL,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.lessonDates`,
    value: CustomMessageVariable.LESSON_DATES,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.coursePrice`,
    value: CustomMessageVariable.COURSE_PRICE,
  },
]

export const lessonItemVariableOptions: CustomMessageType[] = [
  {
    name: `setting:whatsappSetting.customMessageVariable.lessonIndex`,
    value: CustomMessageVariable.LESSON_INDEX,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.courseName`,
    value: CustomMessageVariable.COURSE_NAME,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.lessonDate`,
    value: CustomMessageVariable.LESSON_DATE,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.lessonTime`,
    value: CustomMessageVariable.LESSON_TIME,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.teacherName`,
    value: CustomMessageVariable.TEACHER_NAME,
  },
  {
    name: `setting:whatsappSetting.customMessageVariable.location`,
    value: CustomMessageVariable.LOCATION,
  },
]

export const categoriesSupported = [
  {
    name: 'whatsappTemplate:category.utility',
    value: WhatsappTemplateCategory.UTILITY,
  },
  {
    name: 'whatsappTemplate:category.authentication',
    value: WhatsappTemplateCategory.AUTHENTICATION,
  },

  {
    name: 'whatsappTemplate:category.marketing',
    value: WhatsappTemplateCategory.MARKETING,
  },
]

export const whatsAppStatusesSupported = [
  {
    name: 'whatsappTemplate:category.all',
    value: 'all',
  },
  {
    name: 'whatsappTemplate:status.approved',
    value: WhatsappTemplateStatus.APPROVED,
  },
  {
    name: 'whatsappTemplate:status.rejected',
    value: WhatsappTemplateStatus.REJECTED,
  },
  {
    name: 'whatsappTemplate:status.pending',
    value: WhatsappTemplateStatus.PENDING,
  },
  {
    name: 'whatsappTemplate:status.unsubmitted',
    value: WhatsappTemplateStatus.UNSUBMITTED,
  },
]
