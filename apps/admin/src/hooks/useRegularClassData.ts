import { useQuery } from 'react-query'

import {
  getDetailRegularClass,
  getRegularClassesV2,
  previewRegularClassLessons,
} from '@/api/classRegularSchedule'
import type { Classes } from '@/types/classes'
import { ClassTypeEnum } from '@/types/course'

import useSchoolData from './useSchoolData'

export const useRegularClassData = () => {
  const { schoolData } = useSchoolData()
  const currentInstitutionId = schoolData.currentSchool?.id.toString() || ''
  /**
   * Fetch regular classes for the current institution.
   * @deprecated
   * @returns
   */
  const useFetchRegularClasses = () => {
    return useQuery({
      queryKey: ['regularClasses', currentInstitutionId],
      queryFn: async () => getRegularClassesV2(+currentInstitutionId),
      enabled: !!currentInstitutionId,
    })
  }

  const usePreviewClassLessons = (classEntity?: Classes) => {
    return useQuery({
      queryKey: ['previewClassLessons', currentInstitutionId, classEntity?.id],
      queryFn: async () => {
        return !classEntity
          ? null
          : previewRegularClassLessons(+currentInstitutionId, classEntity?.id)
      },
      enabled:
        !!currentInstitutionId &&
        !!classEntity &&
        classEntity.type === ClassTypeEnum.regularV2,
    })
  }
  /**
   * Fetch detailed information about a specific regular class.
   * @deprecated
   * @param classId
   * @returns
   */
  const useGetDetailRegularClass = (classId: number) => {
    return useQuery({
      queryKey: ['getDetailRegularClass', classId],
      queryFn: async () =>
        getDetailRegularClass(+currentInstitutionId, classId),
      enabled: !!classId,
    })
  }
  return {
    useFetchRegularClasses,
    useGetDetailRegularClass,
    usePreviewClassLessons,
  }
}
