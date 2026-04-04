import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import useSchoolData from '@/hooks/useSchoolData'
import AddSchoolModal, {
  AddSchoolModalHandle,
} from '@/pages/School/CreateSchoolModal'
import { School } from '@/types/school'

import SelectDefault from './Select'

const SchoolSelector = () => {
  const { schoolData, setCurrentSchool } = useSchoolData()
  const { t } = useTranslation()
  const addSchoolModalHandle = useRef<AddSchoolModalHandle>(null)
  const navigate = useNavigate()
  const openModal = () => {
    addSchoolModalHandle.current?.handleOpenChange?.()
  }

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
      if (value === 'addNewSchool') {
        openModal()
      } else {
        setCurrentSchool(value)
        navigate('/dashboard')
      }
    },
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
