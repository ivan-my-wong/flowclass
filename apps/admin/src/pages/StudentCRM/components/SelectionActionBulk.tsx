import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FaCheckCircle } from 'react-icons/fa'
import { IoBook } from 'react-icons/io5'
import { LuFilePlus } from 'react-icons/lu'
import { MdDelete } from 'react-icons/md'
import { useMutation, useQueryClient } from 'react-query'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { deleteStudent } from '@/api/student'
import LoadingButton from '@/components/Buttons/LoadingButton'
import SelectedActions from '@/components/Cards/SelectedActions'
import { QUERY_KEY } from '@/constants/queryKey'
import useGlobalConfirm from '@/hooks/useGlobalConfirm'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { schoolState } from '@/stores/schoolData'
import { siteState } from '@/stores/siteData'
import { AddTeachingServiceMode, StudentState } from '@/stores/studentData'
import {
  StudentEnrolmentRecord,
  TypeDeleteStudentParams,
} from '@/types/student'
import { BulkAssignCourseType } from '@/types/studentAddTeachingService'

import AddToInvoiceCampaignModal from './AddToInvoiceCampaignModal'

export type SelectedStudentRow = {
  data?: StudentEnrolmentRecord
}

type IProps = {
  selectedRows: SelectedStudentRow[]
  studentData: StudentState
  setStudentData: (prev: StudentState) => void
  handleClearSelection: () => void
}

const SelectionActionBulk = (params: IProps): JSX.Element => {
  const navigate = useNavigate()
  const { selectedRows, studentData, setStudentData, handleClearSelection } =
    params

  const { t } = useTranslation()

  const queryClient = useQueryClient()

  const [schoolData] = useRecoilState(schoolState)
  const [siteData] = useRecoilState(siteState)

  const currentSchoolId = schoolData.currentSchool?.id || 0
  const currentSiteId = siteData.currentSite?.id || 0

  const { mutateAsync: handleDelete, isLoading } = useMutation({
    mutationFn: (params: Partial<TypeDeleteStudentParams>) =>
      deleteStudent(params),
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        QUERY_KEY.student.studentListNewKey,
        currentSchoolId,
      ]) // call API get list
      await queryClient.invalidateQueries(QUERY_KEY.student.studentListBinKey)
      toast.success(t('student:detail.deleteStudentSuccess'))
      setLoading(false)
      closeConfirm()
      handleClearSelection()
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
      setLoading(false)
      closeConfirm()
    },
  })

  const { confirmState, openConfirm, closeConfirm, setLoading } =
    useGlobalConfirm(isLoading)

  const [isAddToCampaignOpen, setIsAddToCampaignOpen] = useState(false)

  const selectedStudentIds = useMemo(
    () =>
      selectedRows
        .map(row => row.data?.id ?? 0)
        .filter(Boolean)
        .sort((a, b) => a - b),
    [selectedRows]
  )

  return (
    <AnimatePresence>
      {selectedRows.length > 0 && (
        <div key="selection-bar" className="box-row-full gap-2 px-4 mt-4">
          <SelectedActions
            countText={t('student:paymentProof.selectedRecords')}
            onClearSelection={handleClearSelection}
            selectedCount={selectedRows.length}
            rightComponent={
              <div className="box-responsive-full w-fit justify-end">
                <LoadingButton
                  variant="destructive"
                  iconBefore={<MdDelete size={20} />}
                  dataTestId="delete-student-bulk"
                  onClick={() => {
                    confirmState.content = {
                      title: t('student:modalDeleteStudent:title') || '',
                      description:
                        t('student:modalDeleteStudent:description') || '',
                      confirmText: t('common:action:confirm') || '',
                      onConfirm: () => {
                        confirmState.content.loading = true
                        handleDelete({
                          institutionId: Number(currentSchoolId),
                          siteId: currentSiteId,
                          userAliasIds: selectedRows.map(
                            row => row.data?.id ?? 0
                          ),
                        })
                      },
                      cancelText: t('common:action.cancel') || '',
                      alertType: AlertTypes.WARN,
                    }
                    openConfirm()
                  }}
                  disabled={isLoading}
                  isLoading={isLoading}
                  color="warn"
                >
                  {t('common:action.delete')}
                </LoadingButton>
                <LoadingButton
                  iconBefore={<FaCheckCircle size={18} />}
                  variant="primary-outline"
                  onClick={() => {
                    setStudentData({
                      ...studentData,
                      currentEnrolId: null,
                      tableDrawers: {
                        ...studentData.tableDrawers,
                        isOpenAssignCourse: true,
                        bulkAssignCourse: selectedRows
                          .map(row => {
                            if (!row.data) return null
                            const { id, email, userId, user, name } = row.data

                            return {
                              userId,
                              userAliasId: id,
                              email,
                              phone: user?.phone,
                              name,
                            } as BulkAssignCourseType
                          })
                          .filter(
                            item => item !== null
                          ) as BulkAssignCourseType[],
                        assignCourseMode:
                          AddTeachingServiceMode.addCourseDirectly,
                      },
                    })
                  }}
                  isLoading={false}
                >
                  {t('student:button.assignCourse')}
                </LoadingButton>
                <LoadingButton
                  iconBefore={<IoBook />}
                  isLoading={false}
                  onClick={() => {
                    const studentIds = selectedRows
                      .map(row => {
                        if (!row.data) return null
                        return row.data.id
                      })
                      .filter(item => item !== null)
                      .sort((a, b) => {
                        if (!!a && !!b) return a - b
                        return 0
                      })
                    navigate(
                      `/invoice-templates/editor?studentIds=${studentIds.join(
                        ','
                      )}`
                    )
                  }}
                >
                  {t('student:button.assignInvoice')}
                </LoadingButton>

                <LoadingButton
                  iconBefore={<LuFilePlus />}
                  isLoading={false}
                  onClick={() => setIsAddToCampaignOpen(true)}
                >
                  {t('student:button.addToExistingInvoiceCampaign')}
                </LoadingButton>
              </div>
            }
          />
        </div>
      )}

      <AddToInvoiceCampaignModal
        key="campaign-modal"
        open={isAddToCampaignOpen}
        onClose={() => setIsAddToCampaignOpen(false)}
        studentIds={selectedStudentIds}
      />
    </AnimatePresence>
  )
}

export default SelectionActionBulk
