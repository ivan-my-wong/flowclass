import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { BsDoorClosed } from 'react-icons/bs'
import { LuCreditCard, LuFileText } from 'react-icons/lu'
import { MdOutlineMailOutline } from 'react-icons/md'

import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import BoxWithToggleGroup from '@/components/ToggleGroup/BoxWithToggleGroup'
import useCheckPermissionAndQuota from '@/hooks/useCheckPermissionAndQuota'
import { FeatureEnableEnum } from '@/types/feature-enable'

import CreditSystem from './CreditSystem'
import EmailSetting from './EmailSetting'
import IntegrationsSetting from './IntegrationsSetting'
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
  const { isLoadingPermissionAndQuota, checkPermission } =
    useCheckPermissionAndQuota()
  const isStudentPortalAllowed = checkPermission(
    FeatureEnableEnum.STUDENT_PORTAL,
    ''
  )
  const isTextVersionAllowed = checkPermission(
    FeatureEnableEnum.TEXT_VERSION,
    ''
  )
  const isCreditSystemAllowed = checkPermission(
    FeatureEnableEnum.CREDIT_SYSTEM,
    ''
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
          <>
            {isLoadingPermissionAndQuota ? (
              <FullScreenLoading />
            ) : (
              <>
                {isStudentPortalAllowed ? (
                  <StudentPortalSetting />
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    {t('common:noActiveSubscription')}
                  </div>
                )}
              </>
            )}
          </>
        )}
        {currentSection === FeatureSections.INTEGRATIONS && (
          <IntegrationsSetting />
        )}
        {currentSection === FeatureSections.CREDIT_SYSTEM && (
          <>
            {isLoadingPermissionAndQuota ? (
              <FullScreenLoading />
            ) : (
              <>
                {isCreditSystemAllowed ? (
                  <CreditSystem />
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    {t('common:noActiveSubscription')}
                  </div>
                )}
              </>
            )}
          </>
        )}
        {currentSection === FeatureSections.CREDIT_SYSTEM && <CreditSystem />}
      </BoxWithToggleGroup>
    </div>
  )
}

export default FeatureEnable
