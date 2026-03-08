/* eslint-disable prettier/prettier */
import { Dispatch, SetStateAction } from 'react'

import { useTranslation } from 'react-i18next'

import { Input } from '@/components/ui/Inputs/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { whatsAppStatusesSupported } from '@/constants/whatsappTemplate'

type PropsType = {
  params: Record<string, any>
  setParams: Dispatch<SetStateAction<Record<string, any>>>
}
const FilterWhatsappTemplate = ({
  params,
  setParams,
}: PropsType): JSX.Element => {
  const { t } = useTranslation()

  return (
    <div className="md:flex w-full gap-x-4 space-y-1">
      <Input
        name="search"
        placeholder="Search template by name"
        onChange={e => setParams({ ...params, name: e.target.value })}
      />
      <Select
        name="status"
        onValueChange={value => setParams({ ...params, status: value })}
      >
        <SelectTrigger className="md:w-[180px]">
          <SelectValue
            placeholder={t('whatsappTemplate:filter.allStatusesPlaceholder')}
          />
        </SelectTrigger>
        <SelectContent>
          {whatsAppStatusesSupported.map(item => (
            <SelectItem key={item.value} value={item.value}>
              {t(item.name)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default FilterWhatsappTemplate
