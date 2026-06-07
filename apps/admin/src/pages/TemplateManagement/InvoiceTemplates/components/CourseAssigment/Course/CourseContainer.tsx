import { useDeferredValue, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { IoMdAdd } from 'react-icons/io'
import { LuSearch } from 'react-icons/lu'
import { useRecoilValue } from 'recoil'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'
import {
  classesState,
  currentActiveParentState,
  currentActiveStudentState,
  invoiceClassesSelector,
  isInvoiceExistOnCampaignSelector,
} from '@/stores/studentInvoice.store'

import { EnrolledClassProvider } from '../Enrolled/EnrolledClassContext'
import EnrolledDialog from '../Enrolled/EnrolledDialog'

import CourseItem from './CourseItem'
import { FEATURE_FLAG } from '@/constants/featureFlags'

const MAX_VISIBLE_COURSES = 5

const CourseContainer = (): JSX.Element => {
  const currentActiveStudent = useRecoilValue(currentActiveStudentState)
  const currentActiveParent = useRecoilValue(currentActiveParentState)
  const { t } = useTranslation(['invoiceCampaign'])
  const classes = useRecoilValue(classesState)
  const isInvoiceExist = useRecoilValue(isInvoiceExistOnCampaignSelector)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [isOpenEnrolledDialog, setOpenEnrolledDialog] = useState<boolean>(false)

  const deferredQuery = useDeferredValue(searchQuery)

  const activeClasses = useRecoilValue(
    invoiceClassesSelector({
      userAliasId: currentActiveStudent?.id ?? null,
      parentId: currentActiveParent?.id ?? null,
    })
  )
  const assignedClassIdsSet = useMemo(() => {
    if (!currentActiveStudent) return new Set<number>()
    return new Set(
      activeClasses
        .filter(item => item.studentItem.id === currentActiveStudent.id)
        .map(item => item.classId)
    )
  }, [currentActiveStudent, activeClasses])

  // Filter classes based on search query (name, course name, or ID)
  const filteredClasses = useMemo(() => {
    if (!deferredQuery.trim()) return classes

    const query = deferredQuery.toLowerCase()
    return classes
      .filter(item => !item.isArchived)
      .filter(
        classItem =>
          classItem.name.toLowerCase().includes(query) ||
          (classItem.course?.name?.toLowerCase() ?? '').includes(query) ||
          String(classItem.id).includes(query)
      )
  }, [classes, deferredQuery])

  const renderCourseItem = (classItem: (typeof classes)[0]) => (
    <CourseItem
      key={classItem.id}
      isAssigned={assignedClassIdsSet.has(classItem.id)}
      classItem={classItem}
      currentActiveStudent={currentActiveStudent}
    />
  )

  const renderContent = () => {
    if (filteredClasses.length === 0) {
      if (searchQuery) {
        return (
          <div className="text-gray-600 text-sm text-center">
            {t('courseAssignment.noMatchingCourses')}
          </div>
        )
      }
      return (
        <div className="text-gray-600 text-sm text-center">
          {t('courseAssignment.noCoursesAvailable')}
        </div>
      )
    }

    const visibleCourses = showAll
      ? filteredClasses
      : filteredClasses.slice(0, MAX_VISIBLE_COURSES)
    const hasMoreCourses = filteredClasses.length > MAX_VISIBLE_COURSES

    return (
      <div className="space-y-4">
        {visibleCourses.map(renderCourseItem)}
        {hasMoreCourses && !showAll && (
          <div className="text-center pt-2">
            <Button
              variant="link"
              onClick={() => setShowAll(true)}
              className="text-blue-600 hover:text-blue-700"
            >
              {t('courseAssignment.showAllCourses', {
                count: filteredClasses.length,
              }) || ''}
            </Button>
          </div>
        )}
        {showAll && hasMoreCourses && (
          <div className="text-center pt-2">
            <Button
              variant="link"
              onClick={() => setShowAll(false)}
              className="text-blue-600 hover:text-blue-700"
            >
              {t('invoiceCampaign:courseAssignment.showLess') || ''}
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold">
              {t('courseAssignment.title')}
            </div>
            {FEATURE_FLAG.ADD_ENROLLED_CLASS_IN_INVOICE_CAMPAIGN &&
              currentActiveStudent && (
                <Button
                  iconBefore={<IoMdAdd aria-hidden="true" focusable="false" />}
                  onClick={() => setOpenEnrolledDialog(true)}
                >
                  {t('enrolledClass.addEnrolledClass')}
                </Button>
              )}
          </div>
          <div className="relative">
            <Input
              type="text"
              placeholder={t('courseAssignment.searchCoursesPlaceholder') || ''}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Course List */}
        <div className="p-4 space-y-4 max-h-[65vh] overflow-y-auto">
          {renderContent()}
        </div>
      </div>
      {currentActiveStudent && (
        <EnrolledClassProvider>
          <EnrolledDialog
            open={isOpenEnrolledDialog}
            currentStudent={currentActiveStudent}
            onClose={() => setOpenEnrolledDialog(false)}
          />
        </EnrolledClassProvider>
      )}
    </>
  )
}

export default CourseContainer
