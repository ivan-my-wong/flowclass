import { useCallback, useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

import BoxWithToggleGroup from '@/components/ToggleGroup/BoxWithToggleGroup'

import Embed from '../Embed'
import DomainSetting from '../Setting/Site/DomainSetting'

enum SchoolSettingsSections {
  DOMAIN = 'domain',
  ADD_TO_WEBSITE = 'addToWebsite',
}
// Add school settings sections here

const SchoolSettings = ({
  tabName,
  allSaveMethods,
}: {
  tabName: string
  allSaveMethods: (tabName: string, saveMethod: () => Promise<void>) => void
}): React.ReactElement => {
  const { t } = useTranslation()
  const [currentSection, setCurrentSection] = useState(
    SchoolSettingsSections.DOMAIN // Set initial section
  )

  const handleSaveAll = useCallback(async () => {
    switch (currentSection) {
      // Add cases for each section to handle saving
      default:
        break
    }
  }, [currentSection])

  useEffect(() => {
    allSaveMethods(tabName, handleSaveAll)
  }, [allSaveMethods, tabName, handleSaveAll])

  return (
    <div id={tabName}>
      <BoxWithToggleGroup
        title={t('school:tabBar.settings')}
        toggleGroupLabels={[
          {
            label: t('setting:customizeSite.title'),
            value: SchoolSettingsSections.DOMAIN,
          },
          {
            label: t('embed:websiteIntegration.title'),
            value: SchoolSettingsSections.ADD_TO_WEBSITE,
          },
        ]}
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
      >
        {currentSection === SchoolSettingsSections.DOMAIN && (
          <DomainSetting tabName={tabName} allSaveMethods={allSaveMethods} />
        )}
        {currentSection === SchoolSettingsSections.ADD_TO_WEBSITE && <Embed />}
      </BoxWithToggleGroup>
    </div>
  )
}

export default SchoolSettings
