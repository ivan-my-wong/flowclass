import { FC } from 'react'

import DatePicker from 'react-datepicker'
import { useTranslation } from 'react-i18next'

import { Input } from '@/components/ui/Inputs/Input'
import { TypeSupported } from '@/types/class-material'

import { MaterialItemData } from '../../schemas/materialForm.schema'

interface Props {
  materialItem: MaterialItemData
  onUpdateMaterialDetail: (field: string, value: string | Date | null) => void
}

type LinkMaterialData = Extract<MaterialItemData, { type: TypeSupported.LINK }>
const LinkItem: FC<Props> = ({
  materialItem,
  onUpdateMaterialDetail,
}): JSX.Element => {
  const { t } = useTranslation('material')

  // Type assertion: LinkItem hanya dapat menerima LINK type
  const linkItem = materialItem as LinkMaterialData
  return (
    <div className="space-y-2">
      <div>
        <div className="mb-1 text-sm font-medium">
          {t('uploadMaterials.form.materialNameLabel')}*
        </div>
        <Input
          value={linkItem?.fileName ?? ''}
          onChange={e => onUpdateMaterialDetail('fileName', e.target.value)}
          placeholder={
            t('uploadMaterials.form.materialNamePlaceholder') as string
          }
        />
      </div>
      <div>
        <div className="mb-1 text-sm font-medium">
          {t('uploadMaterials.form.materialDescLabel')}
        </div>
        <Input
          value={linkItem?.description ?? ''}
          onChange={e => onUpdateMaterialDetail('description', e.target.value)}
          placeholder={
            t('uploadMaterials.form.materialDescPlaceholder') as string
          }
        />
      </div>
      <div>
        <div className="mb-1 text-sm font-medium">
          {t('uploadMaterials.form.linkUrlLabel')}*
        </div>
        <Input
          value={linkItem?.link ?? ''}
          onChange={e => onUpdateMaterialDetail('link', e.target.value)}
          placeholder="https://example.com"
        />
      </div>
      {/* <div>
        <div className="mb-1 text-sm font-medium">
          {t('uploadMaterials.form.expiryLabel')}
        </div>
        <DatePicker
          wrapperClassName="w-full"
          className="border border-gray-500 rounded-md text-sm h-10 px-4 w-full"
          selected={linkItem.expiryDate}
          placeholderText={
            t('uploadMaterials.form.expiryPlaceholder') as string
          }
          onChange={date => onUpdateMaterialDetail('expiryDate', date)}
        />
      </div> */}
    </div>
  )
}

export default LinkItem
