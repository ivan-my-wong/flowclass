import { ColDef } from 'ag-grid-community'
import { DefaultTFuncReturn } from 'i18next'

import { UserRole } from '@/stores/userPermissionData'

export const userAccessTable = [
  { field: 'email', filter: true },
  { field: 'accessLevel', filter: true },
  { field: 'lastActiveTime', filter: true },
]

export const roleOptions: Record<
  UserRole,
  { value: UserRole; label: DefaultTFuncReturn }[]
> = {
  [UserRole.MasterAdmin]: [
    { value: UserRole.SiteAdmin, label: 'common:roles.siteAdmin' },
    { value: UserRole.SchoolAdmin, label: 'common:roles.schoolAdmin' },
    { value: UserRole.Instructor, label: 'common:roles.instructor' },
    { value: UserRole.Operations, label: 'common:roles.operations' },
  ],
  [UserRole.SiteAdmin]: [
    { value: UserRole.SiteAdmin, label: 'common:roles.siteAdmin' },
    { value: UserRole.SchoolAdmin, label: 'common:roles.schoolAdmin' },
    { value: UserRole.Instructor, label: 'common:roles.instructor' },
    // { value: UserRole.Operations, label: 'common:roles.operations' },
  ],
  [UserRole.SchoolAdmin]: [
    { value: UserRole.SchoolAdmin, label: 'common:roles.schoolAdmin' },
    { value: UserRole.Instructor, label: 'common:roles.instructor' },
    // { value: UserRole.Operations, label: 'common:roles.operations' },
  ],
  [UserRole.Instructor]: [
    { value: UserRole.Instructor, label: 'common:roles.instructor' },
    // { value: UserRole.Operations, label: 'common:roles.operations' },
  ],
  [UserRole.Operations]: [
    { value: UserRole.Operations, label: 'common:roles.operations' },
  ],
  [UserRole.Guest]: [],
  [UserRole.Student]: [],
}

export enum InstructorLessonTableField {
  STATUS = 'status',
  DATE = 'date',
  COURSE = 'course',
  CLASS = 'class',
  LOCATION = 'location',
  NUMBER_OF_STUDENTS = 'numberOfStudents',
  DURATION = 'duration',
  SALARY = 'salary',
  HOURLY_RATE = 'hourlyRate',
}

export const lessonTableColumns: ColDef[] = [
  {
    field: InstructorLessonTableField.STATUS,
    headerName: 'setting:userManagement.lessonTable.status',
    maxWidth: 80,
  },
  {
    field: InstructorLessonTableField.DATE,
    headerName: 'setting:userManagement.lessonTable.date',
    minWidth: 350,
  },
  {
    field: InstructorLessonTableField.COURSE,
    headerName: 'setting:userManagement.lessonTable.course',
  },
  {
    field: InstructorLessonTableField.CLASS,
    headerName: 'setting:userManagement.lessonTable.class',
  },
  {
    field: InstructorLessonTableField.LOCATION,
    headerName: 'setting:userManagement.lessonTable.location',
  },
  {
    field: InstructorLessonTableField.NUMBER_OF_STUDENTS,
    headerName: 'setting:userManagement.lessonTable.numberOfStudents',
  },

  {
    field: InstructorLessonTableField.HOURLY_RATE,
    headerName: 'setting:userManagement.lessonTable.hourlyRate',
  },

  {
    field: InstructorLessonTableField.DURATION,
    headerName: 'setting:userManagement.lessonTable.duration',
  },

  {
    field: InstructorLessonTableField.SALARY,
    headerName: 'setting:userManagement.lessonTable.salary',
  },
]
