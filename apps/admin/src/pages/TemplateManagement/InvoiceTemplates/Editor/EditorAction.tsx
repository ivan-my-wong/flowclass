import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

import { Button } from '@/components/ui/Button'
import useInvoiceSummary from '@/hooks/useInvoiceSummary'
import {
  availableLessonsByClassState,
  currentActiveStudentState,
  invoiceClassesState,
  invoiceSessionState,
  invoiceStudentState,
} from '@/stores/studentInvoice.store'
import { Classes } from '@/types/classes'
import { ClassTypeEnum, PriceType } from '@/types/course'
import {
  InvoiceClassType,
  InvoiceSessionType,
  InvoiceStudent,
} from '@/types/studentInvoice.type'
import { formatCurrency } from '@/utils/currency'

import { useInvoiceEditorContext } from './InvoiceEditorContext'

const EditorAction = (): JSX.Element => {
  const {
    selectedSessions,
    currentClass,
    setOpenDialog,
    showAllClassesInCourse,
    allClassesInCourse,
    allClassesLessonsData,
    setSelectedSessions,
    setShowAllClassesInCourse,
    setAllClassesLessonsData,
    regularV2Lessons,
  } = useInvoiceEditorContext()
  const {
    totalPrice,
    priceType,
    pricePerLesson,
    countLessons,
    currency,
    selectedPrice,
    nextRecurringCount,
  } = useInvoiceSummary()
  const { t } = useTranslation(['invoiceCampaign'])
  const currentActiveStudent = useRecoilValue(currentActiveStudentState)
  const [allClasses, setAllClasses] = useRecoilState(invoiceClassesState)
  const [allSessions, setAllSessions] = useRecoilState(invoiceSessionState)
  const allStudents = useRecoilValue(invoiceStudentState)
  const setAvailableLessonsByClass = useSetRecoilState(
    availableLessonsByClassState
  )

  /**
   * Shared price-option fields injected into every new InvoiceClassType.
   * `price` is normalised to a per-lesson value so downstream consumers can
   * multiply by sessionLength uniformly, regardless of priceType.
   */
  const extractPriceOptionData = useMemo(() => {
    let calculatedPrice = 0
    if (selectedPrice) {
      const { priceType: optionPriceType, amount, numberOfLessons } = selectedPrice
      if (optionPriceType === PriceType.PER_LESSON) {
        calculatedPrice = Number(amount)
      } else {
        calculatedPrice = Number(amount) / (numberOfLessons || 1)
      }
    }
    return {
      priceType: selectedPrice?.priceType ?? PriceType.PER_LESSON,
      price: calculatedPrice,
      priceOption: selectedPrice ?? undefined,
    }
  }, [selectedPrice])

  // Populate available lessons for package discount auto-apply
  const populateAvailableLessons = (classId: number) => {
    if (!regularV2Lessons?.length) return
    setAvailableLessonsByClass(prev => ({
      ...prev,
      [classId]: regularV2Lessons.map(l => ({
        id: l.id,
        date: l.date,
        period: l.period,
      })),
    }))
  }

  // Helper function to get class info for a session (multi-class support)
  const getClassForSession = (session: any): Classes | undefined => {
    if (showAllClassesInCourse && session.classId && allClassesLessonsData) {
      const classInfo = allClassesLessonsData.classes.find(
        c => c.classId === session.classId
      )
      if (classInfo) {
        // Convert to Classes format
        return {
          id: classInfo.classId,
          name: classInfo.className,
          type: classInfo.type as any,
          course: {
            id: classInfo.courseId,
            name: classInfo.courseName,
          },
          instructor: classInfo.instructor,
          locationRoom: classInfo.locationRoom,
          recurringFormat: currentClass?.recurringFormat, // Use from current for now
        } as Classes
      }
    }
    return currentClass ?? undefined
  }

  // Helper to group sessions by classId
  const groupSessionsByClass = () => {
    const grouped = new Map<number, any[]>()
    selectedSessions.forEach(session => {
      const classInfo = getClassForSession(session)
      if (classInfo) {
        const classId = classInfo.id
        if (!grouped.has(classId)) {
          grouped.set(classId, [])
        }
        grouped.get(classId)?.push({ session, classInfo })
      }
    })
    return grouped
  }

  const addSessionsToCurrentAssignment = () => {
    if (currentActiveStudent && currentClass) {
      // Check if we have multi-class sessions
      const sessionsByClass = groupSessionsByClass()

      // Handle multi-class scenario
      if (showAllClassesInCourse && sessionsByClass.size > 1) {
        const newClassItems = [...allClasses]
        // Start with all existing sessions to preserve other students' sessions
        let newSessionItems = [...allSessions]

        // Process each class separately
        sessionsByClass.forEach((sessionsForClass, classId) => {
          const { classInfo } = sessionsForClass[0]
          const sessionsData = sessionsForClass.map(s => s.session)

          const isClassExist = allClasses.some(
            item =>
              item.classId === classId &&
              item.studentItem.id === currentActiveStudent.id
          )

          if (!isClassExist) {
            // Create new class item for this class
            const newClassItem: InvoiceClassType = {
              ...extractPriceOptionData,
              type: classInfo.type,
              studentItem: currentActiveStudent,
              courseId: classInfo.course?.id ?? 0,
              classId: classInfo.id ?? 0,
              courseName: classInfo.name ?? '',
              recurringFormat: classInfo.recurringFormat,
              sessionLength: sessionsData.length,
              remark: '',
            }

            newClassItems.push(newClassItem)

            // Add sessions for this class
            sessionsData.forEach(item => {
              const newSession: InvoiceSessionType = {
                studentItem: currentActiveStudent,
                classItem: newClassItem,
                date: item.date,
                endTime: item.endTime,
                id: item.id,
                isBlocked: item.isBlocked,
                isOverride: item.isOverride,
                lessonNumber: item.lessonNumber,
                period: item.period,
                startTime: item.startTime,
              }
              newSessionItems.push(newSession)
            })
          } else {
            // Update existing class
            const currentStudentClassIndex = newClassItems.findIndex(
              item =>
                item.studentItem.id === currentActiveStudent.id &&
                item.classId === classId
            )

            if (currentStudentClassIndex >= 0) {
              const existingClass = newClassItems[currentStudentClassIndex]
              const newSessionsForClass = sessionsData.map(item => ({
                ...item,
                studentItem: currentActiveStudent,
                classItem: existingClass,
              }))

              // Filter out old sessions for this student + class combination
              // This preserves all other students' sessions and other classes for current student
              newSessionItems = newSessionItems.filter(
                item =>
                  !(
                    item.studentItem?.id === currentActiveStudent.id &&
                    item.classItem?.classId === classId
                  )
              )

              // Add new sessions for this student + class
              newSessionItems = [...newSessionItems, ...newSessionsForClass]

              // Update session length
              newClassItems[currentStudentClassIndex] = {
                ...existingClass,
                sessionLength: sessionsData.length,
              }
            }
          }
        })

        setAllClasses(newClassItems)
        setAllSessions(newSessionItems)
        // Populate available lessons for each class in multi-class mode
        if (allClassesLessonsData) {
          allClassesLessonsData.classes.forEach((cls: any) => {
            if (cls.lessons) {
              setAvailableLessonsByClass(prev => ({
                ...prev,
                [cls.classId]: cls.lessons.map((l: any) => ({
                  id: l.id,
                  date: l.date,
                })),
              }))
            }
          })
        }
        closeAndResetDialog()
        return
      }

      // Original single-class logic
      const isClassExist = allClasses.some(
        item =>
          item.classId === currentClass.id &&
          item.studentItem.id === currentActiveStudent.id
      )
      if (!isClassExist) {
        const { course, id, name, recurringFormat } = currentClass
        const newClassItem: InvoiceClassType = {
          ...extractPriceOptionData,
          type: currentClass.type,
          studentItem: currentActiveStudent,
          courseId: course?.id ?? 0,
          classId: id ?? 0,
          courseName: name ?? '',
          recurringFormat,
          sessionLength: 0,
          remark: '',
        }

        // Set sessions
        const sessionsTemp = [...allSessions]
        let classSessionLength = 0
        selectedSessions.forEach(item => {
          const {
            date,
            endTime,
            id,
            isBlocked,
            isOverride,
            lessonNumber,
            period,
            startTime,
          } = item
          const newSession: InvoiceSessionType = {
            studentItem: currentActiveStudent,
            classItem: newClassItem,
            date,
            endTime,
            id,
            isBlocked,
            isOverride,
            lessonNumber,
            period,
            startTime,
          }
          const isSessionExist = sessionsTemp.some(item => item === newSession)
          if (!isSessionExist) {
            sessionsTemp.push(newSession)
            classSessionLength += 1
          }
        })
        newClassItem.sessionLength = classSessionLength
        setAllClasses([...allClasses, newClassItem])
        setAllSessions(sessionsTemp)
      } else {
        // user edit course sessions
        const currentStudentClassIndex = allClasses.findIndex(
          item =>
            item.studentItem.id === currentActiveStudent.id &&
            item.classId === currentClass.id
        )
        if (currentStudentClassIndex >= 0) {
          const newInvoiceClassitem = {
            ...allClasses[currentStudentClassIndex],
            sessionLength: selectedSessions.length,
          }

          // Keep all sessions EXCEPT the ones for current student + current class
          // This preserves sessions for all other students
          const filterStudentClassSessions = allSessions.filter(
            item =>
              !(
                item.studentItem?.id === currentActiveStudent.id &&
                item.classItem?.classId === currentClass.id
              )
          )

          const newSessionItems = selectedSessions.map(item => {
            const newItem: InvoiceSessionType = {
              ...item,
              studentItem: currentActiveStudent,
              classItem: newInvoiceClassitem,
            }
            return newItem
          })

          // Combine: keep all other students' sessions + other classes for current student + new sessions for current student + current class
          const updatedSessions = [
            ...filterStudentClassSessions,
            ...newSessionItems,
          ]

          setAllClasses(prev => {
            const updated = [...prev]
            updated[currentStudentClassIndex] = newInvoiceClassitem
            return updated
          })

          setAllSessions(updatedSessions)
        }
      }
      if (currentClass) populateAvailableLessons(currentClass.id)
      closeAndResetDialog()
    } else {
      // Append sessions to the existing class for this student
      const idx = allClasses.findIndex(
        c =>
          c.classId === currentClass?.id &&
          c.studentItem.id === currentActiveStudent?.id
      )
      const existingClass = allClasses[idx]
      const sessionsTemp = [...allSessions]
      let added = 0
      selectedSessions.forEach(s => {
        const newSession: InvoiceSessionType = {
          studentItem: currentActiveStudent,
          classItem: existingClass,
          date: s.date,
          endTime: s.endTime,
          id: s.id,
          isBlocked: s.isBlocked,
          isOverride: s.isOverride,
          lessonNumber: s.lessonNumber,
          period: s.period,
          startTime: s.startTime,
        }

        const isExists = sessionsTemp.some(
          x =>
            x.id === newSession.id &&
            x.classItem?.classId === existingClass.classId &&
            x.studentItem?.id === existingClass.studentItem?.id
        )
        if (!isExists) {
          sessionsTemp.push(newSession)
          added = 1
        }
      })
      const nextClasses = [...allClasses]
      nextClasses[idx] = {
        ...existingClass,
        sessionLength: (existingClass?.sessionLength ?? 0) + added,
      }
      setAllClasses(nextClasses)
      setAllSessions(sessionsTemp)
    }
  }

  const isValidSessionCount = useMemo(() => {
    // Regular V2 classes don't require matching recurring count
    if (
      currentClass?.type === ClassTypeEnum.regularV2 ||
      currentClass?.type === ClassTypeEnum.workshop
    ) {
      return true
    }
    // For other class types, selected sessions must match recurring count
    return selectedPrice
  }, [currentClass?.type, selectedPrice])

  const renderSessionCountMessage = () => {
    if (currentClass?.type === ClassTypeEnum.regularV2) {
      return null
    }

    if (!isValidSessionCount) {
      return (
        <p className="text-sm text-tertiary mb-2 text-left">
          {t('editor.selectRequiredSessions', {
            selected: selectedSessions.length,
            required: nextRecurringCount,
          })}
        </p>
      )
    }

    return null
  }

  const createClassItem = (
    student: InvoiceStudent,
    classData: Classes
  ): InvoiceClassType => {
    return {
      ...extractPriceOptionData,
      studentItem: student,
      type: classData.type,
      courseId: classData.course?.id ?? 0,
      classId: classData.id ?? 0,
      courseName: classData.name ?? '',
      sessionLength: selectedSessions.length,
      dropIn: classData.dropIn,
      recurringFormat: classData.recurringFormat,
      remark: '',
    }
  }

  const applyToAllStudents = () => {
    if (currentClass) {
      const sessionsByClass = groupSessionsByClass()

      // Handle multi-class scenario for all students
      if (showAllClassesInCourse && sessionsByClass.size > 1) {
        const newClassItems = [...allClasses]
        let newSessionItems = [...allSessions]

        // For each student
        allStudents.forEach(studentItem => {
          // For each class that has selected sessions
          sessionsByClass.forEach((sessionsForClass, classId) => {
            const { classInfo } = sessionsForClass[0]
            const sessionsData = sessionsForClass.map(s => s.session)

            // Create class item for this student + class combination
            const newClassItem = createClassItem(studentItem, classInfo)

            const classIndex = newClassItems.findIndex(
              item =>
                item.studentItem.id === studentItem.id &&
                item.classId === classId
            )

            if (classIndex >= 0) {
              // Update existing class
              newClassItems[classIndex] = {
                ...newClassItems[classIndex],
                sessionLength: sessionsData.length,
              }
            } else {
              // Add new class
              newClassItems.push(newClassItem)
            }

            // Remove old sessions for this student+class combination
            newSessionItems = newSessionItems.filter(
              session =>
                !(
                  session.studentItem?.id === studentItem.id &&
                  session.classItem?.classId === classId
                )
            )

            // Add new sessions for this student+class
            const newSessions: InvoiceSessionType[] = sessionsData.map(
              session => ({
                ...session,
                studentItem,
                classItem: newClassItem,
              })
            )

            newSessionItems = newSessionItems.concat(newSessions)
          })
        })

        setAllClasses(newClassItems)
        setAllSessions(newSessionItems)
        if (currentClass) populateAvailableLessons(currentClass.id)
        closeAndResetDialog()
        return
      }

      // Original single-class logic
      const newClassItems = [...allClasses]
      let newSessionItems: InvoiceSessionType[] = []
      allStudents.forEach(studentItem => {
        const newClassItem = createClassItem(studentItem, currentClass)
        const classIndex = allClasses.findIndex(
          item =>
            item.studentItem.id === studentItem.id &&
            item.classId === newClassItem.classId
        )

        if (classIndex >= 0) {
          newClassItems[classIndex] = newClassItem
        } else {
          newClassItems.push(newClassItem)
        }

        const excludeSessions = allSessions.filter(
          session =>
            session.studentItem?.id === studentItem.id &&
            session.classItem?.classId !== newClassItem.classId
        )

        const newSessions: InvoiceSessionType[] = selectedSessions.map(
          session => {
            return {
              ...session,
              studentItem: newClassItem.studentItem,
              classItem: newClassItem,
            }
          }
        )

        newSessionItems = newSessionItems.concat([
          ...excludeSessions,
          ...newSessions,
        ])
      })

      setAllClasses(newClassItems)
      setAllSessions(newSessionItems)
      if (currentClass) populateAvailableLessons(currentClass.id)
      closeAndResetDialog()
    }
  }

  // Helper to close dialog and reset all states
  const closeAndResetDialog = () => {
    setOpenDialog(false)
    setShowAllClassesInCourse(false)
    setAllClassesLessonsData(null)
    // Reset selectedSessions to prevent affecting other students
    // This is important when switching between students or closing the dialog
    setSelectedSessions([])
  }

  // Handle cancel button - reset everything
  const handleCancel = () => {
    closeAndResetDialog()
  }

  return (
    <div className="bg-white h-fit border-b pb-2 box-col-full mt-2">
      {priceType === PriceType.PER_LESSON && (
        <div className="box-row-full items-center justify-between">
          <span>{t('invoiceCampaign:editor.perSession')}</span>
          <span>{formatCurrency(pricePerLesson, currency)}</span>
        </div>
      )}
      <div className="box-row-full justify-between items-center">
        <h4 className="text-base">
          {t('editor.sessionsSelected', {
            count: countLessons,
          })}
        </h4>

        <p className="font-semibold">
          {formatCurrency(
            // This is correct because if it is per class, it only gets the one time price
            totalPrice,
            currency
          )}
        </p>
      </div>
      <div className="box-col-full items-start">
        {renderSessionCountMessage()}

        {allStudents.length > 1 && selectedSessions.length > 0 && (
          <Button
            variant="primary-outline"
            className="w-full"
            disabled={!isValidSessionCount}
            onClick={applyToAllStudents}
          >
            {t('editor.addToAllStudentCount', {
              count: allStudents.length,
            })}
          </Button>
        )}
        {selectedSessions.length > 0 && (
          <Button
            variant="default"
            className="w-full"
            disabled={!isValidSessionCount}
            onClick={() => addSessionsToCurrentAssignment()}
          >
            {t('editor.addCourseWithSchedule')}
          </Button>
        )}
        <Button variant="outline" onClick={handleCancel} className="w-full">
          {t('common:action.cancel')}
        </Button>
      </div>
    </div>
  )
}

export default EditorAction
