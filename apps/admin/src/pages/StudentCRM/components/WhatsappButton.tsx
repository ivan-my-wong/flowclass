import { forwardRef } from 'react'

import { useTranslation } from 'react-i18next'
import { IoLogoWhatsapp } from 'react-icons/io'
import { useRecoilValue } from 'recoil'

import IconButton from '@/components/Buttons/IconButton'
import { studentLinksBaseUrl } from '@/constants/enrollmentFormFieldNames'
import useSchoolData from '@/hooks/useSchoolData'
import notificationSettingState from '@/stores/NotificationSettingData'
import { siteState } from '@/stores/siteData'
import { generateMessage, siteDomainIfCustom } from '@/utils/string'

export const WHATSAPP_API_URL =
  'https://api.whatsapp.com/send/?phone=:phone&text='

type WhatsAppLink = {
  course?: string
  class?: string
  enrolId?: string
  enrollIds?: string
  studentName?: string
  token?: string
  link?: string
}

type WhatsappButtonProps = {
  phone: string
  type: 'course' | 'apply' | 'payment' | 'coupon' | 'custom'
  params: WhatsAppLink
  customMessage?: string
}
const WhatsappButton = forwardRef<HTMLButtonElement, WhatsappButtonProps>(
  ({ phone, type, params, customMessage }, ref) => {
    const { t } = useTranslation()

    const { schoolData } = useSchoolData()
    const { currentSite } = useRecoilValue(siteState)
    const notificationSettingData = useRecoilValue(notificationSettingState)

    const presetMessage = notificationSettingData.currentSetting?.customMessage

    const schoolId = schoolData.currentSchool?.id.toString() ?? '0'

    const schoolName = schoolData.currentSchool?.name ?? ''

    let url = WHATSAPP_API_URL.replace(':phone', phone)

    const schoolUrl = schoolData.currentSchool?.url ?? ''

    const siteUrl = currentSite?.url ?? ''
    const domain = siteDomainIfCustom(currentSite?.customDomain, siteUrl)
    if (type === 'custom') {
      url += encodeURIComponent(customMessage ?? '')
    } else if (type === 'payment') {
      const linkParams = new URLSearchParams({
        schoolId,
        school: schoolUrl,
        ...params,
      })

      const paymentLink = `https://${domain}${studentLinksBaseUrl.uploadReceipt}?${linkParams}`

      const messageParams = {
        courseName: params.course,
        studentName: params.studentName,
        institutionName: schoolName,
        paymentLink,
      }

      const message = generateMessage(
        presetMessage ?? '',
        messageParams,
        `${t('student:message.askForPayment')}: ${paymentLink}`
      )

      url += encodeURIComponent(message ?? '')
    } else if (type === 'apply') {
      const messageParams = {
        courseName: params.course,
        studentName: params.studentName,
        className: params.class,
        institutionName: schoolName,
        paymentLink: params.link,
      }

      const message = generateMessage(
        presetMessage ?? '',
        messageParams,
        `${t('student:message.askForApply')}: ${params.link}`
      )
      url += encodeURIComponent(message ?? '')
    } else {
      url += encodeURIComponent(customMessage ?? '')
    }

    return (
      <IconButton
        ref={ref}
        icon={<IoLogoWhatsapp />}
        size="medium"
        plain
        onClick={() => {
          window.open(url, '_blank')
        }}
        tabIndex={-1}
        css={{ color: '#25D366' }}
      />
    )
  }
)

export default WhatsappButton
