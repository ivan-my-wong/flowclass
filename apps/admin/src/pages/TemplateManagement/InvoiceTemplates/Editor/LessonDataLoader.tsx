import { useEffect, useMemo } from 'react'

import { useRecoilValue, useSetRecoilState } from 'recoil'

import { useRegularClassData } from '@/hooks/useRegularClassData'
import {
  availableLessonsByClassState,
  invoiceClassesState,
} from '@/stores/studentInvoice.store'
import type { Classes } from '@/types/classes'
import { ClassTypeEnum } from '@/types/course'

/**
 * Fetches and caches lesson data for a single regularV2 class.
 * Stores the result in availableLessonsByClassState so
 * PackageDiscountAutoApplyAll can compute qualification without
 * requiring the user to visit the lesson selection page first.
 */
const ClassLessonDataLoader = ({ classId }: { classId: number }): null => {
  const setAvailableLessonsByClass = useSetRecoilState(
    availableLessonsByClassState
  )
  const { usePreviewClassLessons } = useRegularClassData()

  // Minimal entity — usePreviewClassLessons only needs id and type
  const classEntity = useMemo(
    () => ({ id: classId, type: ClassTypeEnum.regularV2 } as Classes),
    [classId]
  )

  const { data: lessonsData } = usePreviewClassLessons(classEntity)

  useEffect(() => {
    if (lessonsData?.lessons) {
      setAvailableLessonsByClass(prev => ({
        ...prev,
        [classId]: lessonsData.lessons.map(l => ({
          id: l.id,
          date: l.date,
          period: l.period,
        })),
      }))
    }
  }, [lessonsData?.lessons, classId, setAvailableLessonsByClass])

  return null
}

/**
 * Renders one invisible ClassLessonDataLoader per unique regularV2 class
 * in the current invoice. This ensures availableLessonsByClassState is
 * populated for all classes as soon as they appear in the editor —
 * even before the user navigates to a class's lesson selection page.
 */
const LessonDataLoader = (): JSX.Element => {
  const allClasses = useRecoilValue(invoiceClassesState)

  const regularV2ClassIds = useMemo(
    () => [
      ...new Set(
        allClasses
          .filter(c => c.type === ClassTypeEnum.regularV2)
          .map(c => c.classId)
      ),
    ],
    [allClasses]
  )

  return (
    <>
      {regularV2ClassIds.map(classId => (
        <ClassLessonDataLoader key={classId} classId={classId} />
      ))}
    </>
  )
}

export default LessonDataLoader
