import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { IoIosInformationCircle } from 'react-icons/io'
import { MdLanguage } from 'react-icons/md'

import ActionCard from '../../../components/Cards/ActionCard'
import Heading from '../../../components/Texts/Heading'
import { styled } from '../../../styles'

const Wrapper = styled('div', {
  padding: '$4',
})

const AlertBox = styled('div', {
  padding: '$5',
  border: `0.06rem solid $colors$borderColor`,
  borderRadius: '0.25rem',
  marginBottom: '$5',
  marginTop: '$5',
  display: 'flex',
  flowDirection: 'row',
})

const UpgradeAction = styled('div', {
  marginLeft: 'auto',
  float: 'right',
  color: '$primarySubtle',
  cursor: 'pointer',
})

const AlertIcon = styled('div', {
  marginRight: '$5',
  color: '$warn',
})

const items = [
  {
    label: 'setting:menu.languageTimezone',
    icon: <MdLanguage />,
    path: '/contact?tab=regionLanguage',
  },
]

AlertBox.displayName = 'AlertBox'
UpgradeAction.displayName = 'UpgradeAction'
AlertIcon.displayName = 'AlertIcon'

const SiteSetting = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Wrapper>
      <Heading size="medium">{t('setting:pageTitle')}</Heading>
      <AlertBox>
        <AlertIcon>
          <IoIosInformationCircle />
        </AlertIcon>

        {t('setting:freeAlert')}
        <UpgradeAction
          onClick={() => {
            navigate('/subscription')
          }}
        >
          {t('setting:upgrade')}
        </UpgradeAction>
      </AlertBox>

      <ActionCard items={items} />
    </Wrapper>
  )
}

export default SiteSetting
