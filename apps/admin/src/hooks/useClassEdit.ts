import { useCallback, useMemo } from 'react'

import dayjs from 'dayjs'
import { useRecoilState } from 'recoil'

import { areEqualString2DArrays } from '@/utils/array'
import { lessonObjectToStringArray } from '@/utils/timeString'

import { classEditState } from '../stores/classEditState'
import { Classes, RepeatFormats } from '../types/classes'

export const useClassEdit = () => {
  const [editState, setEditState] = useRecoilState(classEditState)

  const hasBasicInfoChanged = (
    original: Classes,
    current: Classes
  ): boolean => {
    return (
      original?.name !== current?.name ||
      Number(original?.quota) !== Number(current?.quota) ||
      original?.tuition !== current?.tuition
    )
  }

  const hasSettingsChanged = (original: Classes, current: Classes): boolean => {
    return (
      original?.dropIn !== current?.dropIn ||
      original?.setMultipleClass !== current?.setMultipleClass ||
      original?.setMultipleApplicant !== current?.setMultipleApplicant ||
      original?.priceType !== current?.priceType
    )
  }

  const isRecurringChanged = useCallback(
    (original: Classes, current: Classes) => {
      const convertToUnixTimestamp = (time: string) =>
        dayjs(time, 'HH:mm').unix()

      const array1 = original?.recurringSchedules?.filter(item => !item.deleted)
      const array2 = current?.recurringSchedules?.filter(item => !item.deleted)

      const repeatFormat1 = original?.recurringFormat
      const repeatFormat2 = current?.recurringFormat

      const isRepeatFormatChanged =
        !repeatFormat1 ||
        !repeatFormat2 ||
        Object.entries(repeatFormat1).some(
          ([key, value]) => repeatFormat2[key as keyof RepeatFormats] !== value
        )

      let isTimeChanged = false
      if (array1 && array2) {
        isTimeChanged = array1.some((item1, index) => {
          const item2 = array2[index]
          if (item1 && item2) {
            return (
              convertToUnixTimestamp(item1.startTime) !==
                convertToUnixTimestamp(item2.startTime) ||
              convertToUnixTimestamp(item1.endTime) !==
                convertToUnixTimestamp(item2.endTime) ||
              item1.weekDay !== item2.weekDay ||
              item1.deleted !== item2.deleted
            )
          }
          return false
        })
      }

      // If the lengths of the arrays are different, then something has changed
      return (
        isTimeChanged ||
        array1?.length !== array2?.length ||
        isRepeatFormatChanged
      )
    },
    []
  )

  const hasRegularPeriodsChanged = (original: Classes, current: Classes) => {
    if (
      original?.regularPeriods?.length === 0 &&
      current?.regularPeriods?.length === 0
    ) {
      return false
    }

    const period1 = original?.regularPeriods?.map(period =>
      lessonObjectToStringArray(
        period?.lessons?.filter(lesson => !lesson.deleted)
      )
    )
    const period2 = current?.regularPeriods?.map(period =>
      lessonObjectToStringArray(
        period?.lessons?.filter(lesson => !lesson.deleted)
      )
    )

    const repeatFormat1 = original?.regularPeriods?.map(period =>
      JSON.stringify(period?.repeatFormat)
    )
    const repeatFormat2 = current?.regularPeriods?.map(period =>
      JSON.stringify(period?.repeatFormat)
    )

    // write one more function to check if "duration" is changed
    const isUnsavedRepeatPeriod =
      repeatFormat1 && repeatFormat2 && repeatFormat1.length > 0
        ? !repeatFormat1.every((value, index) => value === repeatFormat2[index])
        : true

    const isScheduleUnsaved =
      period1 && period2 && period1.length > 0 && period2.length > 0
        ? !areEqualString2DArrays(period1, period2)
        : true

    return isScheduleUnsaved || isUnsavedRepeatPeriod
  }

  const checkIfChanged = (original: Classes, current: Classes): boolean => {
    return (
      hasBasicInfoChanged(original, current) ||
      hasSettingsChanged(original, current) ||
      original?.dropIn !== current?.dropIn ||
      original?.setMultipleClass !== current?.setMultipleClass ||
      original?.setMultipleApplicant !== current?.setMultipleApplicant ||
      original?.priceType !== current?.priceType ||
      isRecurringChanged(original, current) ||
      hasRegularPeriodsChanged(original, current)
    )
  }

  const isClassesUnsavedChanges = useMemo(() => {
    return Object.entries(editState.classEditCache).some(([classId, cache]) => {
      const original = editState.originalClasses[Number(classId)]

      return cache.isDirty && checkIfChanged(original, cache.data)
    })
  }, [editState.classEditCache, editState.originalClasses])

  const updateClass = (classId: number, updates: Partial<Classes>) => {
    setEditState(prev => ({
      ...prev,
      classEditCache: {
        ...prev.classEditCache,
        [classId]: {
          data: {
            ...prev.classEditCache[classId]?.data,
            ...updates,
          },
          isDirty: true,
        },
      },
    }))
  }

  const initClassEdit = (classId: number, classData: Classes) => {
    setEditState(prev => ({
      ...prev,
      currentEditingClassId: classId,
      originalClasses: {
        ...prev.originalClasses,
        [classId]: classData,
      },
      classEditCache: {
        ...prev.classEditCache,
        [classId]: {
          data: classData,
          isDirty: false,
        },
      },
    }))
  }

  const clearClassEditCache = (classId: number) => {
    setEditState(prev => ({
      ...prev,
      classEditCache: {
        ...prev.classEditCache,
        [classId]: {
          data: prev.originalClasses[classId],
          isDirty: false,
        },
      },
    }))
  }

  const currentEditingClassId = editState.currentEditingClassId ?? null
  const currentEditingClassData = currentEditingClassId
    ? editState.classEditCache[currentEditingClassId]?.data
    : null
  const originalClass = currentEditingClassId
    ? editState.originalClasses[currentEditingClassId]
    : null

  return {
    currentEditingClassId,
    currentEditingClassData,
    originalClass,
    isClassesUnsavedChanges,
    updateClass,
    initClassEdit,
    clearClassEditCache,
  }
}
