import { useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuAlertCircle, LuDot, LuUploadCloud, LuX } from 'react-icons/lu'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatFileSize } from '@/utils/number.utils'

import { FileDetail, useContextBulkUpload } from './BulkUploadContext'

const FileSelection = (): JSX.Element => {
  const { t } = useTranslation(['studentSubmission'])
  const [isShowNamingConvention, setShowNamingConvention] = useState(true)
  const { selectedFiles, setSelectedFiles, studentList } =
    useContextBulkUpload()
  const fileUploadRef = useRef<HTMLInputElement>(null)

  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target
    setSelectedFiles(prev => {
      const newFiles = Array.from(files ?? [])
        .map(item => {
          const isExist = prev.some(sf => sf.fileName === item.name)
          if (isExist) return null
          const targetedStudentName = item.name.split('_')
          const studentDetail = studentList.find(
            item => item.label === targetedStudentName[0]
          )
          return {
            file: item,
            fileName: item.name,
            fileSize: item.size,
            isMatch: Boolean(studentDetail),
            student: studentDetail ?? null,
          }
        })
        .filter(item => item !== null) as FileDetail[]
      return newFiles.concat(prev) as FileDetail[]
    })
  }

  const removeFile = (fileIndex: number) => {
    setSelectedFiles(prev => {
      const copy = [...prev]
      copy.splice(fileIndex, 1)
      return copy
    })
  }

  const fileNamingExample = () => {
    const items: JSX.Element[] = []
    for (let i = 0; i < 3; i++) {
      items.push(
        <div key={i} className="flex items-center gap-1 mb-1">
          <LuDot size={20} />
          <div>{t(`bulkUpload.namingConvention.example${i + 1}`)}</div>
        </div>
      )
    }

    return <div>{items}</div>
  }

  return (
    <div className="space-y-4">
      {isShowNamingConvention && (
        <div className="p-4 rounded-lg bg-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <LuAlertCircle className="text-blue-600" />
            <div className="text-blue-600 font-medium">
              {t('bulkUpload.namingConvention.title')}
            </div>
            <LuX
              size={22}
              className="ml-auto cursor-pointer"
              onClick={() => setShowNamingConvention(false)}
            />
          </div>
          <div className="text-sm">
            <div className="mb-2">{t('bulkUpload.namingConvention.desc')}</div>
            <div className="mb-1">
              {t('bulkUpload.namingConvention.exampleLabel')}
            </div>
            {fileNamingExample()}
          </div>
        </div>
      )}
      <div>
        <div className="p-4 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center space-y-2">
          <LuUploadCloud size={34} className="text-gray-700" />
          <div className="text-gray-700 font-medium">
            {t('bulkUpload.selectFileToUpload')}
          </div>
          <div className="text-gray-500 text-sm">
            {t('bulkUpload.supportTypes')}
          </div>
          <Button onClick={() => fileUploadRef.current?.click()} type="button">
            {t('bulkUpload.selectFiles')}
          </Button>
        </div>
        <input
          type="file"
          multiple
          ref={fileUploadRef}
          onChange={onFileSelected}
          hidden
        />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">
          {t('bulkUpload.selectedFiles', { fileLength: selectedFiles.length })}
        </div>
        {selectedFiles.map((fileItem, fileIndex) => (
          <div
            key={fileItem.fileName}
            className="p-3 rounded-lg bg-gray-100 mb-2 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-700">{fileItem.fileName}</div>
              <Badge>{formatFileSize(fileItem.fileSize)}</Badge>
            </div>
            <LuX
              size={20}
              className="cursor-pointer text-gray-700"
              onClick={() => removeFile(fileIndex)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default FileSelection
