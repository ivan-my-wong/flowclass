import { LucideMessageCircle } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'

import Button from './Button'

const EnquiryButton = ({
  contactMethodLink,
}: {
  contactMethodLink: string
}): React.ReactElement => {
  const { t } = useTranslation()

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch (error) {
      return false
    }
  }

  if (!isValidUrl(contactMethodLink)) return <></>

  return (
    <Button
      className="rounded-full font-normal transition-colors"
      iconBefore={<LucideMessageCircle size={16} />}
      onClick={() => {
        if (contactMethodLink !== '') {
          const newWindow = window.open(contactMethodLink, '_blank')
          if (newWindow) {
            newWindow.opener = null
          }
        }
      }}
    >
      {t('common:action.enquiry')}
    </Button>
  )
}

export default EnquiryButton
