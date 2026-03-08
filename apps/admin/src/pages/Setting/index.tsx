import { useTranslation } from 'react-i18next'
import { IoIosInformationCircle } from 'react-icons/io'
import { useRecoilValue } from 'recoil'

import AlertBox from '@/components/Boxes/AlertBox'
import ActionBox from '@/components/Cards/ActionCard'
import Box from '@/components/Containers/Box'
// import { cardItems } from '@/components/Card'
import Heading from '@/components/Texts/Heading'
import { schoolSubscriptionState } from '@/stores/schoolSubscriptionData'

// import ListBlockTime from './component/ListBlockTime'
import { cardItems, SettingCategory } from './SettingsCard'

const cardItemsWebsiteConfig = cardItems.filter(
  item => item.category === SettingCategory.Website
)
// const cardItemsPayments = cardItems.filter(
//   item => item.category === SettingCategory.Payment
// )
// const cardItemsCommunication = cardItems.filter(
//   item => item.category === SettingCategory.Communication
// )

const cardItemsEnrollmentForm = cardItems.filter(
  item => item.category === SettingCategory.EnrollmentForm
)
// const cardItemsMonetization = cardItems.filter(
//   item => item.category === SettingCategory.Service
// )

const Setting = (): JSX.Element => {
  const { t } = useTranslation()
  const { activePlan } = useRecoilValue(schoolSubscriptionState)

  // const navigate = useNavigate()
  return (
    <Box padding="medium" direction="column">
      <AlertBox
        icon={<IoIosInformationCircle />}
        content={
          activePlan && activePlan.planIds && activePlan.planIds.length > 0
            ? `${t('subscription:alertBox.currently')} ${t(
                `subscription:title.${activePlan.customerSupportTier}`
              )}`
            : t('setting:freeAlert')
        }
        actionText={t('setting:upgrade') as string}
        actionLink="/subscription/create-subscription"
      />
      {/* <Heading size="smallMedium">
        {t('setting:headings.firstTimeConfig')}
      </Heading>
      <ActionBox grid items={cardItemsFirstTimeconfig} /> */}

      {/* Enrollment Form Heading */}
      <Heading size="smallMedium">{t('setting:enrollmentForm')}</Heading>
      <ActionBox grid items={cardItemsEnrollmentForm} />

      {/* Website Configuration Heading */}
      <Heading size="smallMedium">{t('setting:headings.branding')}</Heading>
      <ActionBox grid items={cardItemsWebsiteConfig} />

      {/* Communication & Engagement Heading */}
      {/* <Heading size="smallMedium">
        {t('setting:headings.communicationEngagement')}
      </Heading>
      <ActionBox grid items={cardItemsCommunication} /> */}
    </Box>
  )
}

export default Setting
