import { BsTelephoneFill } from 'react-icons/bs'
import { SiKakaotalk, SiLine, SiSignal, SiTelegram, SiWechat, SiWhatsapp } from 'react-icons/si'

import { PhoneContactMethod } from '@/types'

export const contactMethodIcon = (method: PhoneContactMethod) => {
  switch (method) {
    case PhoneContactMethod.WhatsApp:
      return <SiWhatsapp />
    case PhoneContactMethod.Line:
      return <SiLine />
    case PhoneContactMethod.KakaoTalk:
      return <SiKakaotalk />
    case PhoneContactMethod.Signal:
      return <SiSignal />
    case PhoneContactMethod.Wechat:
      return <SiWechat />
    case PhoneContactMethod.Telegram:
      return <SiTelegram />
    default:
      return <BsTelephoneFill />
  }
}
