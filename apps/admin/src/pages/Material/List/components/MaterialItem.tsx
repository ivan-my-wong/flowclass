import { FC, useCallback, useState } from 'react'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { BiPencil, BiTrash } from 'react-icons/bi'
import { FiSend, FiUpload } from 'react-icons/fi'
import { useQueryClient } from 'react-query'

import { Button } from '@/components/ui/Button'
import { QUERY_KEY } from '@/constants/queryKey'
import { useIntegrationGoogle } from '@/hooks/useIntegrationGoogle'
import { ClassMaterialsType, StudentWithExpiry } from '@/types/class-material'
import { UserAlias } from '@/types/studentMemo'
import { getLessonDateTime } from '@/utils/timeFormat'

import MaterialForm from '../MaterialForm'
import NotifyStudent from '../NotifyStudent'

import DeleteMaterialModal from './DeleteMaterialModal'
import EditExpiryForStudentModal from './EditExpiryForStudentModal'
import EditExpiryModal from './EditExpiryModal'

interface Props {
  lesson: ClassMaterialsType
}

const MaterialItem: FC<Props> = ({ lesson }): JSX.Element => {
  const { t } = useTranslation('material')

  const [editExpiryForStudentModal, setEditExpiryForStudentModal] = useState({
    open: false,
    classMaterialsId: 0,
    student: null as StudentWithExpiry | null,
  })
  const [isOpenNotifyStudent, setOpenNotifyStudent] = useState(false)
  const [isOpenMaterialForm, setOpenMaterialForm] = useState(false)
  const [editExpiryModal, setEditExpiryModal] = useState({
    open: false,
    mediaMaterialId: 0,
    currentExpiryDate: null as Date | null,
    materialName: '',
  })
  const [deleteMaterialModal, setDeleteMaterialModal] = useState({
    open: false,
    mediaMaterialId: 0,
    materialName: '',
  })

  const { useDriveQuota } = useIntegrationGoogle()
  const { data: driveQuotaResponse } = useDriveQuota()
  const driveQuotaData = driveQuotaResponse?.data
  const queryClient = useQueryClient()

  const invalidateMaterials = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEY.classMaterials.getListClassMaterialsKey],
    })
  }, [queryClient])

  const handleEditExpiry = useCallback(
    (
      mediaMaterialId: number,
      currentExpiryDate: Date | null,
      materialName: string
    ) => {
      setEditExpiryModal({
        open: true,
        mediaMaterialId,
        currentExpiryDate,
        materialName,
      })
    },
    []
  )

  const handleEditExpiryForStudent = (student: UserAlias) => {
    setEditExpiryForStudentModal({
      open: true,
      classMaterialsId: lesson.id,
      student,
    })
  }

  const handleCloseEditExpiryForStudent = (open: boolean) => {
    setEditExpiryForStudentModal(prev => ({
      ...prev,
      open,
      student: null,
    }))
  }

  const handleDeleteMaterial = useCallback(
    (mediaMaterialId: number, materialName: string) => {
      setDeleteMaterialModal({
        open: true,
        mediaMaterialId,
        materialName,
      })
    },
    []
  )

  const handleCloseEditExpiry = useCallback((open: boolean) => {
    setEditExpiryModal(prev => ({ ...prev, open }))
  }, [])

  const handleCloseDeleteMaterial = useCallback((open: boolean) => {
    setDeleteMaterialModal(prev => ({ ...prev, open }))
  }, [])

  const renderStudentExpiryDate = (student: StudentWithExpiry) => {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600">
          {student.expiryDate
            ? dayjs(student.expiryDate).format('YYYY-MM-DD h:mm A')
            : 'No expiry date'}
        </span>
        <BiPencil
          id={`edit-expiry-for-student-${student.id}`}
          className="cursor-pointer text-blue-600 hover:text-blue-800"
          onClick={() => handleEditExpiryForStudent(student)}
        />
      </div>
    )
  }

  return (
    <>
      <div className="w-full rounded-lg border border-background-layer-4 bg-white py-3 px-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-gray-900">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{lesson?.course?.name}</span>
              <span className="text-gray-300">•</span>
              <span className="font-medium">{lesson?.classEntity?.name}</span>
              <span className="text-gray-300">•</span>
              <span>
                {getLessonDateTime(
                  lesson?.classLesson?.start ?? '',
                  lesson?.classLesson?.end ?? '',
                  t
                )}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpenMaterialForm(true)}>
              <FiUpload className="h-4 w-4 mr-2" />
              {t('materialItem.uploadMaterialsBtn')}
            </Button>
            <Button onClick={() => setOpenNotifyStudent(true)}>
              <FiSend className="h-4 w-4 mr-2" />
              {t('materialItem.notifyStudentsBtn')}
            </Button>
          </div>
        </div>

        {/* Materials */}
        <div className="mt-3 md:mt-0">
          <h3 className="text-base font-semibold text-gray-900">
            {t('materialItem.materials')}
          </h3>
          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {(lesson?.mediaMaterials ?? []).map(m => (
              <div
                key={`material-${m.id}`}
                className="w-full items-start rounded-lg border border-background-layer-4 bg-white p-3"
              >
                <div className="flex justify-between items-center">
                  <div className="truncate text-sm font-semibold text-gray-900">
                    {m.name}
                  </div>
                  <div className="flex gap-2">
                    {/* <BiPencil
                      id={`edit-expiry-${m.id}`}
                      className="cursor-pointer text-blue-600 hover:text-blue-800"
                      onClick={() =>
                        handleEditExpiry(m.id, m.expiryDate, m.name)
                      }
                    /> */}
                    <BiTrash
                      id={`delete-media-${m.id}`}
                      className="cursor-pointer text-destructive hover:text-red-700"
                      onClick={() => handleDeleteMaterial(m.id, m.name)}
                    />
                  </div>
                </div>
                <div className="mt-1 text-xs text-gray-600 space-y-1">
                  {/* {m.expiryDate && (
                    <div className="flex items-center gap-2">
                      <FiClock className="h-3 w-3" />
                      <span className="whitespace-nowrap">
                        {t('materialItem.expiresAt', {
                          date: dayjs(m.expiryDate).format('YYYY-MM-DD h:mm A'),
                        })}
                      </span>
                    </div>
                  )} */}
                  <div className="flex items-center gap-2">
                    <FiUpload className="h-3 w-3" />
                    <span className="whitespace-nowrap">
                      {t('materialItem.uploadedAt', {
                        date: dayjs(m.createdAt).format('YYYY-MM-DD h:mm A'),
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Students */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">
              {t('materialItem.students', {
                count: lesson?.students?.length ?? 0,
              })}
            </h3>
          </div>

          <div className="mt-2 flex flex-wrap">
            {lesson?.students?.map(s => (
              <div
                key={`student-${s.id}`}
                className="flex items-center gap-2 pr-3 py-1"
              >
                <div className="relative inline-flex h-7 w-7 select-none items-center justify-center overflow-hidden rounded-full bg-blue-100">
                  <div className="text-[10px] font-semibold text-blue-700">
                    {s.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-800">
                  {s.name}
                </span>
                {renderStudentExpiryDate(s)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <MaterialForm
        isOpen={isOpenMaterialForm}
        setOpen={setOpenMaterialForm}
        driveQuotaData={driveQuotaData}
        initialCourseId={lesson?.classId}
        initialLessonId={lesson?.classLessonId}
        onUploadSuccess={invalidateMaterials}
      />

      <NotifyStudent
        isOpen={isOpenNotifyStudent}
        setOpen={setOpenNotifyStudent}
        lesson={lesson}
      />

      <EditExpiryModal
        open={editExpiryModal.open}
        onOpenChange={handleCloseEditExpiry}
        classMaterialsId={lesson.id}
        mediaMaterialId={editExpiryModal.mediaMaterialId}
        currentExpiryDate={editExpiryModal.currentExpiryDate}
        materialName={editExpiryModal.materialName}
      />

      <DeleteMaterialModal
        open={deleteMaterialModal.open}
        onOpenChange={handleCloseDeleteMaterial}
        classMaterialsId={lesson.id}
        mediaMaterialId={deleteMaterialModal.mediaMaterialId}
        materialName={deleteMaterialModal.materialName}
      />

      {editExpiryForStudentModal.open && editExpiryForStudentModal.student && (
        <EditExpiryForStudentModal
          open={editExpiryForStudentModal.open}
          onOpenChange={handleCloseEditExpiryForStudent}
          classMaterialsId={editExpiryForStudentModal.classMaterialsId}
          student={editExpiryForStudentModal.student}
        />
      )}
    </>
  )
}

export default MaterialItem
