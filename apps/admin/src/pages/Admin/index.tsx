import { useState } from 'react'

import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import { TabData } from '@/components/TabWithListAndButton/TabWithListAndButton'
import BoxWithToggleGroup from '@/components/ToggleGroup/BoxWithToggleGroup'
import Box from '@/components/ui/Box'
import ContentLayout from '@/layouts/ContentLayout'

import ChangeUserPassword from './ChangeUserPassword'
import CreateLoginToken from './CreateLoginToken'
import CreateStripeAccount from './CreateStripeAccount'
import DuplicateSchool from './DuplicateSchool'
import SendWhatsappMessage from './SendWhatsappMessage'
import SitesFeatureEnabled from './SitesFeatureEnabled'

const AdminPage = (): JSX.Element => {
  type AdminTabs =
    | 'createStripeAccount'
    | 'createLoginToken'
    | 'sendWtsMsg'
    | 'duplicateSchool'
    | 'changeUserPassword'
    | 'siteFeatureEnabled'

  const [currentTab, setCurrentTab] = useState<AdminTabs>('createStripeAccount')
  const headerBackButton: HeaderBackButtonStatus = {
    title: 'admin',
    mode: 'add',
  }

  const adminTabsData: TabData[] = [
    {
      label: 'Create Stripe Account',
      value: 'createStripeAccount',
    },
    {
      label: 'Change User Password',
      value: 'changeUserPassword',
    },
    {
      label: 'Create Login Token',
      value: 'createLoginToken',
    },
    {
      label: 'Send Whatsapp Message',
      value: 'sendWtsMsg',
    },
    {
      label: 'Duplicate School',
      value: 'duplicateSchool',
    },
    {
      label: 'Sites Feature',
      value: 'siteFeatureEnabled',
    },
  ]

  return (
    <ContentLayout headerBackButton={headerBackButton}>
      <Box direction="col" padding="lg" justify="start" align="start">
        <BoxWithToggleGroup
          toggleGroupLabels={adminTabsData}
          currentSection={currentTab}
          setCurrentSection={setCurrentTab}
          title="Admin"
        >
          {currentTab === 'createStripeAccount' && <CreateStripeAccount />}
          {currentTab === 'changeUserPassword' && <ChangeUserPassword />}
          {currentTab === 'createLoginToken' && <CreateLoginToken />}
          {currentTab === 'sendWtsMsg' && <SendWhatsappMessage />}
          {currentTab === 'duplicateSchool' && <DuplicateSchool />}
          {currentTab === 'siteFeatureEnabled' && <SitesFeatureEnabled />}
        </BoxWithToggleGroup>
      </Box>
    </ContentLayout>
  )
}

export default AdminPage
