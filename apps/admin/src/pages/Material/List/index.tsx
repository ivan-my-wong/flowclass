import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { useQueryClient } from 'react-query'

import NoDataCard from '@/components/NoDataCard'
import Heading from '@/components/Texts/Heading'
import { Button } from '@/components/ui/Button'
import { QUERY_KEY } from '@/constants/queryKey'
import { useClassMaterialsData } from '@/hooks/useClassMaterialsData'
import { useIntegrationGoogle } from '@/hooks/useIntegrationGoogle'
import ContentLayout from '@/layouts/ContentLayout'
import { ListParams } from '@/types/class-material'

import MaterialFilter from './components/MaterialFilter'
import MaterialItem from './components/MaterialItem'
import NotLinkedModal from './components/NotLInkedModal'
import StorageFullModal from './components/StorageFullModal'
import MaterialForm from './MaterialForm'

const MaterialList = (): JSX.Element => {
  const { t } = useTranslation('material')
  const navigate = useNavigate()

  const [params, setParams] = useState<ListParams>({
    classIds: [],
    courseIds: [],
    lessonIds: [],
    page: 1,
    limit: 10,
    search: '',
    type: undefined,
  })

  const [isOpenMaterialForm, setOpenMaterialForm] = useState(false)
  const [showDriveFullModal, setShowDriveFullModal] = useState(false)
  const [showNotLinkedModal, setShowNotLinkedModal] = useState(false)

  const queryClient = useQueryClient()
  const { useGetListClassMaterials, currentUploadProgress } =
    useClassMaterialsData()
  const { data: classMaterials } = useGetListClassMaterials(params)

  const { driveIntegrationStatus, useDriveQuota } = useIntegrationGoogle()
  const isConnected = driveIntegrationStatus.data?.isConnected === true

  const {
    data: driveQuotaResponse,
    isLoading: isDriveQuotaLoading,
    refetch: refetchDriveQuota,
  } = useDriveQuota()
  const driveQuotaData = driveQuotaResponse?.data

  const handleGoToIntegration = async () => {
    await navigate('/integrations/google-drive')
  }

  const handleAddMaterial = () => {
    if (!isConnected) {
      setShowNotLinkedModal(true)
      return
    }

    const quotaData = driveQuotaData

    if (quotaData) {
      const { usage, limit } = quotaData

      if (limit === 0) {
        setShowDriveFullModal(true)
        return
      }

      const usagePercentage = (usage / limit) * 100

      if (usagePercentage >= 95) {
        setShowDriveFullModal(true)
        return
      }
    }

    setOpenMaterialForm(true)
  }

  useEffect(() => {
    if (isConnected && !driveQuotaResponse && !isDriveQuotaLoading) {
      refetchDriveQuota()
    }
  }, [isConnected, driveQuotaResponse, isDriveQuotaLoading, refetchDriveQuota])

  const invalidateMaterials = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEY.classMaterials.getListClassMaterialsKey],
    })
  }, [queryClient])

  const lastProcessedUploadId = useRef<string | number | null>(null)
  useEffect(() => {
    if (
      currentUploadProgress?.status === 'completed' &&
      currentUploadProgress?.uploadId &&
      lastProcessedUploadId.current !== currentUploadProgress.uploadId
    ) {
      lastProcessedUploadId.current = currentUploadProgress.uploadId
      invalidateMaterials()
    }
  }, [
    currentUploadProgress?.status,
    currentUploadProgress?.uploadId,
    invalidateMaterials,
  ])

  const isUploadProcessing = Boolean(
    currentUploadProgress &&
      ['pending', 'uploading'].includes(
        (currentUploadProgress.status ?? '').toLowerCase()
      )
  )

  const rightHeadingContent = () => (
    <Button onClick={handleAddMaterial}>
      {t('actions.addNewMaterialBtn')}
    </Button>
  )

  return (
    <ContentLayout
      leftHeader={<Heading>{t('materialListHeading')}</Heading>}
      rightHeader={rightHeadingContent()}
    >
      <div className="px-4 pt-2 w-full">
        <div className="mb-4 mt-2">
          <MaterialFilter params={params} setParams={setParams} />
        </div>

        {isUploadProcessing && (
          <div className="mb-2 text-sm text-muted-foreground">
            {t('uploadMaterials.message.preparingUploadMaterial')}
          </div>
        )}
        <div className="space-y-3 pt-2">
          {(classMaterials?.data ?? []).map(lesson => (
            <MaterialItem key={lesson.id} lesson={lesson} />
          ))}
          {(classMaterials?.data ?? []).length === 0 && (
            <NoDataCard variant="materials" />
          )}
        </div>
      </div>

      {/* Material Form */}
      <MaterialForm
        isOpen={isOpenMaterialForm}
        setOpen={setOpenMaterialForm}
        driveQuotaData={driveQuotaData}
        onUploadSuccess={invalidateMaterials}
      />

      {/* Google Drive Modals */}
      <StorageFullModal
        open={showDriveFullModal}
        onOpenChange={setShowDriveFullModal}
      />

      <NotLinkedModal
        open={showNotLinkedModal}
        onOpenChange={setShowNotLinkedModal}
        onLinkGoogleDrive={handleGoToIntegration}
      />
    </ContentLayout>
  )
}

export default MaterialList
