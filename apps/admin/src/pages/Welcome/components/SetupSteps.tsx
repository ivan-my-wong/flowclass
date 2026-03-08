import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import CheckboxCardGroup, {
  CheckboxCardOptionProps,
} from '@/components/Checkbox/CheckboxCardGroup'
import RadioCardGroup from '@/components/RadioGroup/RadioCardGroup'
import welcomeOptions from '@/constants/onboarding/welcomeOptions'

const SetupSteps = (): Record<
  string,
  {
    title: string
    subtitle: string
    content: JSX.Element
  }
> => {
  const { t } = useTranslation()
  const {
    userTypeOptions,
    numOfStudentOptions,
    defaultTeachingLocationOptions,
    defaultPromotionMethodOptions,
    defaultTeachTargetOptions,
    defaultTeachCategoriesOptions,
  } = welcomeOptions(t)
  const [selectedUserType, setSelectedUserType] = useState<string>('')

  const [selectedNumOfStudent, setSelectedNumOfStudent] = useState<string>('')
  const [teachingLocationOptions, setTeachingLocationOptions] = useState<
    CheckboxCardOptionProps[]
  >(defaultTeachingLocationOptions)

  const handleTeachingLocationOptionChange = (
    value: boolean,
    optionId: string
  ) => {
    setTeachingLocationOptions(prevOptions =>
      prevOptions.map(option => {
        if (option.id === optionId) {
          return { ...option, value }
        }
        return option
      })
    )
  }

  const [promotionMethodOptions, setPromotionMethodOptions] = useState<
    CheckboxCardOptionProps[]
  >(defaultPromotionMethodOptions)

  const handlePromotionMethodOptionChange = (
    value: boolean,
    optionId: string
  ) => {
    setPromotionMethodOptions(prevOptions =>
      prevOptions.map(option => {
        if (option.id === optionId) {
          return { ...option, value }
        }
        return option
      })
    )
  }

  const teachingServiceSection = {
    title: t('onboarding:newUserSetup.teachingService.title'),
    subtitle: t('onboarding:newUserSetup.selectMultipleOptions'),
    content: (
      <CheckboxCardGroup
        items={teachingLocationOptions}
        handleValueChange={(c, id) => {
          handleTeachingLocationOptionChange(c, id)
        }}
      />
    ),
  }
  const [teachTargetOptions, setTeachTargetOptions] = useState<
    CheckboxCardOptionProps[]
  >(defaultTeachTargetOptions)

  const handleTeachTargetOptionChange = (value: boolean, optionId: string) => {
    setTeachTargetOptions(prevOptions =>
      prevOptions.map(option => {
        if (option.id === optionId) {
          return { ...option, value }
        }
        return option
      })
    )
  }

  const teachingBusinessIdentitySection = {
    title: t('onboarding:newUserSetup.teachingDescribe'),
    subtitle: t('onboarding:newUserSetup.teachingDescribe'),
    content: (
      <RadioCardGroup
        items={userTypeOptions}
        selectedValue={selectedUserType}
        handleValueChange={(value: string) => setSelectedUserType(value)}
      />
    ),
  }

  const schoolScaleSection = {
    title: t('onboarding:newUserSetup.numOfStudent.title'),
    subtitle: t('onboarding:newUserSetup.numOfStudent.subtitle'),
    content: (
      <RadioCardGroup
        items={numOfStudentOptions}
        selectedValue={selectedNumOfStudent}
        handleValueChange={(value: string) => setSelectedNumOfStudent(value)}
      />
    ),
  }

  const promoteMethodSection = {
    title: t('onboarding:newUserSetup.promoteMethod.title'),
    subtitle: t('onboarding:newUserSetup.selectMultipleOptions'),
    content: (
      <CheckboxCardGroup
        items={promotionMethodOptions}
        handleValueChange={(c, id) => {
          handlePromotionMethodOptionChange(c, id)
        }}
      />
    ),
  }

  const teachTargetSection = {
    title: t('onboarding:newUserSetup.teachTarget.title'),
    subtitle: t('onboarding:newUserSetup.selectMultipleOptions'),
    content: (
      <CheckboxCardGroup
        items={teachTargetOptions}
        handleValueChange={(c, id) => {
          handleTeachTargetOptionChange(c, id)
        }}
      />
    ),
  }
  const [teachCategoryOptions, setTeachCategoryOptions] = useState<
    CheckboxCardOptionProps[]
  >(defaultTeachCategoriesOptions)

  const handleTeachCategoryOptionChange = (
    value: boolean,
    optionId: string
  ) => {
    setTeachCategoryOptions(prevOptions =>
      prevOptions.map(option => {
        if (option.id === optionId) {
          return { ...option, value }
        }
        return option
      })
    )
  }

  const teachCategorySection = {
    title: t('onboarding:newUserSetup.teachCategory.title'),
    subtitle: t('onboarding:newUserSetup.selectMultipleOptions'),
    content: (
      <CheckboxCardGroup
        items={teachCategoryOptions}
        handleValueChange={(c, id) => {
          handleTeachCategoryOptionChange(c, id)
        }}
      />
    ),
  }

  return {
    teachingBusinessIdentitySection,
    schoolScaleSection,
    promoteMethodSection,
    teachTargetSection,
    teachCategorySection,
  }
}

export default SetupSteps
