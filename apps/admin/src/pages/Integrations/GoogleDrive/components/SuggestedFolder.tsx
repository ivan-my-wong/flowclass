'use client'

import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { BiChevronDown, BiChevronRight, BiFolder } from 'react-icons/bi'
import { FiFile } from 'react-icons/fi'

type TreeNode = {
  name: string
  type: 'folder' | 'video' | 'student' | 'admin' | 'file'
  children?: TreeNode[]
}

const data: TreeNode = {
  name: 'Class Lesson ID',
  type: 'folder',
  children: [
    {
      name: 'Lesson 1',
      type: 'folder',
      children: [
        {
          name: 'Lesson Videos',
          type: 'folder',
          children: [
            { name: 'Introduction.mp4', type: 'video' },
            { name: 'Main_Content.mp4', type: 'video' },
          ],
        },
        {
          name: 'Lesson Materials',
          type: 'folder',
          children: [
            { name: 'Worksheet_1.pdf', type: 'file' },
            { name: 'Reading_Material.pdf', type: 'file' },
            { name: 'Assignment_Instructions.docx', type: 'file' },
          ],
        },
        {
          name: 'Student Documents',
          type: 'folder',
          children: [
            {
              name: 'Student ID 1',
              type: 'folder',
              children: [
                { name: 'Document 1.student', type: 'student' },
                { name: 'Document 2.admin', type: 'admin' },
              ],
            },
            {
              name: 'Student ID 2',
              type: 'folder',
              children: [{ name: 'Document 1.student', type: 'student' }],
            },
          ],
        },
      ],
    },
  ],
}

const TYPE_COLORS: Record<TreeNode['type'], string> = {
  video: 'text-purple-600',
  student: 'text-green-600',
  admin: 'text-orange-600',
  folder: 'text-blue-600',
  file: 'text-gray-500',
}

const getColor = (type: TreeNode['type']) => TYPE_COLORS[type]

const StaticTreeItem = ({
  node,
  path = [],
}: {
  node: TreeNode
  path?: string[]
}) => {
  const [expanded, setExpanded] = useState(true)
  const isFolder = node.type === 'folder'

  return (
    <div className="ml-4" role="none">
      <div
        className="flex items-center cursor-pointer select-none"
        role="treeitem"
        aria-selected="false"
        aria-expanded={isFolder ? expanded : undefined}
        tabIndex={isFolder ? 0 : -1}
        onClick={() => isFolder && setExpanded(!expanded)}
        onKeyDown={e => {
          if (!isFolder) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded(prev => !prev)
          }
        }}
      >
        {isFolder && (
          <>
            {expanded ? (
              <BiChevronDown
                size={14}
                className="mr-1 text-gray-400"
                aria-hidden="true"
              />
            ) : (
              <BiChevronRight
                size={14}
                className="mr-1 text-gray-400"
                aria-hidden="true"
              />
            )}
          </>
        )}
        {isFolder ? (
          <BiFolder
            size={16}
            className={`mr-2 ${getColor(node.type)}`}
            aria-hidden="true"
          />
        ) : (
          <FiFile
            size={16}
            className={`mr-2 ${getColor(node.type)}`}
            aria-hidden="true"
          />
        )}
        <span className="text-sm text-gray-700 truncate" title={node.name}>
          {node.name}
        </span>{' '}
      </div>
      {isFolder && expanded && node.children && (
        <div className="ml-4 mt-1" role="group">
          {node.children.map((child, idx) => (
            <StaticTreeItem
              key={[...path, child.name].join('/')}
              node={child}
              path={[...path, node.name]}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const SuggestedFolder = () => {
  const { t } = useTranslation('integration')
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {t('googleDrive.suggestedFolders.title')}
      </h3>
      <p className="text-gray-500 text-sm mb-4">
        {t('googleDrive.suggestedFolders.description')}
      </p>

      <StaticTreeItem node={data} path={[data.name]} />

      {/* Legend */}
      <div className="mt-6 text-sm">
        <h4 className="font-medium text-gray-800 mb-2">
          {t('googleDrive.colorLegend')}
        </h4>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 rounded bg-blue-600" />
            <span>Folders</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 rounded bg-purple-600" />
            <span>Video Files</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 rounded bg-green-600" />
            <span>Student Files</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 rounded bg-orange-600" />
            <span>Admin Files</span>
          </div>
        </div>
      </div>
    </div>
  )
}
