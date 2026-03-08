import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import {
  FaChevronDown,
  FaChevronRight,
  FaFolder,
  FaHome,
  FaPlus,
  FaTimes,
} from 'react-icons/fa'
import { UseQueryResult } from 'react-query'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'
import Text from '@/components/ui/Text'
import {
  DriveCreateFolderPayload,
  DriveCreateFolderResponse,
  GoogleDriveFolder,
  GoogleDriveFoldersResponse,
  GoogleDriveMimeType,
} from '@/types/external/googleIntegration.type'

interface FolderSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onFolderSelect: (folder: { id: string; name: string; path: string }) => void
  onCreateFolder: (
    payload: DriveCreateFolderPayload
  ) => Promise<DriveCreateFolderResponse>
  useDriveFolders: (
    parentFolderId?: string
  ) => UseQueryResult<GoogleDriveFoldersResponse, Error>
  fetchDriveFolderByParent: (
    parentFolderId?: string
  ) => Promise<GoogleDriveFoldersResponse>
  isCreatingFolder: boolean
  isSettingRoot: boolean
}

// Tambahkan tipe untuk node tree
interface FolderTreeNode extends GoogleDriveFolder {
  children?: FolderTreeNode[]
  parentPath: string
  level: number
}

export const FolderSelectionModal: React.FC<FolderSelectionModalProps> = ({
  isOpen,
  onClose,
  onFolderSelect,
  onCreateFolder,
  useDriveFolders,
  fetchDriveFolderByParent,
  isCreatingFolder,
  isSettingRoot,
}) => {
  const { t } = useTranslation('integration')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['root'])
  )
  const [folderTree, setFolderTree] = useState<FolderTreeNode[]>([])
  const [loadingChildren, setLoadingChildren] = useState<
    Record<string, boolean>
  >({})
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [createInFolderId, setCreateInFolderId] = useState<string>('root')

  // Query root folders
  const rootFoldersQuery = useDriveFolders('root')

  // Reset state saat modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setExpandedFolders(new Set(['root']))
      setFolderTree([])
      setLoadingChildren({})
      setShowCreateForm(false)
      setNewFolderName('')
      setCreateInFolderId('root')
    }
  }, [isOpen])

  useEffect(() => {
    const folders = rootFoldersQuery.data?.data

    if (!folders || !Array.isArray(folders)) {
      console.warn(
        'Invalid or missing root folder data:',
        rootFoldersQuery.data
      )
      setFolderTree([])
      return
    }

    const rootItems: FolderTreeNode[] = folders.map(folder => ({
      ...folder,
      parentPath: 'My Drive',
      level: 0,
    }))

    setFolderTree(rootItems)
  }, [rootFoldersQuery.data])

  const toggleFolder = async (
    folderId: string,
    parentPath: string,
    level: number
  ) => {
    if (isSettingRoot) return

    const newExpanded = new Set(expandedFolders)
    const isCurrentlyExpanded = newExpanded.has(folderId)

    if (isCurrentlyExpanded) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
      // Load children only if not loaded yet
      const existingNode = findNodeById(folderTree, folderId)
      if (existingNode && !existingNode.children) {
        setLoadingChildren(prev => ({ ...prev, [folderId]: true }))
        try {
          const childFoldersResponse = await fetchDriveFolderByParent(folderId)
          const childFoldersData = childFoldersResponse?.data || []

          if (!Array.isArray(childFoldersData)) {
            console.error(
              'Unexpected child folders data structure:',
              childFoldersResponse
            )
            return
          }

          const childFolders = childFoldersData.map(f => ({
            ...f,
            parentPath: `${parentPath} / ${existingNode.name}`,
            level: level + 1,
          }))

          updateNodeChildren(folderId, childFolders)
        } finally {
          setLoadingChildren(prev => ({ ...prev, [folderId]: false }))
        }
      }
    }

    setExpandedFolders(newExpanded)
  }

  // Helper: cari node berdasarkan ID secara rekursif
  const findNodeById = (
    nodes: FolderTreeNode[],
    id: string
  ): FolderTreeNode | undefined => {
    const direct = nodes.find(n => n.id === id)
    if (direct) return direct
    return nodes
      .filter(
        (n): n is FolderTreeNode & { children: FolderTreeNode[] } =>
          !!n.children
      )
      .map(n => findNodeById(n.children, id))
      .find((x): x is FolderTreeNode => x !== undefined)
  }

  // Helper: update children node
  const updateNodeChildren = (id: string, children: FolderTreeNode[]) => {
    const updateNodes = (nodes: FolderTreeNode[]): FolderTreeNode[] => {
      return nodes.map(node => {
        if (node.id === id) {
          return { ...node, children }
        }
        if (node.children) {
          return { ...node, children: updateNodes(node.children) }
        }
        return node
      })
    }
    setFolderTree(prev => updateNodes(prev))
  }

  // Render rekursif folder tree
  const renderFolderTree = (nodes: FolderTreeNode[], level: number = 0) => {
    return nodes.map(node => (
      <div key={node.id}>
        <div
          className={`flex items-center justify-between py-2 px-3 hover:bg-gray-50 transition-colors ${
            isSettingRoot ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div
            role="button"
            tabIndex={0}
            className="flex items-center flex-1 cursor-pointer"
            onClick={() => toggleFolder(node.id, node.parentPath, node.level)}
            style={{ paddingLeft: `${level * 24 + 12}px` }}
          >
            {node.mimeType === GoogleDriveMimeType.FOLDER && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  toggleFolder(node.id, node.parentPath, node.level)
                }}
                className="mr-2 p-1 hover:bg-gray-200 rounded transition-colors"
                disabled={isSettingRoot}
              >
                {expandedFolders.has(node.id) ? (
                  <FaChevronDown className="text-xs text-gray-500" />
                ) : (
                  <FaChevronRight className="text-xs text-gray-500" />
                )}
              </button>
            )}

            <div className="flex items-center">
              <FaFolder className="text-blue-500 mr-2" />
              <Text className="font-medium text-gray-900">{node.name}</Text>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={e => {
              e.stopPropagation()
              onFolderSelect({
                id: node.id,
                name: node.name,
                path: `${node.parentPath} / ${node.name}`,
              })
            }}
            disabled={isSettingRoot}
            className="ml-3 whitespace-nowrap text-gray-600 border-gray-300 hover:bg-gray-100"
          >
            Select
          </Button>
        </div>

        {expandedFolders.has(node.id) && node.children && (
          <div className="border-l border-gray-200 ml-6 pl-2">
            {renderFolderTree(node.children, level + 1)}
          </div>
        )}

        {expandedFolders.has(node.id) && loadingChildren[node.id] && (
          <div className="ml-8 text-sm text-gray-500 py-1">
            {t('common.loading')}
          </div>
        )}
      </div>
    ))
  }

  // Handle create folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      const payload: DriveCreateFolderPayload = {
        folderName: newFolderName.trim(),
        parentFolderId:
          createInFolderId === 'root' ? undefined : createInFolderId,
      }

      const newFolder = await onCreateFolder(payload)
      setNewFolderName('')
      setShowCreateForm(false)

      // Refresh the appropriate folder
      if (createInFolderId === 'root') {
        rootFoldersQuery.refetch()
      } else {
        // Optionally refresh the parent folder's children
        // This would require additional state management
      }
    } catch (error) {
      console.error('Failed to create folder:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('googleDrive.rootFolder.title')}
            </h2>
            <Text className="text-gray-600 mt-1">
              {t('googleDrive.rootFolder.description')}
            </Text>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
            disabled={isSettingRoot}
          >
            <FaTimes className="text-gray-400" />
          </Button>
        </div>

        {/* Folder Tree */}
        <div className="flex-1 overflow-y-auto">
          {rootFoldersQuery.isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
              <Text className="text-gray-500">
                {t('googleDrive.rootFolder.loading')}
              </Text>
            </div>
          )}
          {!rootFoldersQuery.isLoading && rootFoldersQuery.error && (
            <div className="text-center py-8">
              <Text className="text-red-600 mb-2">
                {t('googleDrive.rootFolder.error')}
              </Text>
              <Button
                variant="outline"
                size="sm"
                onClick={() => rootFoldersQuery.refetch()}
                disabled={rootFoldersQuery.isRefetching}
              >
                {rootFoldersQuery.isRefetching ? 'Retrying...' : 'Retry'}
              </Button>
            </div>
          )}
          {!rootFoldersQuery.isLoading && !rootFoldersQuery.error && (
            <div className="py-4">
              {/* My Drive Root */}
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50">
                <div
                  className="flex items-center cursor-pointer flex-1"
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleFolder('root', 'My Drive', -1)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleFolder('root', 'My Drive', -1)
                    }
                  }}
                >
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      toggleFolder('root', 'My Drive', -1)
                    }}
                    className="mr-2 p-1 hover:bg-gray-200 rounded transition-colors"
                    disabled={isSettingRoot}
                  >
                    {expandedFolders.has('root') ? (
                      <FaChevronDown className="text-xs text-gray-500" />
                    ) : (
                      <FaChevronRight className="text-xs text-gray-500" />
                    )}
                  </button>
                  <FaHome className="text-blue-500 mr-3" />
                  <Text className="font-medium text-gray-900">My Drive</Text>
                </div>
              </div>

              {/* Render folder tree */}
              {expandedFolders.has('root') && (
                <div className="divide-y divide-gray-100">
                  {folderTree.length > 0 ? (
                    renderFolderTree(folderTree)
                  ) : (
                    <div className="text-center py-8">
                      <FaFolder className="text-gray-300 text-4xl mx-auto mb-2" />
                      <Text className="text-gray-500">
                        {t('googleDrive.rootFolder.noFoldersFound')}
                      </Text>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSettingRoot}
            >
              Cancel
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setShowCreateForm(true)
                setCreateInFolderId('root')
              }}
              disabled={isCreatingFolder || isSettingRoot}
              className="border-dashed"
            >
              <FaPlus className="mr-2" />
              Create New Folder in My Drive
            </Button>
          </div>
        </div>

        {/* Create Folder Modal */}
        {showCreateForm && (
          <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center rounded-lg">
            <div className="bg-white rounded-lg shadow-lg p-6 m-4 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
              <div className="space-y-4">
                <Input
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  disabled={isCreatingFolder}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !isCreatingFolder) {
                      handleCreateFolder()
                    }
                  }}
                />
                <div className="flex space-x-3">
                  <Button
                    onClick={handleCreateFolder}
                    disabled={!newFolderName.trim() || isCreatingFolder}
                    className="flex-1"
                  >
                    {isCreatingFolder ? 'Creating...' : 'Create'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewFolderName('')
                    }}
                    disabled={isCreatingFolder}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Setting Root Overlay */}
        {isSettingRoot && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <Text className="text-gray-700 font-medium">
                {t('googleDrive.rootFolder.settingLoading')}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                {t('googleDrive.rootFolder.settingLoadingDescription')}
              </Text>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
