import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { BsCheckCircle } from 'react-icons/bs'
import { FaExclamationTriangle, FaFolder } from 'react-icons/fa'
import { LuTerminal } from 'react-icons/lu'
import { UseMutationResult, UseQueryResult } from 'react-query'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import Text from '@/components/ui/Text'
import {
  DriveCreateFolderPayload,
  DriveCreateFolderResponse,
  DriveSetRootFolderPayload,
  DriveValidatePermissionPayload,
  DriveValidatePermissionResponse,
  GoogleDriveFoldersResponse,
  GoogleDriveIntegrationStatus,
  GoogleDriveQuotaResponse,
} from '@/types/external/googleIntegration.type'

import { FolderSelectionModal } from './FolderSelectionModal'
import { SuggestedFolder } from './SuggestedFolder'

interface RootFolderSectionProps {
  isConnected?: boolean
  userEmail?: string
  useDriveFolders: (
    parentFolderId?: string
  ) => UseQueryResult<GoogleDriveFoldersResponse, Error>
  fetchDriveFolderByParent: (
    parentFolderId?: string
  ) => Promise<GoogleDriveFoldersResponse>
  createDriveFolder: UseMutationResult<
    DriveCreateFolderResponse,
    Error,
    DriveCreateFolderPayload,
    unknown
  >
  setRootDriveFolder: UseMutationResult<
    GoogleDriveIntegrationStatus,
    Error,
    DriveSetRootFolderPayload,
    unknown
  >
  validateFolderAccess: UseMutationResult<
    DriveValidatePermissionResponse,
    Error,
    DriveValidatePermissionPayload,
    unknown
  >
  driveIntegrationStatus?: GoogleDriveIntegrationStatus
  driveQuota?: () => UseQueryResult<GoogleDriveQuotaResponse, Error>
}

export const RootFolderSection: React.FC<RootFolderSectionProps> = ({
  isConnected = false,
  useDriveFolders,
  fetchDriveFolderByParent,
  createDriveFolder,
  setRootDriveFolder,
  validateFolderAccess,
  driveIntegrationStatus,
  driveQuota,
}) => {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Get current root folder info from drive integration status
  const currentRootFolder = driveIntegrationStatus?.configuration?.rootFolderId
  const currentRootFolderName =
    driveIntegrationStatus?.configuration?.rootFolderName

  // Check for errors
  const hasError =
    createDriveFolder.error || setRootDriveFolder.error || localError
  const errorMessage =
    createDriveFolder.error?.message ||
    setRootDriveFolder.error?.message ||
    localError

  const handleChooseFolder = () => {
    setLocalError(null)
    setIsModalOpen(true)
  }

  const handleFolderSelect = (folder: {
    id: string
    name: string
    path: string
  }) => {
    setLocalError(null)
    setRootDriveFolder.mutate(
      {
        rootFolderId: folder.id,
        rootFolderName: folder.name,
        createEducationStructure: true,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false)
          // Clear any previous errors on success
          setLocalError(null)
        },
        onError: (error: Error) => {
          setLocalError(
            error.message ||
              t('integration:googleDrive.rootFolder.errorSetFailed')
          )
        },
      }
    )
  }

  const handleCreateFolder = async (
    payload: DriveCreateFolderPayload
  ): Promise<DriveCreateFolderResponse> => {
    setLocalError(null)
    try {
      return await createDriveFolder.mutateAsync(payload)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      setLocalError(
        errorMessage ||
          t('integration:googleDrive.rootFolder.errorCreateFailed')
      )
      throw error
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setLocalError(null)
    createDriveFolder.reset?.()
    setRootDriveFolder.reset?.()
  }
  const connected = driveIntegrationStatus?.isConnected ?? isConnected
  const quotaQuery = driveQuota?.()
  if (!connected) {
    return null
  }

  const getProgressColor = (percent: number): string => {
    if (percent < 70) return 'bg-green-600'
    if (percent < 90) return 'bg-yellow-500'
    return 'bg-red-600'
  }

  const formatBytes = (bytes?: number): string => {
    if (!bytes) return '0 GB'
    const gb = bytes / 1024 ** 3
    return `${gb.toFixed(2)} GB`
  }

  return (
    <div>
      {/* Error Display */}
      {hasError && (
        <Alert variant="destructive" className="mb-6">
          <LuTerminal className="h-4 w-4" />
          <AlertTitle>{t('common.errorTitle')}</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        {/* Section Header */}
        <div className="flex items-center mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg mr-4">
            <FaFolder className="text-gray-600 text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('integration:googleDrive.rootFolder.title')}
            </h2>
            <Text className="text-gray-600 mt-1">
              {t('integration:googleDrive.rootFolder.description')}
            </Text>
          </div>
        </div>

        {/* Warning Box */}
        <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-lg p-4 flex items-start mb-4">
          <FaExclamationTriangle className="text-orange-500 mr-3 mt-1 flex-shrink-0" />
          <Text className="text-sm">
            <strong>{t('common:action.warning')}:</strong>{' '}
            {t('integration:googleDrive.rootFolder.warning')}
          </Text>
        </div>

        {currentRootFolder ? (
          <div className="border border-green-200 rounded-lg p-6 bg-green-50 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <FaFolder className="text-green-600 text-2xl mr-3 mt-1 flex-shrink-0" />{' '}
                <div className="min-w-0 flex-1">
                  <Text className="font-semibold text-green-800 truncate">
                    {currentRootFolderName ||
                      t('integration:googleDrive.rootFolder.defaultName')}
                  </Text>
                  <Text className="text-xs text-green-500 mt-1 font-mono truncate">
                    ID: {currentRootFolder}
                  </Text>
                  {currentRootFolder && quotaQuery && (
                    <div className="mt-4 w-full">
                      {quotaQuery.isLoading && (
                        <div className="space-y-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 animate-pulse" />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>
                              {t(
                                'integration:googleDrive.rootFolder.loadingQuota'
                              )}
                            </span>
                          </div>
                        </div>
                      )}

                      {quotaQuery.isError && (
                        <Text className="text-red-600 text-sm">
                          {t('integration:googleDrive.rootFolder.quotaError')}
                        </Text>
                      )}

                      {!quotaQuery.isLoading &&
                        !quotaQuery.isError &&
                        !quotaQuery.data && (
                          <Text className="text-gray-500 text-sm">
                            {t(
                              'integration:googleDrive.rootFolder.quotaUnavailable'
                            )}
                          </Text>
                        )}

                      {!quotaQuery.isLoading &&
                        !quotaQuery.isError &&
                        quotaQuery.data?.data && (
                          <div className="space-y-2">
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className={`${getProgressColor(
                                  quotaQuery.data.data.percentageUsed
                                )} h-3 rounded-full transition-all duration-300`}
                                style={{
                                  width: `${Math.min(
                                    quotaQuery.data.data.percentageUsed,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>

                            <div className="flex justify-between text-xs text-gray-600">
                              <span>
                                {formatBytes(quotaQuery.data.data.usage)}{' '}
                                {t('integration:googleDrive.rootFolder.used')}
                              </span>
                              <span>
                                {formatBytes(
                                  quotaQuery.data.data.remainingSpace
                                )}{' '}
                                {t(
                                  'integration:googleDrive.rootFolder.remaining'
                                )}
                              </span>
                            </div>

                            <Text className="text-xs text-gray-500">
                              {t('integration:googleDrive.rootFolder.total')}:{' '}
                              {formatBytes(quotaQuery.data.data.limit)}
                            </Text>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                type="button"
                onClick={handleChooseFolder}
                disabled={setRootDriveFolder.isLoading}
                className="ml-4 flex-shrink-0"
              >
                {t('integration:googleDrive.rootFolder.changeFolder')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 rounded-lg py-12 text-center">
            <FaFolder className="text-gray-400 text-4xl mx-auto mb-4" />
            <Text className="text-gray-600 mb-4">
              {t('integration:googleDrive.rootFolder.noFolderSelected')}
            </Text>
            <Button
              type="button"
              onClick={handleChooseFolder}
              disabled={setRootDriveFolder.isLoading}
              loading={setRootDriveFolder.isLoading}
            >
              {setRootDriveFolder.isLoading
                ? t('integration:googleDrive.rootFolder.settingFolder')
                : t('integration:googleDrive.rootFolder.button')}
            </Button>
          </div>
        )}

        <div className="mt-4 border border-blue-200 rounded-lg p-6 bg-blue-50">
          <div className="flex flex-col">
            <Text className="font-semibold text-blue-800 truncate">
              {t('integration:googleDrive.rootFolder.accessValidation')}
            </Text>
            <div className="flex items-center space-x-2 mt-2">
              <BsCheckCircle className="text-blue-500" />
              <Text className="text-sm text-blue-800">
                {t('integration:googleDrive.rootFolder.writeVerified')}
              </Text>
            </div>
          </div>
        </div>

        {/* Loading indicator for setting root folder */}
        {setRootDriveFolder.isLoading && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
              <Text className="text-blue-800 text-sm">
                {t('integration:googleDrive.rootFolder.settingFolderProgress')}
              </Text>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12">
        <SuggestedFolder />
      </div>

      <FolderSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onFolderSelect={handleFolderSelect}
        onCreateFolder={handleCreateFolder}
        useDriveFolders={useDriveFolders}
        fetchDriveFolderByParent={fetchDriveFolderByParent}
        isCreatingFolder={createDriveFolder.isLoading}
        isSettingRoot={setRootDriveFolder.isLoading}
      />
    </div>
  )
}
