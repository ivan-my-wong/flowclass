import { useCallback } from 'react'

import { useTranslation } from 'react-i18next'
import { FiTrash } from 'react-icons/fi'

import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'
import { useClassMaterialsData } from '@/hooks/useClassMaterialsData'

interface DeleteMaterialModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classMaterialsId: number
  mediaMaterialId: number
  materialName: string
}

const DeleteMaterialModal = ({
  open,
  onOpenChange,
  classMaterialsId,
  mediaMaterialId,
  materialName,
}: DeleteMaterialModalProps) => {
  const { t } = useTranslation(['material', 'common'])

  const { useDeleteClassMaterialMedia } = useClassMaterialsData()

  const deleteMaterialMutation = useDeleteClassMaterialMedia(
    classMaterialsId,
    mediaMaterialId,
    useCallback(() => {
      onOpenChange(false)
    }, [onOpenChange])
  )

  const handleDelete = useCallback(async () => {
    try {
      await deleteMaterialMutation.mutateAsync()
    } catch (error) {
      console.error('Failed to delete material:', error)
    }
  }, [deleteMaterialMutation])

  const handleCancel = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const { isLoading } = deleteMaterialMutation

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('material:deleteMaterial.title')}
      className="max-w-md"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            {t('common:action.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            loading={isLoading}
            iconBefore={<FiTrash />}
          >
            {t('common:action.delete')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <FiTrash className="w-6 h-6 text-red-600" />
        </div>

        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('material:deleteMaterial.confirmTitle', {
              fileName: materialName,
            })}
          </h3>
          <p className="text-sm text-gray-600">
            {t('material:deleteMaterial.confirmDescription')}
          </p>
        </div>

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                {t('material:deleteMaterial.warning')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModalDialog>
  )
}

export default DeleteMaterialModal
