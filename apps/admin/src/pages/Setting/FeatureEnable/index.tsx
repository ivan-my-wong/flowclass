import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { BsDoorClosed } from 'react-icons/bs'
import { LuCreditCard, LuFileText } from 'react-icons/lu'
import { MdOutlineMailOutline } from 'react-icons/md'

import BoxWithToggleGroup from '@/components/ToggleGroup/BoxWithToggleGroup'

import CreditSystem from './CreditSystem'
import EmailSetting from './EmailSetting'
import StudentPortalSetting from './StudentPortalSetting'
import TextVersionSetting from './TextVersionSetting'

enum FeatureSections {
  EMAIL_NOTIFICATION = 'emailNotification',
  STUDENT_PORTAL = 'studentPortal',
  TEXT_VERSION = 'textVersion',
  CREDIT_SYSTEM = 'creditSystem',
}

const FeatureEnable = (): JSX.Element => {
  const { t } = useTranslation()
  const [currentSection, setCurrentSection] = useState(
    FeatureSections.EMAIL_NOTIFICATION
  )

  return (
    <div className="box-row">
      <BoxWithToggleGroup
        title={t('setting:featureEnable.title')}
        toggleGroupLabels={[
          {
            label: t(`setting:emailLogoSetting.emailNotification`),
            value: FeatureSections.EMAIL_NOTIFICATION,
            icon: <MdOutlineMailOutline size={16} />,
          },
          {
            label: t(`setting:studentPortal.title`),
            value: FeatureSections.STUDENT_PORTAL,
            icon: <BsDoorClosed size={16} />,
          },
          {
            label: t(`setting:textVersion.title`),
            value: FeatureSections.TEXT_VERSION,
            icon: <LuFileText size={16} />,
          },
          {
            label: t(`setting:creditSystem.title`),
            value: FeatureSections.CREDIT_SYSTEM,
            icon: <LuCreditCard size={16} />,
          },
        ]}
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
      >
        {currentSection === FeatureSections.EMAIL_NOTIFICATION && (
          <EmailSetting tabName="email" />
        )}
        {currentSection === FeatureSections.STUDENT_PORTAL && (
          <StudentPortalSetting />
        )}
        {currentSection === FeatureSections.TEXT_VERSION && (
          <TextVersionSetting />
        )}
        {currentSection === FeatureSections.CREDIT_SYSTEM && <CreditSystem />}
      </BoxWithToggleGroup>
    </div>
  )
}

export default FeatureEnable
