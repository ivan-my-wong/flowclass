import useCustomMessageData from '@/hooks/useCustomMessageData'
import { useWhatsappWeb } from '@/hooks/useWhatsappWeb'
import { SUPPORTED_WHATSAPP_TEMPLATE } from '@/types/customMessage'

import CustomMessageItem from './CustomMessagesItem'
import WhatsappConnection from './WhatsappConnection'

const ListCustomMessages = (): JSX.Element => {
  const { useFetchCustomMessageData } = useCustomMessageData()
  const { data: customMessages } = useFetchCustomMessageData()

  const { useGetSessionStatus } = useWhatsappWeb()
  const {
    data: whatsappSessionStatus,
    isLoading: isWhatsappSessionStatusLoading,
    refetch: refetchSessionStatus,
  } = useGetSessionStatus()

  return (
    <div className="box-col p-4">
      <WhatsappConnection
        whatsappSessionStatus={whatsappSessionStatus}
        refetchSessionStatus={refetchSessionStatus}
        isWhatsappSessionStatusLoading={isWhatsappSessionStatusLoading}
      />
      <div className="flex flex-col gap-4 justify-start items-start w-full">
        {customMessages?.data &&
          customMessages.data
            .sort((a, b) => {
              return (
                new Date(b.updatedAt || 0).getTime() -
                new Date(a.updatedAt || 0).getTime()
              )
            })
            .filter(item => SUPPORTED_WHATSAPP_TEMPLATE.includes(item.type))
            .map(item => (
              <CustomMessageItem
                item={item}
                key={`whatsapp-template-${item.id}`}
                whatsappSessionStatus={whatsappSessionStatus}
                isWhatsappSessionStatusLoading={isWhatsappSessionStatusLoading}
              />
            ))}
      </div>
    </div>
  )
}

export default ListCustomMessages
