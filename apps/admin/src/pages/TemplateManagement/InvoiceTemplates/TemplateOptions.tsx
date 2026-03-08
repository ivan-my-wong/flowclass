import { FC, useMemo } from 'react'

import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/Badge'
import { invoiceCampaignMessageTemplate } from '@/constants/invoiceCampaign.constant'
import {
  materialMessageTemplate,
  studentSubmissionMessageTemplate,
} from '@/constants/materials.constant'
import type { VariableItem } from '@/types/studentInvoice.type'

type Props = {
  module: 'invoiceCampaign' | 'material' | 'studentSubmission'
  onSelectMessage: (message: VariableItem) => void
}
const TemplateOptions: FC<Props> = ({ onSelectMessage, module }) => {
  const { t } = useTranslation(['invoiceCampaign'])
  const messageTemplate = useMemo(() => {
    switch (module) {
      case 'invoiceCampaign':
        return invoiceCampaignMessageTemplate
      case 'material':
        return materialMessageTemplate
      case 'studentSubmission':
        return studentSubmissionMessageTemplate
      default:
        return []
    }
  }, [module])
  return (
    <div className="flex flex-wrap gap-1">
      {messageTemplate.map(item => (
        <Badge
          key={item.name}
          variant="light"
          className="cursor-pointer"
          onClick={() => onSelectMessage(item)}
          data-testid="content-variable"
        >
          {t(item.name)}{' '}
        </Badge>
      ))}
    </div>
  )
}
export default TemplateOptions
