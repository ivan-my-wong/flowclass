import { FC, useCallback, useEffect, useMemo } from 'react'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { FaArrowLeft } from 'react-icons/fa'
import { useRecoilState, useRecoilValue } from 'recoil'

import { Spinner } from '@/components/Loaders/Spinner'
import { Button } from '@/components/ui/Button'
import useStudentInvoice from '@/hooks/useStudentInvoice'
import {
  classesState,
  invoiceClassesState,
  invoiceSessionState,
} from '@/stores/studentInvoice.store'
import { Classes } from '@/types/classes'
import { PriceType } from '@/types/course'
import { EnrollConfirmState } from '@/types/enrollCourse'
import { LessonPreview, PriceOption } from '@/types/regularClass'
import { StudentLesson } from '@/types/student'
import {
  CurrentlyEnrolledClass,
  InvoiceClassType,
} from '@/types/studentInvoice.type'

import ClassSelection from './ClassSelection'
import {
  AllEnrolledData,
  useContextEnrolledClass,
} from './EnrolledClassContext'

interface Props {
  closeDialog: () => void
  back: () => void
}
const ClassSelectionContainer: FC<Props> = ({
  back,
  closeDialog,
}): JSX.Element => {
  const { t } = useTranslation('invoiceCampaign')
  const allClasses = useRecoilValue(classesState)
  const [allInvoiceClasses, setAllInvoiceClasses] =
    useRecoilState(invoiceClassesState)
  const [allInvoiceSessions, setAllInvoiceSessions] =
    useRecoilState(invoiceSessionState)
  const {
    studentToEnroll,
    selectedClasses,
    isEnrollAllStudents,
    allStudentsToEnroll,
    date,
    setAvailableClassesAndSessions,
  } = useContextEnrolledClass()

  const { useGetAllCurrentlyEnrolledClassesOfStudent } = useStudentInvoice()

  const formatAvailableClassesAndSession = useCallback(
    (allCurrentlyEnrolledClasses: CurrentlyEnrolledClass[]) => {
      if (!allCurrentlyEnrolledClasses?.length || !studentToEnroll) return []
      const merged = allCurrentlyEnrolledClasses
        .filter(all => all.confirmState === EnrollConfirmState.ACCEPTED)
        .reduce((acc, all) => {
          all.multipleClassMapping.forEach(({ classId }) => {
            const classInfo = allClasses.find(c => c.id === classId)
            if (!classInfo) return

            const sessions = all.studentSchedule.flatMap(s =>
              s.studentLessons.filter(l => l.classId === classId)
            )

            const existing = acc.find(item => item.classId === classId)
            if (existing) existing.sessions = sessions
            else acc.push({ classId, classInfo, sessions })
          })
          return acc
        }, [] as { classId: number; classInfo: Classes; sessions: StudentLesson[] }[])

      return merged.map(({ classInfo, sessions }) => {
        const { price, selectedPriceOption } = determinePrice(
          classInfo.priceOptions,
          classInfo.priceType,
          sessions.length
        )

        const classData: InvoiceClassType & { parentName: string } = {
          type: classInfo.type,
          studentItem: studentToEnroll,
          classId: classInfo.id,
          price,
          courseId: classInfo.courseId,
          courseName: classInfo.name,
          parentName: classInfo.course?.name ?? '',
          priceType: classInfo.priceType,
          priceOption: selectedPriceOption,
          remark: '',
          sessionLength: sessions.length,
          dropIn: classInfo.dropIn,
          recurringFormat: classInfo.recurringFormat,
        }

        const sessionData: LessonPreview[] = sessions.map(s => ({
          id: Number.parseInt(s.id, 10),
          date: dayjs(s.startTime).format('YYYY-MM-DD'),
          startTime: s.startTime,
          endTime: s.endTime,
          lessonNumber: 1,
          isBlocked: false,
          isOverride: false,
        }))

        return { classData, sessionData }
      })
    },
    [allClasses, studentToEnroll]
  )

  const {
    mutateAsync: fetchAllEnrolledClasses,
    isLoading: isFetchingEnrolledClasses,
  } = useGetAllCurrentlyEnrolledClassesOfStudent(data => {
    const result = formatAvailableClassesAndSession(data)
    setAvailableClassesAndSessions(result)
  })

  const determinePrice = (
    priceOptions: PriceOption[],
    outerPriceType: PriceType,
    sessionLength: number
  ): { price: number; selectedPriceOption?: PriceOption } => {
    if (!priceOptions || priceOptions.length === 0) {
      return { price: 0, selectedPriceOption: undefined }
    }
    let selectedPriceOption = priceOptions[0]
    if (outerPriceType === PriceType.MULTIPLE_OPTIONS) {
      const sorted = [...priceOptions].sort(
        (a, b) => (a.numberOfLessons || 0) - (b.numberOfLessons || 0)
      )
      const found = sorted.find(p => (p.numberOfLessons || 0) >= sessionLength)
      selectedPriceOption = found || sorted[sorted.length - 1]
    }
    const { amount, priceType, numberOfLessons } = selectedPriceOption
    if (
      priceType === PriceType.PER_CLASS ||
      priceType === PriceType.MULTIPLE_OPTIONS
    ) {
      return {
        price: Number(amount) / (numberOfLessons || 1),
        selectedPriceOption,
      }
    }

    return { price: Number(amount), selectedPriceOption }
  }

  const getEnrolled = useCallback(() => {
    if (studentToEnroll?.id && date) {
      fetchAllEnrolledClasses({
        userAliasId: studentToEnroll?.id,
        date: dayjs(date).format('YYYY-MM-DD'),
      })
    }
  }, [date, fetchAllEnrolledClasses, studentToEnroll?.id])

  useEffect(() => {
    getEnrolled()
  }, [getEnrolled])

  // this actions will replace all classes and sessions of studentToEnroll with selectedClass
  const applyToCurrentStudent = () => {
    if (!studentToEnroll) return

    setAllInvoiceClasses(prev => [
      ...prev.filter(item => item.studentItem.id !== studentToEnroll.id),
      ...selectedClasses.map(item => item.classData),
    ])

    setAllInvoiceSessions(prev => [
      ...prev.filter(item => item.studentItem?.id !== studentToEnroll.id),
      ...selectedClasses.flatMap(({ sessionData, classData }) =>
        sessionData.map(s => ({
          ...s,
          studentItem: studentToEnroll,
          classItem: classData,
        }))
      ),
    ])

    closeDialog()
  }

  // this actions will replace all classes and sessions of all student enrolled with selectedClass
  const applyToAllStudents = () => {
    const grouped = selectedClasses.reduce<Record<number, AllEnrolledData[]>>(
      (acc, item) => {
        const studentId = item.classData.studentItem.id
        if (!acc[studentId]) acc[studentId] = []
        acc[studentId].push(item)
        return acc
      },
      {}
    )

    const studentIds = Object.keys(grouped).map(Number)

    // filter invoiceClasses by student
    const newInvoiceClasses = allInvoiceClasses.filter(
      item => !studentIds.includes(item.studentItem.id)
    )
    // filter invoiceSessions by student
    const newInvoiceSessions = allInvoiceSessions.filter(
      item => !studentIds.includes(item.studentItem?.id ?? -1)
    )

    // create newInvoiceClasses form selectedClasses
    const collectedClasses = Object.values(grouped).flatMap(data =>
      data.map(d => d.classData)
    )

    // create newInvoiceSessions form selectedClasses
    const collectedSessions = Object.values(grouped).flatMap(data =>
      data.flatMap(d =>
        d.sessionData.map(s => ({
          ...s,
          studentItem: d.classData.studentItem,
          classItem: d.classData,
        }))
      )
    )

    // set all related recoil state
    setAllInvoiceClasses([...newInvoiceClasses, ...collectedClasses])
    setAllInvoiceSessions([...newInvoiceSessions, ...collectedSessions])

    closeDialog()
  }

  const confirmLabel = useMemo(() => {
    if (isEnrollAllStudents) {
      return t('enrolledClass.classSelection.confirmAddToAll', {
        studentCount: allStudentsToEnroll.length,
        courseCount: selectedClasses.length,
      })
    }
    return t('enrolledClass.classSelection.addCourse', {
      courseCount: selectedClasses.length,
    })
  }, [
    allStudentsToEnroll.length,
    isEnrollAllStudents,
    selectedClasses.length,
    t,
  ])

  return (
    <div>
      {isFetchingEnrolledClasses && (
        <div className="min-h-[16rem] flex items-center justify-center">
          <Spinner />
        </div>
      )}
      {!isFetchingEnrolledClasses && (
        <>
          <ClassSelection />
          <div className="flex justify-end gap-2 sticky bottom-0 bg-white py-4 border-t border-gray-200">
            <Button
              variant="outline"
              iconBefore={<FaArrowLeft />}
              onClick={back}
            >
              {t('enrolledClass.classSelection.backBtn')}
            </Button>
            <Button
              disabled={selectedClasses.length === 0}
              onClick={() =>
                isEnrollAllStudents
                  ? applyToAllStudents()
                  : applyToCurrentStudent()
              }
            >
              {confirmLabel}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default ClassSelectionContainer
