// hooks/useStatisticsData.ts
import { utcToZonedTime } from 'date-fns-tz'
import { useQuery } from 'react-query'

import {
  getDropoutStudents,
  getInvoiceStatistics,
  getLessonDetail,
  getLessonList,
  getStudentStatistics,
} from '@/api/invoice'
import { QUERY_KEY } from '@/constants/queryKey'
import {
  RevenueByItem,
  RevenueOverview,
  StudentByItem,
  StudentOverview,
} from '@/types/enrollCourse'
import { LessonListParams, StatFilter, StatType } from '@/types/statistics'

import useSchoolData from './useSchoolData'
import useSiteData from './useSiteData'

// ================
// TYPE DEFINITIONS
// ================

// For invoice/revenue stats
type RevenueStatDataMap = {
  overview: RevenueOverview
  'by-course': RevenueByItem[]
  'by-class': RevenueByItem[]
  'by-instructor': RevenueByItem[]
}

// For student stats
type StudentStatDataMap = {
  overview: StudentOverview
  'by-student': StudentByItem[]
}

// Generic type resolver
export type GetDataResult<
  TType extends StatType,
  TFilter extends StatFilter
> = TType extends 'revenue'
  ? TFilter extends keyof RevenueStatDataMap
    ? RevenueStatDataMap[TFilter]
    : never
  : TType extends 'student'
  ? TFilter extends keyof StudentStatDataMap
    ? StudentStatDataMap[TFilter]
    : never
  : never

// ==================
// MAIN STATISTICS HOOK (Revenue OR Student)
// ==================
/**
 * Unified hook to fetch either revenue or student statistics.
 * Automatically normalizes startDate/endDate to full calendar month boundaries in site's timezone.
 */
export const useStatisticsData = <
  TType extends StatType,
  TFilter extends StatFilter
>({
  type,
  filter,
  startDate,
}: {
  type: TType
  filter: TFilter
  startDate?: string
  endDate?: string
}) => {
  const { currentSite } = useSiteData()
  const { currentSchool } = useSchoolData()

  // Normalize to full month in site's timezone
  const normalizeToFullMonth = (
    dateStr?: string
  ): { start?: string; end?: string } => {
    if (!dateStr || !currentSite?.timeZone.id) return {}

    try {
      // Parse input date in site's timezone
      const zonedDate = utcToZonedTime(
        new Date(dateStr),
        currentSite.timeZone.id
      )
      const year = zonedDate.getFullYear()
      const month = zonedDate.getMonth()

      // Create start/end of month in SITE TIMEZONE
      const startOfMonth = new Date(Date.UTC(year, month, 1))
      const endOfMonth = new Date(Date.UTC(year, month + 1, 1))

      // Convert to site timezone with offset
      const startInSiteTz = utcToZonedTime(
        startOfMonth,
        currentSite.timeZone.id
      )
      const endInSiteTz = utcToZonedTime(endOfMonth, currentSite.timeZone.id)

      // Return full ISO strings WITH timezone
      return {
        start: startInSiteTz.toISOString(), // e.g., "2025-09-01T00:00:00+07:00"
        end: endInSiteTz.toISOString(), // e.g., "2025-10-01T00:00:00+07:00"
      }
    } catch {
      return {}
    }
  }

  const { start: normalizedStart, end: normalizedEnd } =
    normalizeToFullMonth(startDate)

  // Choose API based on type
  const queryFn = async () => {
    if (
      !normalizedStart ||
      !normalizedEnd ||
      !currentSite?.id ||
      !currentSchool?.id
    ) {
      throw new Error('Missing required parameters for statistics query')
    }

    if (type === 'revenue') {
      return getInvoiceStatistics<GetDataResult<TType, TFilter>>({
        type,
        filter,
        startDate: normalizedStart,
        endDate: normalizedEnd,
        siteId: currentSite?.id ?? 0,
        institutionId: currentSchool?.id ?? 0,
      })
    }
    if (type === 'student') {
      return getStudentStatistics<GetDataResult<TType, TFilter>>({
        filter,
        startDate: normalizedStart,
        endDate: normalizedEnd,
        siteId: currentSite?.id ?? 0,
        institutionId: currentSchool?.id ?? 0,
      })
    }

    throw new Error(`Unsupported stat type: ${type}`)
  }

  return useQuery<GetDataResult<TType, TFilter>>(
    [
      QUERY_KEY.statistics.dynamic,
      type,
      filter,
      currentSchool?.id,
      normalizedStart,
      normalizedEnd,
    ],
    queryFn,
    {
      enabled:
        !!currentSite &&
        !!currentSchool?.id &&
        !!normalizedStart &&
        !!normalizedEnd &&
        !!type &&
        !!filter,
    }
  )
}

// ==================
// LESSON LIST HOOK (Used in Revenue > Overview)
// ==================
export const useLessonList = (
  params: Omit<LessonListParams, 'siteId' | 'institutionId'>
) => {
  const { currentSite } = useSiteData()
  const { currentSchool } = useSchoolData()

  // Normalize dates for lesson list too
  const normalizeDate = (dateStr: string): string => {
    if (!currentSite?.timeZone.id) return dateStr
    try {
      const zonedDate = utcToZonedTime(
        new Date(dateStr),
        currentSite.timeZone.id
      )
      return zonedDate.toISOString()
    } catch {
      return dateStr
    }
  }

  return useQuery(
    [
      QUERY_KEY.statistics.lessonList,
      params.startDate,
      params.endDate,
      params.status,
      params.courseId,
      params.classId,
      params.instructorId,
      params.studentName,
      params.lessonId,
      params.lessonName,
      params.page,
      params.limit,
    ],
    () =>
      getLessonList({
        ...params,
        startDate: normalizeDate(params.startDate), // ← Normalize
        endDate: normalizeDate(params.endDate), // ← Normalize
        siteId: currentSite?.id ?? 0,
        institutionId: currentSchool?.id ?? 0,
      }),
    {
      enabled:
        !!currentSite &&
        !!currentSchool &&
        !!params.startDate &&
        !!params.endDate,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
    }
  )
}

// ==================
// LESSON DETAIL HOOK (Expand row in Revenue tab)
// ==================
export const useLessonDetail = (lessonId: number | null) => {
  const { currentSite } = useSiteData()
  const { currentSchool } = useSchoolData()

  return useQuery(
    [QUERY_KEY.statistics.lessonDetail, lessonId],
    () =>
      getLessonDetail({
        lessonId: lessonId!,
        siteId: currentSite?.id ?? 0,
        institutionId: currentSchool?.id ?? 0,
      }),
    {
      enabled: !!lessonId && !!currentSite && !!currentSchool,
    }
  )
}

// ==================
// DROPOUT STUDENTS HOOK (Expand row in Student tab)
// ==================
export interface DropoutStudent {
  name: string
  phone: string
  email: string
  lastAttendance: string
}

export const useDropoutStudents = (
  classId: number | null,
  startDate?: string,
  endDate?: string
) => {
  const { currentSite } = useSiteData()
  const { currentSchool } = useSchoolData()

  const normalizeDate = (dateStr: string): string => {
    if (!currentSite?.timeZone.id) return dateStr
    try {
      const zonedDate = utcToZonedTime(
        new Date(dateStr),
        currentSite.timeZone.id
      )
      return zonedDate.toISOString()
    } catch {
      return dateStr
    }
  }

  return useQuery(
    [QUERY_KEY.statistics.dropoutStudents, classId, startDate, endDate],
    async () => {
      const response = await getDropoutStudents({
        classId: classId!,
        startDate: startDate ? normalizeDate(startDate) : '',
        endDate: endDate ? normalizeDate(endDate) : '',
        siteId: currentSite?.id ?? 0,
        institutionId: currentSchool?.id ?? 0,
      })
      return response.students as DropoutStudent[]
    },
    {
      enabled:
        !!classId &&
        !!startDate &&
        !!endDate &&
        !!currentSite &&
        !!currentSchool,
    }
  )
}
