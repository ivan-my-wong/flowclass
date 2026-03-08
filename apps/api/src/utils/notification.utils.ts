import { CustomMessageVariable } from '@/models/enums/'

export const generateDynamicMessage = (data: any) => {
  let msg = data.customMessage ?? ''

  if (msg.includes(CustomMessageVariable.STUDENT_NAME) && data.studentName) {
    msg = msg.replace(CustomMessageVariable.STUDENT_NAME, data.studentName)
  }
  if (msg.includes(CustomMessageVariable.PAYMENT_LINK) && data.paymentLink) {
    msg = msg.replace(CustomMessageVariable.PAYMENT_LINK, data.paymentLink)
  }

  if (msg.includes(CustomMessageVariable.INSTITUTION_NAME) && data.institutionName) {
    msg = msg.replace(CustomMessageVariable.INSTITUTION_NAME, data.institutionName)
  }

  if (msg.includes(CustomMessageVariable.COURSE_NAME) && data.courseName) {
    msg = msg.replace(CustomMessageVariable.COURSE_NAME, data.courseName)
  }

  return msg
}
