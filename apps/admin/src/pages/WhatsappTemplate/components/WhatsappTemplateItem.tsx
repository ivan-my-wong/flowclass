import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import {
  LuBadge,
  LuBadgeAlert,
  LuBadgeCheck,
  LuCheckCircle,
  LuClipboardX,
  LuPencil,
  LuTrash,
} from 'react-icons/lu'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  WhatsappTemplate,
  WhatsappTemplateStatus,
} from '@/types/whatsappTemplate'

type PropType = {
  item: WhatsappTemplate
  onDelete: () => void
}
const WhatsappTemplateItem = ({ item, onDelete }: PropType): JSX.Element => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const goToEdit = () => {
    navigate(`/whatsapp-templates/edit?id=${item.id}`)
  }
  const variantBadge = useMemo(() => {
    switch (item.status) {
      case WhatsappTemplateStatus.PENDING:
        return 'warning'
      case WhatsappTemplateStatus.UNSUBMITTED:
        return 'dark'
      case WhatsappTemplateStatus.APPROVED:
        return 'success'
      case WhatsappTemplateStatus.REJECTED:
        return 'error'
      default:
        return 'default'
    }
  }, [item.status])
  const statusIcon = useMemo(() => {
    switch (item.status) {
      case WhatsappTemplateStatus.PENDING:
        return <LuBadgeAlert size={14} />
      case WhatsappTemplateStatus.UNSUBMITTED:
        return <LuBadge size={14} />
      case WhatsappTemplateStatus.APPROVED:
        return <LuBadgeCheck size={14} />
      case WhatsappTemplateStatus.REJECTED:
        return <LuClipboardX size={14} />
      default:
        return <LuCheckCircle size={14} />
    }
  }, [item.status])
  return (
    <div className="flex flex-row p-4 rounded-md w-full bg-gray-100">
      <div className="w-full flex flex-col gap-4">
        <h3 className="font-bold">{item.name}</h3>
        <p className="text-ellipsis  line-clamp-2 mb-2">{item.content}</p>
        <div className="flex flex-wrap gap-2">
          <Badge
            className="text-sm capitalize gap-x-1 items-center"
            variant={variantBadge}
          >
            {statusIcon}
            <span>{item.status}</span>
          </Badge>
          {item.isDefault && (
            <Badge
              className="text-sm capitalize gap-x-2 items-center"
              variant="default"
            >
              <LuCheckCircle size={14} /> <span>{t('common:default')}</span>
            </Badge>
          )}
          {/* {item.variables && */}
          {/*  Object.keys(item.variables)?.map(tag => ( */}
          {/*    <Badge className="text-sm" variant="outline" key={tag}> */}
          {/*      {(item.variables as Record<string, any>)[tag]} */}
          {/*    </Badge> */}
          {/*  ))} */}
        </div>
      </div>
      <div className="w-1/2 flex flex-col items-end gap-y-4 justify-end">
        <div className="flex w-full justify-end">
          <Button variant="ghost" onClick={goToEdit}>
            <LuPencil size={24} />
          </Button>
          <Button variant="ghost" onClick={onDelete}>
            <LuTrash size={24} className=" text-red-500" />
          </Button>
        </div>
        <div className="text-right">
          Assigned to:{' '}
          {(item.assignedTo as Record<string, any> | undefined)?.name ??
            (item.assignedTo as Record<string, any> | undefined)
              ?.functionName ??
            '-'}
        </div>
      </div>
    </div>
  )
}

export default WhatsappTemplateItem
