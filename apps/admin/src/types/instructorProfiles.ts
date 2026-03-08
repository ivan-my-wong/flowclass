export interface InstructorProfile {
  id: number
  userRoleId: number
  isRatesEnabled: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  // Relations
  instructorRates?: InstructorRate[]
}

export interface InstructorRate {
  id: number
  institutionId: number
  userRoleId: number
  userId: number
  instructorProfileId: number
  courseId: number | null
  classIds: number[] | null
  hourlyRate: number
  isDefaultRate: boolean
  isActive: boolean
  effectiveUntil: Date | null
  minimumStudents?: number | null
  additionalSalaryPerStudent?: number | null
  createdAt: Date
  updatedAt: Date
}

// Response DTO that includes instructor profile information
export interface InstructorRatesResponse {
  instructorProfile: InstructorProfile
  rates: InstructorRate[]
  isEnabled: boolean // Convenience field that maps to instructorProfile.isRatesEnabled
  isStudentRatesEnabled: boolean
  studentRatesConfig: StudentRatesConfig | null
}
export interface StudentRatesConfig {
  minimumStudents: number
  additionalSalaryPerStudent: number
}

export interface UpdateInstructorRatesEnabledDto {
  isInstructorRatesEnabled: boolean
  isStudentRatesEnabled: boolean
  studentRatesConfig: StudentRatesConfig | null
}
export interface UpdateInstructorRateDto {
  courseId?: number | null
  classIds?: number[] | null
  hourlyRate?: number
  isDefaultRate?: boolean
  isActive?: boolean
  effectiveUntil?: Date | null
  minimumStudents?: number | null
  additionalSalaryPerStudent?: number | null
}

export interface InstructorSalaryFilterDto {
  startDate?: string
  endDate?: string
  courseId?: number
  classId?: number
}

export interface InstructorSalaryResponseDto {
  totalHours: number
  totalSalary: number
  breakdown: {
    courseId?: number
    courseName?: string
    classId?: number
    className?: string
    hours: number
    rate: number
    salary: number
  }[]
}

export interface InstructorDataDto {
  siteId: number
  institutionId: number
  instructorId?: number
  startDate?: string
  endDate?: string

  courseIds?: number[]
  classIds?: number[]
  locationIds?: number[]
}

export interface InstructorRateForUI {
  id: number
  courseId: number | null
  courseName?: string
  classIds: number[] | null
  classNames?: string[]
  hourlyRate: number
  isDefaultRate: boolean
  isActive: boolean
  effectiveUntil: Date | null
}

export interface BulkUpdateInstructorRatesDto {
  rates: UpdateInstructorRateDto[]
}
