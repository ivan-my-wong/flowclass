import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { BiChevronDown, BiChevronRight, BiFolder } from 'react-icons/bi'

import { Button } from '@/components/ui/Button'
import Text from '@/components/ui/Text'

type GoogleDriveTreeNode =
  | {
      id: string
      name: string
      type: 'folder'
      children?: GoogleDriveTreeNode[]
    }
  | {
      id: string
      name: string
      type: 'file'
    }

interface TreeItemProps {
  node: GoogleDriveTreeNode
  onSelect: (id: string, name: string) => void
  isSettingRoot: boolean
}

export const TreeItem = ({ node, onSelect, isSettingRoot }: TreeItemProps) => {
  const [expanded, setExpanded] = useState(true)

  const { t } = useTranslation(['integration'])

  const isFolder = node.type === 'folder'

  return (
    <div className="ml-4">
      <div className="flex items-center justify-between py-1">
        <button
          type="button"
          aria-expanded={expanded}
          className="flex items-center cursor-pointer select-none flex-1 text-left bg-transparent"
          onClick={() => isFolder && setExpanded(!expanded)}
        >
          {isFolder && (
            <>
              {expanded ? (
                <BiChevronDown size={14} className="mr-1 text-gray-400" />
              ) : (
                <BiChevronRight size={14} className="mr-1 text-gray-400" />
              )}
            </>
          )}
          <BiFolder size={16} className="mr-2 text-blue-600" />
          <Text className="text-sm text-gray-700 truncate" title={node.name}>
            {node.name}
          </Text>
        </button>

        {isFolder && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelect(node.id, node.name)}
            disabled={isSettingRoot}
            className="ml-3 whitespace-nowrap"
          >
            {isSettingRoot
              ? t('integration:common.processing', 'Processing...')
              : t('integration:googleDrive.select')}
          </Button>
        )}
      </div>

      {isFolder && expanded && (node.children?.length ?? 0) > 0 && (
        <div className="ml-4 mt-1 border-l border-gray-200 pl-4">
          {node.children?.map(child => (
            <TreeItem
              key={child.id}
              node={child}
              onSelect={onSelect}
              isSettingRoot={isSettingRoot}
            />
          ))}
        </div>
      )}
    </div>
  )
}
