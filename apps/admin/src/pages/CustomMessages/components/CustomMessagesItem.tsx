import { useNavigate } from 'react-router-dom'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { FaWhatsapp } from 'react-icons/fa'
import { LuMail, LuPencil } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import { CustomMessage } from '@/types/customMessage'

type PropType = {
  item: CustomMessage
}

const CustomMessageItem = ({ item }: PropType): JSX.Element => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const goToEdit = () => {
    navigate(`/custom-messages/edit?id=${item.id}`)
  }

  return (
    <div className="flex flex-row p-4 rounded-md w-full bg-gray-100">
      <div className="w-full flex flex-col">
        <div className="box-row-full">
          <h3 className="font-bold flex-shrink-0">{item.name}</h3>
          <div className="flex w-full justify-end">
            <Button
              variant="ghost"
              onClick={goToEdit}
              aria-label={`Edit ${t(`customMessage:form.${item.type}`)}`}
              data-testid="edit-custom-message"
            >
              <LuPencil size={24} />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-1">
          {item.emailNotification && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <LuMail size={16} />
              <span>{t('customMessage:form.emailNotification')}</span>
            </div>
          )}
          {item.whatsappNotification && (
            <div className="flex items-center gap-1.5 text-sm text-green-600">
              <FaWhatsapp size={16} />
              <span>{t('customMessage:form.whatsappNotification')}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 mt-2">
          {t('customMessage:customMessage.updatedAt')}:{' '}
          {item.updatedAt
            ? dayjs(item.updatedAt).format('DD/MM/YYYY HH:mm')
            : ''}
        </p>
      </div>
    </div>
  )
}

export default CustomMessageItem
