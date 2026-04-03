import useCustomMessageData from '@/hooks/useCustomMessageData'
import { SUPPORTED_WHATSAPP_TEMPLATE } from '@/types/customMessage'

import CustomMessageItem from './CustomMessagesItem'

const ListCustomMessages = (): JSX.Element => {
  const { useFetchCustomMessageData } = useCustomMessageData()
  const { data: customMessages } = useFetchCustomMessageData()

  return (
    <div className="box-col p-4">
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
              />
            ))}
      </div>
    </div>
  )
}

export default ListCustomMessages
