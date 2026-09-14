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
