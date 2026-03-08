export enum RegistrationFormPrefix {
  APPLICANT = 'applicant.',
  COMMON = 'common.',
  CUSTOM_QUESTION = 'customQuestion_',
  CREATE_ACCOUNT = 'createAnAccount',
}

export const csvHeadersDetailLesson = [
  { label: 'Student Lesson ID', key: 'id' },
  { label: 'Student name', key: 'name' },
  { label: 'Student phone', key: 'phone' },
  { label: 'Student email', key: 'email' },
  { label: 'Attendance status', key: 'attendanceStatus' },
  { label: 'Course name', key: 'courseName' },
  { label: 'Class name', key: 'className' },
  { label: 'Lesson time', key: 'lessonTime' },
]

export const studentCrmCsvHeaders = [
  { label: 'ID', key: 'id' },
  { label: 'student:column.lastUpdated', key: 'lastUpdated' },
  { label: 'student:userName', key: 'name' },
  { label: 'student:phone', key: 'phone' },
  { label: 'student:email', key: 'email' },

  // { label: 'setting:webpageSetting.currency', key: 'currency' },
  // { label: 'student:paymentAmount', key: 'paymentAmount' },
  // { label: 'student:paymentStatus.status', key: 'paymentState' },
  // { label: 'student:paymentMethod.method', key: 'paymentMethod' },
  // { label: 'student:promotionUsed', key: 'promotionUsed' },
  { label: 'student:column.numberOfApplications', key: 'numberOfApplications' },
  { label: 'student:column.totalRevenue', key: 'totalRevenue' },
  { label: 'student:column.totalPaidRevenue', key: 'totalPaidRevenue' },

  { label: 'student:column.appliedCourse', key: 'courseName' },
  { label: 'student:column.appliedClass', key: 'className' },
  { label: 'student:column.currency', key: 'currency' },
  { label: 'student:column.createdAt', key: 'createdAt' },
  { label: 'student:column.lastAttendanceDate', key: 'lastAttendanceDate' },
  { label: 'student:column.paymentAmount', key: 'paymentAmount' },
  { label: 'student:column.paymentState', key: 'paymentState' },
] as { label: string; key: string }[]

export const csvHeadersExportLessonRecords: { label: string; key: string }[] = [
  { label: 'student:exportCsvHeaders.studentName', key: 'name' },
  { label: 'student:exportCsvHeaders.studentPhone', key: 'phone' },
  { label: 'student:exportCsvHeaders.studentEmail', key: 'email' },
  { label: 'student:exportCsvHeaders.applicationId', key: 'applicationId' },
  { label: 'student:exportCsvHeaders.courseName', key: 'courseName' },
  { label: 'student:exportCsvHeaders.className', key: 'className' },
  { label: 'student:exportCsvHeaders.lessonTimeStart', key: 'lessonTimeStart' },
  { label: 'student:exportCsvHeaders.lessonTimeEnd', key: 'lessonTimeEnd' },
  {
    label: 'student:exportCsvHeaders.attendanceStatus',
    key: 'attendanceStatus',
  },
  { label: 'student:column.lastUpdated', key: 'lastUpdated' },
]
