import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { FaCalendarAlt } from 'react-icons/fa'
import { LuPlus } from 'react-icons/lu'
import { useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import AlertBox from '@/components/Boxes/AlertBox'
import Heading from '@/components/Texts/Heading'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Inputs/Input'
import Text from '@/components/ui/Text'
import useAvailability from '@/hooks/useAvailability'
import useBlockTimeData from '@/hooks/useBlockTimeData'
import useSchoolData from '@/hooks/useSchoolData'
import ContentLayout from '@/layouts/ContentLayout'
import { userPermissionState, UserRole } from '@/stores/userPermissionData'

import BlockTimeItem from '../Setting/component/BlockTimeItem'
import AddBlockTime from '../Setting/component/CreateBlockTime'

import AvailabilityListCard from './components/AvailabilityListCard'
import DeleteAvailabilityModal from './DeleteAvailabilityModal'

const AvailabilityList = (): JSX.Element => {
  const { t } = useTranslation(['availability', 'common']) as {
    t: (key: string) => string
  }
  const navigate = useNavigate()
  const { schoolData } = useSchoolData()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newScheduleName, setNewScheduleName] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [availabilityToDelete, setAvailabilityToDelete] = useState<{
    id: number
    name: string
  } | null>(null)
  const userPermission = useRecoilValue(userPermissionState)

  const isCanModifyBlockTime = [
    UserRole.MasterAdmin,
    UserRole.SiteAdmin,
    UserRole.SchoolAdmin,
  ].includes(userPermission)

  const {
    useCreateAvailability,
    useDeleteAvailability,
    fetchAvailabilities,
    availabilities,
  } = useAvailability()
  const createAvailability = useCreateAvailability()
  const deleteAvailability = useDeleteAvailability()

  const [isOpenAddBlockTime, setIsOpenAddBlockTime] = useState(false)
  const { useFetchAllblockTimeData } = useBlockTimeData()
  const fetchLessonDataResult = useFetchAllblockTimeData()
  const { isSuccess, data } = fetchLessonDataResult

  const handleCreateNew = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateSubmit = async () => {
    try {
      if (!schoolData.currentSchool) {
        toast.error(t('availability:messages.schoolDataError'))
        return
      }

      // Create a new availability with the provided name
      const response = await createAvailability.mutateAsync({
        institutionId: schoolData.currentSchool.id,
        siteId: schoolData.currentSchool.siteId,
        name: newScheduleName,
      })

      // Close the modal and reset the form
      setIsCreateModalOpen(false)
      setNewScheduleName('')

      // Navigate to the edit page with the new ID
      navigate(`/availability/edit/${response.id}`)

      toast.success(t('availability:messages.createSuccess'))
    } catch (error) {
      toast.error(t('availability:messages.createError'))
    }
  }

  const handleEdit = (id: number) => {
    if (id) {
      navigate(`/availability/edit/${id}`)
    }
  }

  const handleDelete = (id: number) => {
    const availabilityToRemove = availabilities?.find(a => a.id === id)
    if (availabilityToRemove) {
      setAvailabilityToDelete({
        id: availabilityToRemove.id,
        name: availabilityToRemove.name || '',
      })
      setIsDeleteModalOpen(true)
    }
  }

  const confirmDelete = (id: number) => {
    if (!schoolData.currentSchool) return
    deleteAvailability.mutate(
      { id, institutionId: schoolData.currentSchool.id },
      {
        onSuccess: () => {
          setIsDeleteModalOpen(false)
          setAvailabilityToDelete(null)
        },
      }
    )
  }

  const renderCreateAvailabilityButton = () => {
    if (isCanModifyBlockTime) {
      return (
        <Button
          onClick={handleCreateNew}
          iconBefore={<LuPlus />}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {t('availability:createNew')}
        </Button>
      )
    }
    return <></>
  }

  const renderIsLoadingSchedule = () => {
    if (fetchAvailabilities.isLoading) {
      return (
        <div className="p-8 text-center">
          <Text>{t('availability:loading')}</Text>
        </div>
      )
    }

    if (availabilities?.length === 0) {
      return (
        <div className="p-8 border border-dashed border-gray-300 rounded-md text-center">
          <FaCalendarAlt className="mx-auto text-gray-400 text-4xl mb-4" />
          <Text className="text-gray-500 mb-2">
            {t('availability:noSchedules')}
          </Text>
          <Text className="text-sm text-gray-400 mb-4">
            {t('availability:createFirstSchedule')}
          </Text>
          {renderCreateAvailabilityButton()}
        </div>
      )
    }

    return (
      <div className="box-col-full gap-4">
        {availabilities?.map(availability => (
          <AvailabilityListCard
            key={availability.id}
            availability={availability}
            onEdit={() => handleEdit(availability.id)}
            onDelete={e => {
              e.stopPropagation()
              handleDelete(availability.id)
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <ContentLayout
      leftHeader={<Heading>{t('availability:title')}</Heading>}
      rightHeader={renderCreateAvailabilityButton()}
    >
      <div
        className="w-full max-w-7xl mx-auto p-4"
        data-testid="availability-list-container"
      >
        {renderIsLoadingSchedule()}
      </div>

      {/* Create New Schedule Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="overflow-visible max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('availability:createNew')}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Text className="text-sm font-medium">
                  {t('availability:scheduleName')}
                </Text>
                <Input
                  id="schedule-name"
                  placeholder={t('availability:schedulePlaceholder')}
                  value={newScheduleName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewScheduleName(e.target.value)
                  }
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="mr-2"
            >
              {t('common:action.cancel')}
            </Button>
            <Button
              onClick={handleCreateSubmit}
              disabled={!newScheduleName.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {t('availability:createAndContinue')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isCanModifyBlockTime && (
        <>
          <div className="box-col-full p-4">
            <div className="box-row-full justify-between items-center mb-4">
              <Heading>{t('setting:systemSettings.blockTimeSetting')}</Heading>
              <Button
                onClick={() => setIsOpenAddBlockTime(true)}
                iconBefore={<LuPlus />}
              >
                {t('setting:systemSettings.addBlockTime')}
              </Button>
            </div>
            {isSuccess && data && data.length === 0 && (
              <AlertBox content={t('setting:systemSettings.noBlockTime')} />
            )}
          </div>

          {isSuccess && data && data.length > 0 && (
            <div className="box-col-full px-4">
              {data?.map(blockTime => {
                return <BlockTimeItem key={blockTime.id} data={blockTime} />
              })}
            </div>
          )}

          <AddBlockTime
            open={isOpenAddBlockTime}
            handleClose={() => setIsOpenAddBlockTime(false)}
          />
        </>
      )}

      {/* Delete Availability Modal */}
      <DeleteAvailabilityModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setAvailabilityToDelete(null)
        }}
        availabilityId={availabilityToDelete?.id || null}
        availabilityName={availabilityToDelete?.name || ''}
        onConfirm={confirmDelete}
        isDeleting={deleteAvailability.isLoading}
      />
    </ContentLayout>
  )
}

export default AvailabilityList
