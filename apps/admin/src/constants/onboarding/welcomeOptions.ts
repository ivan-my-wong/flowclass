import { TFunction } from 'i18next'

import click from '@/assets/onboarding/click.png'
import clickAnimation from '@/assets/onboarding/click_animation.gif'
import differentBillingDate from '@/assets/onboarding/different_billing_date.png'
import rightArrow from '@/assets/onboarding/right_arrow.png'
import rightArrowAnimation from '@/assets/onboarding/right_arrow_animation.gif'
import sameBillingDate from '@/assets/onboarding/same_billing_date.png'

import { SocialMedia } from '../socialMedia'

const welcomeOptions = (t: TFunction): Record<string, any> => {
  const onboardingPreferenceOptions = [
    {
      value: 'completeNow',
      id: '1',
      label: t('onboarding:newUserSetup.onboardingPreference.completeNow'),
      description: t(
        'onboarding:newUserSetup.onboardingPreference.completeDesc'
      ),
      imageUrl: click,
      gifUrl: clickAnimation,
      className:
        'rounded-lg justify-center shadow-md bg-white hover:bg-primary/10',
    },
    // {
    //   value: 'scheduleLater',
    //   id: '2',
    //   label: t('onboarding:newUserSetup.onboardingPreference.scheduleLater'),
    //   description: t(
    //     'onboarding:newUserSetup.onboardingPreference.scheduleDesc'
    //   ),
    //   imageUrl: rightArrow,
    //   gifUrl: rightArrowAnimation,
    //   className:
    //     'lg:w-[30%] h-[380px] justify-center border-gray-200 shadow-md hover:bg-[#568BF01A]',
    // },
  ]
  const userTypeOptions = [
    {
      value: 'beginner',
      id: '1',
      label: t('onboarding:newUserSetup.starting'),
    },
    {
      value: 'individual',
      id: '2',
      label: t('onboarding:newUserSetup.individual'),
    },
    {
      value: 'teacher',
      id: '3',
      label: t('onboarding:newUserSetup.teacher'),
    },
    {
      value: 'owner',
      id: '4',
      label: t('onboarding:newUserSetup.owner'),
    },
  ]

  const numOfStudentOptions = [
    {
      id: 'not_started',
      value: 'notStarted',
      label: t('onboarding:newUserSetup.numOfStudent:choice1'),
    },
    {
      id: '1-10',
      value: '1-10',
      label: t('onboarding:newUserSetup.numOfStudent:choice2'),
    },
    {
      id: '11-100',
      value: '11-100',
      label: t('onboarding:newUserSetup.numOfStudent:choice3'),
    },
    {
      id: '101-1000',
      value: '101-1000',
      label: t('onboarding:newUserSetup.numOfStudent:choice4'),
    },
    {
      id: '1000-10000',
      value: '1000-10000',
      label: t('onboarding:newUserSetup.numOfStudent:choice5'),
    },
    {
      id: '10000+',
      value: '10000+',
      label: t('onboarding:newUserSetup.numOfStudent:choice6'),
    },
    {
      id: 'numOfStudent:choice7',
      value: 'unsure',
      label: t('onboarding:newUserSetup.numOfStudent:choice7'),
    },
  ]

  const defaultTeachingLocationOptions = [
    {
      value: false,
      id: 'online',
      label: t('onboarding:newUserSetup.teachingService.option1'),
    },
    {
      value: false,
      id: 'studentsVenue',
      label: t('onboarding:newUserSetup.teachingService.option2'),
    },
    {
      value: false,
      id: 'coworkingSpace',
      label: t('onboarding:newUserSetup.teachingService.option3'),
    },
    {
      value: false,
      id: 'yourOwnVenue',
      label: t('onboarding:newUserSetup.teachingService.option4'),
    },
    {
      value: false,
      id: 'atSchool',
      label: t('onboarding:newUserSetup.teachingService.option5'),
    },
  ]

  const defaultPromotionMethodOptions = [
    {
      value: false,
      id: 'personalWebsite',
      label: t('onboarding:newUserSetup.promoteMethod.personalWebsite'),
    },
    {
      value: false,
      id: 'companyWebsite',
      label: t('onboarding:newUserSetup.promoteMethod.companyWebsite'),
    },
    {
      value: false,
      id: SocialMedia.Facebook,
      label: SocialMedia.Facebook,
    },
    {
      value: false,
      id: SocialMedia.Instagram,
      label: SocialMedia.Instagram,
    },
    {
      value: false,
      id: SocialMedia.Youtube,
      label: SocialMedia.Youtube,
    },
    {
      value: false,
      id: SocialMedia.X,
      label: SocialMedia.X,
    },
    {
      value: false,
      id: SocialMedia.LinkedIn,
      label: SocialMedia.LinkedIn,
    },
    {
      value: false,
      id: SocialMedia.Pinterest,
      label: SocialMedia.Pinterest,
    },
    {
      value: false,
      id: 'others',
      label: t('onboarding:newUserSetup.others'),
    },
  ]
  const defaultTeachTargetOptions = [
    {
      value: false,
      id: 'children',
      label: t('onboarding:newUserSetup.teachTarget.children'),
    },
    {
      value: false,
      id: 'uniStudent',
      label: t('onboarding:newUserSetup.teachTarget.uniStudent'),
    },
    {
      value: false,
      id: 'secondarySchool',
      label: t('onboarding:newUserSetup.teachTarget.secondarySchool'),
    },
    {
      value: false,
      id: 'adults',
      label: t('onboarding:newUserSetup.teachTarget.adults'),
    },
    {
      value: false,
      id: 'businessOrganization',
      label: t('onboarding:newUserSetup.teachTarget.businessOrganization'),
    },
    {
      value: false,
      id: 'specificNeeds',
      label: t('onboarding:newUserSetup.teachTarget.specificNeeds'),
    },
    {
      value: false,
      id: 'nonNative',
      label: t('onboarding:newUserSetup.teachTarget.nonNative'),
    },
    {
      value: false,
      id: 'generalPopulation',
      label: t('onboarding:newUserSetup.teachTarget.generalPopulation'),
    },
    {
      value: false,
      id: 'others',
      label: t('onboarding:newUserSetup.others'),
    },
  ]

  const defaultTeachCategoriesOptions = [
    {
      value: false,
      id: 'academicTutor',
      label: t('onboarding:newUserSetup.teachCategory.academicTutor'),
    },
    {
      value: false,
      id: 'testPrepare',
      label: t('onboarding:newUserSetup.teachCategory.testPrepare'),
    },
    {
      value: false,
      id: 'music',
      label: t('onboarding:newUserSetup.teachCategory.music'),
    },
    {
      value: false,
      id: 'language',
      label: t('onboarding:newUserSetup.teachCategory.language'),
    },
    {
      value: false,
      id: 'businessFinance',
      label: t('onboarding:newUserSetup.teachCategory.businessFinance'),
    },
    {
      value: false,
      id: 'creativeArts',
      label: t('onboarding:newUserSetup.teachCategory.creativeArts'),
    },
    {
      value: false,
      id: 'fitness',
      label: t('onboarding:newUserSetup.teachCategory.fitness'),
    },
    {
      value: false,
      id: 'personalSkills',
      label: t('onboarding:newUserSetup.teachCategory.personalSkills'),
    },
    {
      value: false,
      id: 'technology',
      label: t('onboarding:newUserSetup.teachCategory.technology'),
    },
    {
      value: false,
      id: 'others',
      label: t('onboarding:newUserSetup.others'),
    },
  ]

  const billDateOptions = [
    {
      value: 'sameBillingDate',
      id: '1',
      label: t('onboarding:newUserSetup.billingDateOption.same'),
      imageUrl: sameBillingDate,
    },
    {
      value: 'differentBillingDate',
      id: '2',
      label: t('onboarding:newUserSetup.billingDateOption.different'),
      imageUrl: differentBillingDate,
    },
  ]

  return {
    onboardingPreferenceOptions,
    userTypeOptions,
    numOfStudentOptions,
    defaultTeachingLocationOptions,
    defaultPromotionMethodOptions,
    defaultTeachTargetOptions,
    defaultTeachCategoriesOptions,
    billDateOptions,
  }
}

export default welcomeOptions
