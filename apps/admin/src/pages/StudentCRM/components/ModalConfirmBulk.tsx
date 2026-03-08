import { useState } from 'react'

import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import banner from '@/assets/fallback/imageFailed.png'
import ImageAspect from '@/components/Images/ImageAspect'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import useCourseData from '@/hooks/useCourseData'
import useSiteData from '@/hooks/useSiteData'
import { studentState } from '@/stores/studentData'

type IProps = {
  open: boolean
  setOpen: (value: boolean) => void
  dataInput: { courseId: number | string; classId: number | string }
  onSubmit: () => void
}

const ModalConfirmBulk = (params: IProps) => {
  const { open, setOpen, dataInput, onSubmit } = params

  const { t } = useTranslation()

  const { tableDrawers } = useRecoilValue(studentState)
  const { bulkAssignCourse = [] } = tableDrawers

  const { courseData } = useCourseData()
  const { siteData } = useSiteData()

  const currency = siteData.currentSite?.currency

  const [showAllStudent, setShowAllStudent] = useState<boolean>(false)

  const totalShowStudent = 5
  const totalStudent = showAllStudent
    ? bulkAssignCourse?.length || 0
    : totalShowStudent

  const selectedCourse = courseData?.courses?.find(
    o => o.id === +dataInput.courseId
  )
  const selectedClass = selectedCourse?.classes?.find(
    o => o.id === +dataInput.classId
  )

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-left">
            {t('student:modalBulk:title')}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DialogDescription>
            {t('student:modalBulk:description')}
          </DialogDescription>
          <DialogDescription>{t('student:modalBulk:alert')}</DialogDescription>

          <div className="p-3 bg-background-layer-3 mt-3 rounded-md items-center grid grid-cols-1 md:grid-cols-4 gap-3">
            <ImageAspect
              s3="public"
              ratio={16 / 9}
              width="100%"
              src={selectedCourse?.previewImageUrl ?? banner}
              alt="Banner image"
              borderRadius="0.5rem"
            />
            <div className="w-full md:col-span-3 px-2 text-sm">
              <div className="font-semibold">{selectedCourse?.name}</div>
              <div>{selectedClass?.name}</div>
            </div>
          </div>

          <div className="p-3 border border-dark-text-disabled mt-3 rounded-md space-y-3">
            {bulkAssignCourse?.slice(0, totalStudent)?.map(student => (
              <div
                key={`student-${student.userAliasId}`}
                className="grid grid-cols-1 md:grid-cols-3 text-sm"
              >
                <div>{student.name}</div>
                <div className="md:col-span-2 md:text-right">
                  {student.email}
                </div>
              </div>
            ))}

            {bulkAssignCourse?.length > totalShowStudent && (
              <div
                className="flex items-center justify-center gap-1 cursor-pointer font-bold"
                onClick={() => setShowAllStudent(!showAllStudent)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setShowAllStudent(!showAllStudent)
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="text-sm text-primary-subtle">
                  {t('student:teachingService.clickToViewAll')}
                </div>
                <div>
                  {showAllStudent ? (
                    <ChevronUpIcon className="text-primary-subtle" />
                  ) : (
                    <ChevronDownIcon className="text-primary-subtle" />
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button type="button" onClick={() => onSubmit()}>
            {t('common:action:confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ModalConfirmBulk
