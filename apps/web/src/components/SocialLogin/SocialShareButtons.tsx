import useTranslation from 'next-translate/useTranslation'
import { FaFacebook } from 'react-icons/fa'
import { ImWhatsapp } from 'react-icons/im'
import { FacebookShareButton, WhatsappShareButton } from 'react-share'

import Box from '@/components/Containters/Box'

const SocialShareButtons = ({ baseUrl }: { baseUrl: string }): JSX.Element => {
  const { t } = useTranslation()
  return (
    <Box>
      <div className="border-textSubtle rounded border px-4 py-2">
        <FacebookShareButton url={baseUrl} className="flex items-center gap-2">
          <FaFacebook />

          {t('common:action.share')}
          {/* <FacebookShareCount url={baseUrl} /> */}
        </FacebookShareButton>
      </div>
      <div className="border-textSubtle rounded border px-4 py-2">
        <WhatsappShareButton url={baseUrl} className="flex items-center gap-2">
          <ImWhatsapp />

          {t('common:action.share')}
        </WhatsappShareButton>
      </div>
    </Box>
  )
}

export default SocialShareButtons
