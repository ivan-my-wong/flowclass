import { useTranslation } from 'react-i18next'

import coursePageExample from '@/assets/onboarding/course_page_example.png'
import notificationSettingImage from '@/assets/onboarding/notification_settings.png'
import paymentPageImage from '@/assets/onboarding/payments.png'
import studentCRMImage from '@/assets/onboarding/student_crm.png'
import ImageAspect from '@/components/Images/ImageAspect'
import Heading from '@/components/Texts/Heading'

const wrapperClassNames =
  'flex w-full flex-col justify-start overflow-x-hidden gap-2'

export const FlowclassUseCaseImagesGuide = (): React.ReactElement => {
  const { t } = useTranslation()
  return (
    <div className={wrapperClassNames}>
      <Heading align="left" size="smallMedium">
        {t('onboarding:newUserSetup.useCase.createNewCourse')}
      </Heading>

      <ImageAspect
        width="120%"
        ratio={1.41 / 1}
        src={coursePageExample}
        alt="Course Page"
        objectFit="contain"
      />
    </div>
  )
}

export const SchoolSiteDomainImagesGuide = (): React.ReactElement => {
  const { t } = useTranslation()
  return (
    <div className={wrapperClassNames}>
      <Heading align="left" css={{ lineHeight: 1.3 }} size="smallMedium">
        {t('onboarding:newUserSetup.useCase.allInOne')}
      </Heading>

      <ImageAspect
        width="120%"
        ratio={1.41 / 1}
        src={studentCRMImage}
        alt="School Website"
        objectFit="contain"
      />
    </div>
  )
}
export const PaymentMethodImagesGuide = (): React.ReactElement => {
  const { t } = useTranslation()
  return (
    <div className={wrapperClassNames}>
      <Heading align="left" css={{ lineHeight: 1.3 }} size="smallMedium">
        {t('onboarding:newUserSetup.setUpAndStart')}
      </Heading>

      <ImageAspect
        width="120%"
        // height="100vh"
        ratio={1.41 / 1}
        src={paymentPageImage}
        alt="Payment Methods"
        objectFit="contain"
      />
    </div>
  )
}

export const PaymentNotificationImagesGuide = (): React.ReactElement => {
  const { t } = useTranslation()
  return (
    <div className={wrapperClassNames}>
      <Heading align="left" css={{ lineHeight: 1.3 }} size="smallMedium">
        {t('onboarding:newUserSetup.autoNotification')}
      </Heading>

      <ImageAspect
        width="120%"
        // height="100vh"
        ratio={1.41 / 1}
        src={notificationSettingImage}
        alt="Notification setting"
        objectFit="contain"
      />
    </div>
  )
}

export const UploadCSVSectionImagesGuide = (): React.ReactElement => {
  const { t } = useTranslation()
  return (
    <div className={wrapperClassNames}>
      <Heading align="left" css={{ lineHeight: 1.3 }} size="smallMedium">
        {t('onboarding:newUserSetup.uploadStudentInfo')}
      </Heading>

      <ImageAspect
        width="120%"
        // height="100vh"
        ratio={1.41 / 1}
        src={studentCRMImage}
        alt="Student CRM"
        objectFit="contain"
      />
    </div>
  )
}
