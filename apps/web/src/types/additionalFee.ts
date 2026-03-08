export type AdditionalFeeApplicants = {
  email: string
  phone: string
}
export type GetApplicableAdditionalFeeRequest = {
  siteId: number
  institutionId: number
  courseId: number
  applicants: AdditionalFeeApplicants[]
}

export type ApplicableAdditionalFeeResponse = {
  NEW_STUDENT: number
  newStudentCount: number
  label: string
}

export enum AdditionalFeeConditions {
  NEW_STUDENT = 'NEW_STUDENT',
  ALWAYS = 'ALWAYS',
}
