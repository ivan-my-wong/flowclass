import { useTranslation } from 'react-i18next'
import { CgProfile } from 'react-icons/cg'
import { HiOutlineDocument } from 'react-icons/hi2'
import { ImWhatsapp } from 'react-icons/im'
import {
  MdNoAccounts,
  MdOutlineMarkEmailUnread,
  MdSecurity,
} from 'react-icons/md'

import Logout from '@/components/Buttons/Logout'
import ActionCard from '@/components/Cards/ActionCard'
import Heading from '@/components/Texts/Heading'
import Link from '@/components/Texts/Link'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import ShadowBox from '@/components/ui/ShadowBox'
import { LinkToGuides, WhatsAppSupportLinks } from '@/constants/guides'

const AccountPage = (): JSX.Element => {
  const { t } = useTranslation()

  const items = [
    {
      label: 'account:updateProfile',
      icon: <CgProfile />,
      path: '/account/update-profile',
    },
    {
      label: 'account:changePassword',
      icon: <MdSecurity />,
      path: '/account/change-password',
    },
    {
      label: 'account:deleteAccount.deleteAccount',
      icon: <MdNoAccounts />,
      path: '/account/delete',
    },
  ]

  return (
    <Box direction="col" padding="lg" justify="start" className="min-h-dvh">
      <Box direction="col">
        <Heading size="medium">{t('account:pageTitle')}</Heading>
        <ActionCard items={items} />
      </Box>
      <Box direction="col">
        <Heading size="medium">{t('account:support')}</Heading>
        <Text align="center">{t('account:introductionFlowclass')}</Text>
        <ShadowBox direction="row">
          <ImWhatsapp />
          <Text>
            {t('common:fields.whatsapp')}:{' '}
            <Link href={WhatsAppSupportLinks.whatsappHelp}>+852 5722 5763</Link>
          </Text>
        </ShadowBox>
        <ShadowBox>
          <MdOutlineMarkEmailUnread />
          <Text>
            {t('common:fields.email')}:{' '}
            <Link href="mailto:info@flowclass.io">info@flowclass.io</Link>
          </Text>
        </ShadowBox>
        <ShadowBox>
          <HiOutlineDocument style={{ flexShrink: 0 }} />
          <Text align="center">
            {t('account:documentation')}:{' '}
            <Link
              href="https://flowsophicofficial.notion.site/966c775b9bf340a9afd47a385a742dfb?v=8c4a134b27714d46a8c2f1252531ad96&pvs=4"
              target="_blank"
            >
              https://flowsophicofficial.notion.site/966c775b9bf340a9afd47a385a742dfb?v=8c4a134b27714d46a8c2f1252531ad96&pvs=4
            </Link>
          </Text>
        </ShadowBox>
      </Box>

      <Box className="mt-4">
        <Logout />
      </Box>
    </Box>
  )
}

export default AccountPage
