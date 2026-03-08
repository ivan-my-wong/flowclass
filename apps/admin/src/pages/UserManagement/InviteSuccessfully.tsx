import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { FaCopy } from 'react-icons/fa'
import { toast } from 'sonner'

import Spacer from '@/components/Separators/Spacer'
import Link from '@/components/Texts/Link'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { InviteSuccessResponse } from '@/types/userManagement'

type Props = {
  inviteSuccessResponse: InviteSuccessResponse
}
export default function InviteSuccessfully({
  inviteSuccessResponse,
}: Props): JSX.Element {
  const { t } = useTranslation()
  const [isCopied, setIsCopied] = useState(false)
  return (
    <Box className="bg-background-layer-3 p-4 flex-wrap" padding="base">
      <Text>
        {t('setting:userManagement.invitationEmailSent')}{' '}
        {t('setting:userManagement.inviteLinkProvide')}
      </Text>
      <Spacer space="y1" />
      <Link
        href={inviteSuccessResponse.inviteLink}
        target="_blank"
        rel="noreferrer noopener"
      >
        {inviteSuccessResponse.inviteLink}
      </Link>

      <Button
        data-testid="copy-invite-link-button"
        onClick={e => {
          try {
            e.preventDefault()
            navigator.clipboard.writeText(
              inviteSuccessResponse.inviteLink.replace('https://', '')
            )
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 5000) // Reset copied status after 5 seconds
            toast.success(t('embed:code.linkCopied'))
          } catch (err) {
            toast.error(t('embed:code.copyFailed'))
          }
        }}
        className="sm:mr-auto sm:mt-2"
        type="button"
      >
        {isCopied ? (
          t('embed:code.copied')
        ) : (
          <Box>
            <FaCopy />
            {t('embed:code.copy')}
          </Box>
        )}
      </Button>
    </Box>
  )
}
