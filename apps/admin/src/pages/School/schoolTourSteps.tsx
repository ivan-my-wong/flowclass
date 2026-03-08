import { StepType } from '@reactour/tour'
import { t } from 'i18next'
import { IoMdFlag } from 'react-icons/io'

import congratulationImage from '../../assets/tour/school/congratulation.gif'
import courseAddressImage from '../../assets/tour/school/courseAddress.gif'
import courseContactImage from '../../assets/tour/school/courseContact.gif'
import descriptionEditorImage from '../../assets/tour/school/descriptionEditor.gif'
import descriptionLabelImage from '../../assets/tour/school/descriptionLabel.gif'
import galleryLabelImage from '../../assets/tour/school/galleryLabel.gif'
import galleryPictureImage from '../../assets/tour/school/galleryPicture.gif'
import schoolBannerImage from '../../assets/tour/school/schoolBanner.gif'
import schoolLogoImage from '../../assets/tour/school/schoolLogo.gif'
import schoolNameImage from '../../assets/tour/school/schoolName.gif'
import Text from '../../components/Texts/Text'
import TourContent from '../../components/Tour/TourContent'

export const getBasicTourSteps = (): StepType[] => {
  return [
    {
      selector: '.schoolNameText',
      highlightedSelectors: ['.schoolNameTextInput', '.schoolNameTitle'],
      content: (
        <TourContent
          imageSrc={schoolNameImage}
          imageAlt="schoolNameImage"
          text={t('school:tourStep.name')}
        />
      ),
    },
    {
      selector: '#schoolLogoBox',
      content: (
        <TourContent
          imageSrc={schoolLogoImage}
          imageAlt="schoolLogoImage"
          text={t('school:tourStep.logo')}
        />
      ),
    },
    {
      selector: '#bannerImage',
      content: (
        <TourContent
          imageSrc={schoolBannerImage}
          imageAlt="schoolBannerImage"
          text={t('school:tourStep.banner')}
        />
      ),
    },
  ]
}

export const getDescriptionTourSteps = (): StepType[] => {
  return [
    {
      selector: '#leftColumn',
      content: (
        <TourContent
          imageSrc={descriptionLabelImage}
          imageAlt="descriptionLabelImage"
          text={[
            t('school:tourStep.descriptionSection'),
            t('school:tourStep.descriptionSection2'),
          ]}
        />
      ),
    },
    {
      selector: '#textEditor',
      content: (
        <TourContent
          imageSrc={descriptionEditorImage}
          imageAlt="descriptionEditorImage"
          text={t('school:tourStep.textEditor')}
        />
      ),
    },
  ]
}

export const getContactTourSteps = (): StepType[] => {
  return [
    {
      selector: '#contactInformationBox',
      content: (
        <TourContent
          imageSrc={courseContactImage}
          imageAlt="courseContactImage"
          text={[t('school:tourStep.contact'), t('school:tourStep.contact2')]}
        />
      ),
    },
    {
      selector: '#addressBox',
      content: (
        <TourContent
          imageSrc={courseAddressImage}
          imageAlt="courseAddressImage"
          text={[t('school:tourStep.address'), t('school:tourStep.address2')]}
        />
      ),
    },
  ]
}

export const getGalleryTourSteps = (): StepType[] => {
  return [
    {
      selector: '#leftColumn',
      content: (
        <TourContent
          imageSrc={galleryLabelImage}
          imageAlt="galleryLabelImage"
          text={t('school:tourStep.galleryColumn')}
        />
      ),
    },
    {
      selector: '#galleryBox',
      content: (
        <TourContent
          imageSrc={galleryPictureImage}
          imageAlt="galleryPictureImage"
          text={t('school:tourStep.galleryBox')}
        />
      ),
    },
  ]
}

const getStartTourSteps = (openFloatingButton: () => void): StepType[] => {
  return [
    {
      selector: 'root',
      position: 'center',
      content: (
        <TourContent
          customContent={
            <>
              <Text>🎉🎉{t('school:tourStep.welcome')}🎊🎊</Text>
              <Text>{t('school:tourStep.welcomeContent')}</Text>
            </>
          }
        />
      ),
    },
    {
      selector: '#tourGuide',
      content: (
        <TourContent
          customContent={
            <>
              <Text>
                {t('school:tourStep.clickGuide')} <IoMdFlag />{' '}
                {t('school:tourStep.clickGuideContent')}
              </Text>
            </>
          }
        />
      ),
      actionAfter: () => {
        openFloatingButton()
      },
    },
    {
      selector: '#floating-button',
      content: <TourContent text={t('school:tourStep.floatingButton')} />,
    },
    {
      selector: '#floating-content',
      content: <TourContent text={t('school:tourStep.floatingContent')} />,
      actionAfter: () => {
        openFloatingButton()
      },
    },
  ]
}

const getFinishTourSteps = (): StepType[] => {
  return [
    {
      selector: 'root',
      position: 'center',
      content: (
        <TourContent
          imageSrc={congratulationImage}
          imageAlt="congratulationImage"
          customContent={
            <>
              <Text>🎉🎉{t('school:tourStep.congratulations')}🎊🎊</Text>
              <Text>{t('school:tourStep.congratulationsContent')}</Text>
            </>
          }
        />
      ),
    },
    {
      selector: '#tourGuide',
      content: (
        <TourContent
          customContent={
            <>
              <Text>
                <Text>{t('school:tourStep.clickGuide')}</Text> <IoMdFlag />
                {t('school:tourStep.clickGuideContent')}
              </Text>
            </>
          }
        />
      ),
    },
  ]
}

// root step because it gave time for the page to load
// if the tour starts from different tab
// the page will not load fast enough to for selector to find the element
// so an extra step is needed to wait for the page to load
const switchToDescriptionTab = (
  action: (tabValue: string) => void
): StepType[] => {
  return [
    {
      selector: 'root',
      position: 'center',
      content: <TourContent text={t('school:tourStep.descriptionTab')} />,
      action: () => {
        action('description')
      },
    },
  ]
}

const switchToContactTab = (action: (tabValue: string) => void): StepType[] => {
  return [
    {
      selector: 'root',
      position: 'center',
      content: <TourContent text={t('school:tourStep.contactTab')} />,
      action: () => {
        action('contact')
      },
    },
  ]
}

const switchToGalleryTab = (action: (tabValue: string) => void): StepType[] => {
  return [
    {
      selector: 'root',
      position: 'center',
      content: <TourContent text={t('school:tourStep.galleryTab')} />,
      action: () => {
        action('gallery')
      },
    },
  ]
}

export const getFullSchoolTourSteps = (
  changeTab: (tabValue: string) => void,
  openFloatingButton: () => void
): StepType[] => {
  return [
    ...getStartTourSteps(openFloatingButton),
    ...getBasicTourSteps(),
    ...switchToDescriptionTab(changeTab),
    ...getDescriptionTourSteps(),
    ...switchToContactTab(changeTab),
    ...getContactTourSteps(),
    ...switchToGalleryTab(changeTab),
    ...getGalleryTourSteps(),
    ...getFinishTourSteps(),
  ]
}
