import { useMutation, useQuery } from 'react-query'

import { getAvailableTrialLesson, validateTrialLesson } from '@/api/promotionApi'
import { QUERY_KEY } from '@/constants/queryKey'
import { useEnrolState } from '@/stores/enrolContext'
import { ValidateTrialLessonDTO } from '@/types/trial-lesson'

const useTrialLessonData = () => {
  const { school, course } = useEnrolState()
  const institutionId = school?.id || 0
  const siteId = school?.siteId || 0
  const courseId = course?.id || 0

  const useFetchAvailableTrialLesson = (classId?: number) => {
    return useQuery({
      queryKey: [QUERY_KEY.getAvailableTrialLessonKey, institutionId, siteId],
      queryFn: () =>
        getAvailableTrialLesson({
          institutionId,
          siteId,
          courseId,
          classIds: classId ? [classId] : [],
        }),
      enabled: !!course && !!school && !!classId,
    })
  }

  const useValidateTrialLesson = (classId?: number) => {
    return useMutation({
      mutationFn: (payload: ValidateTrialLessonDTO) =>
        validateTrialLesson({
          ...payload,
          institutionId,
          siteId,
          courseId,
        }),
    })
  }
  return {
    useFetchAvailableTrialLesson,
    useValidateTrialLesson,
  }
}
export default useTrialLessonData
