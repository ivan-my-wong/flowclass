import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import banner from '@/assets/fallback/imageFailed.png'
import ImageAspect from '@/components/Images/ImageAspect'
import Text from '@/components/Texts/Text'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import useCourseData from '@/hooks/useCourseData'
import useSchoolData from '@/hooks/useSchoolData'
import { Course } from '@/types/course'

type SelectCourseDuplicateModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  course: Course
}

const SelectCourseDuplicateModal = ({
  open,
  setOpen,
  course,
}: SelectCourseDuplicateModalProps): React.ReactElement => {
  const [selectedInstitution, setSelectedInstitution] = useState<string>('')
  const { t } = useTranslation()

  const { useDuplicateCourseToAnotherInstitution } = useCourseData()
  const duplicateCourseToAnotherInstitutionMutate =
    useDuplicateCourseToAnotherInstitution()

  const { schoolData } = useSchoolData()
  const schools = schoolData.schools || []

  const handleDuplicateCourseToAnotherInstitution = async () => {
    if (!selectedInstitution) {
      toast.error(t('teachingService:duplicateCourse.unknownError'))
      return
    }

    try {
      await duplicateCourseToAnotherInstitutionMutate.mutateAsync({
        course,
        institutionId: Number(selectedInstitution),
      })
      toast.success(t('teachingService:duplicateCourse.successDuplicate'))
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error'
      console.error('Error duplicating course:', errorMessage)

      toast.error(
        t('teachingService:duplicateCourse.unknownError') + errorMessage
      )
    }

    setOpen(false)
  }

  useEffect(() => {
    // We need to set style of body to empty string because:
    // When go to edit page that the dropdown state is open, the dropdown component set style of body to cursor-pointer: none
    // And after user back to setting payments page there is nothing the user can click. So we need to set style of body to empty string
    if (open) {
      document.body.style.cursor = 'default'
      document.body.style.pointerEvents = 'auto'
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-4">
        <DialogHeader>
          <DialogTitle>
            {t('teachingService:duplicateCourse.modalTitle')}
            <Text size="small">
              {t('teachingService:duplicateCourse.modalDescription')}
            </Text>
          </DialogTitle>
        </DialogHeader>
        {/* Course image and badge */}
        <div className="box-row-full mb-4">
          <p className="font-bold mb-2">
            {t('teachingService:duplicateCourse.destinationInstitution')}
          </p>
          <Select
            value={selectedInstitution}
            onValueChange={setSelectedInstitution}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={t(
                  'teachingService:duplicateCourse.destinationInstitution'
                )}
              />
            </SelectTrigger>
            <SelectContent>
              {schools.map(school => (
                <SelectItem key={school.id} value={String(school.id)}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={duplicateCourseToAnotherInstitutionMutate.isLoading}
          >
            {t('teachingService:duplicateCourse.cancel')}
          </Button>
          <Button
            onClick={handleDuplicateCourseToAnotherInstitution}
            loading={duplicateCourseToAnotherInstitutionMutate.isLoading}
            disabled={!selectedInstitution}
          >
            {t('teachingService:duplicateCourse.confirmDuplicate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SelectCourseDuplicateModal
