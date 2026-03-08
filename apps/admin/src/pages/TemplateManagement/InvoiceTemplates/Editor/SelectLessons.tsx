import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { useRecoilValue, useSetRecoilState } from 'recoil'

import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import { CalendarProvider } from '@/components/ui/FullCalendar/CalendarProvider'
import ModalDialog from '@/components/ui/ModalDialog'
import useClassData from '@/hooks/useClassData'
import { classQuotaState } from '@/stores/classQuotaData'
import { locationRoomQuotaState } from '@/stores/locationRoomQuotaData'
import { currentActiveStudentState } from '@/stores/studentInvoice.store'

import { useInvoiceEditorContext } from './InvoiceEditorContext'
import LessonsCalendar from './LessonsCalendar'

const ModalSelectLessons = (): JSX.Element => {
  const setLocationRoomQuota = useSetRecoilState(locationRoomQuotaState)
  const setClassQuota = useSetRecoilState(classQuotaState)
  const { setCurrentClass } = useInvoiceEditorContext()
  const [isOpen, setIsOpen] = useState(true)
  const [searchParams] = useSearchParams()
  const documentId = searchParams.get('documentId') || ''
  const { classId } = useParams<{ classId: string }>()
  const classIdNum = Number(classId)
  const { useFetchDetailClass, useGetTimeSlotClassQuota } = useClassData()

  const { data: classData, isLoading: isClassLoading } =
    useFetchDetailClass(classIdNum)
  const { data: classQuotaData, isLoading: isClassQuotaLoading } =
    useGetTimeSlotClassQuota(classData?.id)
  const locationRoomQuota = classQuotaData?.locationQuota
  const classQuota = classQuotaData?.classQuota
  const currentStudent = useRecoilValue(currentActiveStudentState)

  const { t } = useTranslation(['invoiceCampaign'])
  const navigate = useNavigate()
  useEffect(() => {
    if (!isOpen)
      navigate(
        `/invoice-templates/editor${
          documentId ? `?documentId=${documentId}` : ''
        }`
      )
  }, [isOpen, navigate, documentId])
  useEffect(() => {
    if (classData) {
      setCurrentClass(classData)
    }
    if (locationRoomQuota) {
      setLocationRoomQuota(locationRoomQuota)
    }
    if (classQuota) {
      setClassQuota(classQuota)
    }

    return () => {
      setCurrentClass(null)
      setClassQuota(null)
      setLocationRoomQuota(null)
    }
  }, [
    setClassQuota,
    classQuota,
    setLocationRoomQuota,
    locationRoomQuota,
    classData,
    setCurrentClass,
  ])
  return (
    <ModalDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title={t('editor.selectClass') as string}
      subtitle={
        <span>
          {[currentStudent?.name, classData?.name].filter(Boolean).join(' - ')}
        </span>
      }
      footer={null}
      className="max-w-[90vw] max-h-[90vh] overflow-hidden gap-0"
      classBody="max-h-[100vh] overflow-y-auto px-0 py-0"
    >
      {isClassLoading || isClassQuotaLoading ? (
        <SkeletonLoader height="100vh" />
      ) : (
        <CalendarProvider enableDragAndDrop={false}>
          <LessonsCalendar isOpen={isOpen} onCloseDialog={setIsOpen} />
        </CalendarProvider>
      )}
    </ModalDialog>
  )
}
export default ModalSelectLessons
