import { FC } from 'react'

import DatePicker from 'react-datepicker'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/Badge'
import { TypeSupported } from '@/types/class-material'
import { formatFileSize } from '@/utils/number.utils'

import { MaterialItemData } from '../../schemas/materialForm.schema'

interface Props {
  fileItem: MaterialItemData
  updateExpiryDate: (date: Date | null) => void
}

type FileMaterialData = Extract<
  MaterialItemData,
  { type: TypeSupported.DOCUMENT }
>

const FileItem: FC<Props> = ({ fileItem, updateExpiryDate }): JSX.Element => {
  const { t } = useTranslation('material')

  // Type assertion: FileItem hanya dapat menerima DOCUMENT type
  const documentItem = fileItem as FileMaterialData
  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <p className="font-semibold text-gray-800">{documentItem.fileName}</p>
        <Badge>{formatFileSize(documentItem?.fileSize ?? 0)}</Badge>
      </div>
      {/* <div className="space-y-1 w-full">
        <div className="text-sm font-medium">
          {t('uploadMaterials.form.expiryLabel')}
        </div>
        <DatePicker
          wrapperClassName="w-full"
          className="border border-gray-400 rounded-md text-sm h-10 px-4 w-full"
          selected={documentItem.expiryDate}
          placeholderText={
            t('uploadMaterials.form.expiryPlaceholder') as string
          }
          onChange={date => updateExpiryDate(date)}
        />
      </div> */}
    </>
  )
}

export default FileItem
