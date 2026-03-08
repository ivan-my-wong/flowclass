import { Translate } from 'next-translate'

import { PhoneContactMethod } from '@/types'

const baseWhatsAppUrl = 'https://api.whatsapp.com/send/?phone='

export const getContactMethodLink = ({
  contactId,
  contactMethod,
  phone,
  schoolUrl,
  domain,
  coursePath,
  customMessage,
}: {
  contactId?: string
  contactMethod?: PhoneContactMethod
  phone?: string
  schoolUrl?: string
  domain?: string
  coursePath?: string
  customMessage?: string
}): string => {
  let path = ''
  if (contactMethod === PhoneContactMethod.WhatsApp) {
    if (customMessage) {
      path = `${baseWhatsAppUrl}${phone}&text=${encodeURIComponent(customMessage)}`
    } else {
      path = `${baseWhatsAppUrl}${phone}&text=From%20https://${domain}/@${schoolUrl ?? ''}/${
        coursePath ?? ''
      }`
    }
  } else {
    if (contactId) {
      if (contactMethod === PhoneContactMethod.Line) {
        return contactId
      }
      if (contactMethod === PhoneContactMethod.Telegram) {
        return `https://t.me/${contactId}`
      }
      if (contactMethod === PhoneContactMethod.Signal) {
        return `https://signal.me/#p/+${phone}`
      }
    }
  }

  return path
}

export const getSupportWhatsAppLink = (errorMessage: string, t: Translate): string => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const baseUrl = `${baseWhatsAppUrl}85257225763&text=`
  const message = `${t('common:notFound.technicalSupport')} ${currentUrl} ${t(
    'common:notFound.error'
  )}: ${errorMessage}`
  return `${baseUrl}${encodeURIComponent(message)}`
}
