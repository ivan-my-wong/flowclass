export type EmbeddedComponentParams = {
  width?: string
  height?: string
  isElement?: string
  institution: string
}

export type EmbeddedCourseCardComponentParams = {
  coursePath: string
} & EmbeddedComponentParams

export type EmbeddedApplicationFormComponentParams = {
  coursePath: string
  schoolPath?: string
} & EmbeddedComponentParams

export enum PageType {
  COURSE = 'course',
  SCHOOL = 'school',
  ENROL = 'enrol',
  SUCCESS_PAYMENT = 'success-payment',
  UPLOAD_RECEIPT = 'upload-receipt',
}
