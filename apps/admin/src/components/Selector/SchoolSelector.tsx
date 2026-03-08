import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import useSchoolData from '@/hooks/useSchoolData'
import AddSchoolModal, {
  AddSchoolModalHandle,
} from '@/pages/School/CreateSchoolModal'
import { School } from '@/types/school'

import SelectDefault from './Select'

const SchoolSelector = ({
  triggerVariant,
}: {
  triggerVariant: 'compact' | 'fullWidth'
}) => {
  const { schoolData, setCurrentSchool } = useSchoolData()
  const { t } = useTranslation()
  const addSchoolModalHandle = useRef<AddSchoolModalHandle>(null)

  const navigate = useNavigate()
  const openModal = () => {
    addSchoolModalHandle.current?.handleOpenChange?.()
  }

  const shouldCheckCreateNewSchool = true

  // To be added later hen e support multiple schools. Currently only one schools on release.

  // if (!schoolData.schools.length) {
  //   return (
  //     <>
  //       <Text
  //         css={{ width: '100%' }}
  //         onClick={(event: React.FormEvent) => {
  //           openModal()
  //           event.stopPropagation()
  //         }}
  //       >
  //         {t(`school:addSchoolModalTitle`)}
  //       </Text>
  //       <AddSchoolModal ref={addSchoolModalHandle} hidden />
  //     </>
  //   )
  // }

  const tabSelectProps = {
    placeholder: t('component:select.placeholder'),
    selectItems: [
      {
        group: t('component:select.selectSchool'),
        itemValues: [
          ...schoolData.schools.map((school: School) => ({
            label: school.name,
            value: school.id.toString(),
          })),
        ],
      },
      // {
      //   group: t('component:select.createSchool'),
      //   itemValues: [
      //     {
      //       label: t('component:select.addSchool'),
      //       value: 'addNewSchool',
      //     },
      //   ],
      // },
    ],
    currentSelect: schoolData.currentSchool?.id.toString() || '',
    onValueChange: (value: string) => {
      if (value === 'addNewSchool' && !shouldCheckCreateNewSchool) {
        setShowSubscriptionPopup({
          open: true,
          message: t('subscription:subscriptionDialog.upgradePlan'),
        })
        return
      }
      if (value === 'addNewSchool') {
        openModal()
      } else {
        setCurrentSchool(value)
        navigate('/dashboard')
      }
    },
  }

  if (triggerVariant === 'fullWidth') {
    return (
      <>
        <SelectDefault
          fullWidth
          placeholder={tabSelectProps.placeholder}
          selectItems={tabSelectProps.selectItems}
          currentSelect={tabSelectProps.currentSelect}
          onValueChange={tabSelectProps.onValueChange}
        />
        <AddSchoolModal ref={addSchoolModalHandle} hidden />
      </>
    )
  }

  return (
    <>
      <SelectDefault
        triggerVariant="compact"
        placeholder={tabSelectProps.placeholder}
        selectItems={tabSelectProps.selectItems}
        currentSelect={tabSelectProps.currentSelect}
        onValueChange={tabSelectProps.onValueChange}
      />
      <AddSchoolModal ref={addSchoolModalHandle} hidden />
    </>
  )
}

export default SchoolSelector
