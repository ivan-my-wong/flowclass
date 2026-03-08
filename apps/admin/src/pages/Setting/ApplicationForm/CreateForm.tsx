import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import Box from '@/components/Containers/Box'
import Drawer from '@/components/Drawer/Drawer'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import { Button } from '@/components/ui/Button'
import useApplicationFormData from '@/hooks/useApplicationFormData'
import useSchoolData from '@/hooks/useSchoolData'
import ContentLayout from '@/layouts/ContentLayout'
import { informationFieldState } from '@/stores/informationFieldData'
import { InformationFieldTypes } from '@/types/applicationForm'
import { validateInputLength } from '@/utils/validate'

import Content from './Content'

const CreateForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState<boolean>(true)
  const [informationFieldData] = useRecoilState(informationFieldState)
  const { useCreateApplicationForm, useFetchAllApplicationFormData } =
    useApplicationFormData()
  const fetchApplicationFormResult = useFetchAllApplicationFormData()
  const { refetch } = fetchApplicationFormResult
  const createForm = useCreateApplicationForm()
  const { schoolData } = useSchoolData()
  const currentInstitutionId = schoolData.currentSchool?.id || 0
  const [name, setName] = useState<string>()
  const [description, setDescription] = useState<string>()
  const [fields, setFields] = useState<InformationFieldTypes[]>()
  const [isValidQuestion, setIsValidQuestion] = useState<boolean>(false)
  useEffect(() => {
    if (informationFieldData.informationFields) {
      setFields(
        informationFieldData.informationFields
          .filter(field => typeof field.order === 'number' && field.isDefault)
          .sort((a, b) => a.order - b.order)
      )
    }
  }, [informationFieldData.informationFields])
  const handleQuestionChange = (value: string) => {
    if (validateInputLength(value, 200)) {
      setIsValidQuestion(true)
    } else {
      setIsValidQuestion(false)
    }
    setName(value)
  }

  const handleClose = () => {
    setIsOpen(false)
    navigate('/settings/application-form')
  }

  const handleCloseAndRemoveData = () => {
    setName('')
    setDescription('')
    setIsValidQuestion(false)
    setFields([])
    handleClose()
  }

  const headerBackButton: HeaderBackButtonStatus = {
    mode: 'cross',
    action: () => {
      handleCloseAndRemoveData()
    },
  }

  const leftHeaderContent = (
    <Box css={{ fontSize: '$6' }}>
      {t('setting:applicationForm.applicationForm')}
    </Box>
  )

  const rightHeaderContent = (
    <Button
      disabled={!isValidQuestion || !fields || fields?.length === 0}
      onClick={() => handleCreate()}
    >
      {t('setting:applicationForm.save')}
    </Button>
  )
  const handleCreate = () => {
    const fieldsList =
      fields?.map(field => {
        if (field.id) return `${field.flag || 'applicant'}.${field.id}`
        return `${field.flag}.0`
      }) || []

    createForm
      .mutateAsync({
        institutionId: currentInstitutionId,
        fields: fieldsList,
        name,
        description,
      })
      .then(() => {
        handleCloseAndRemoveData()
        refetch()
      })
  }
  return (
    <Drawer open={isOpen}>
      <ContentLayout
        headerBackButton={headerBackButton}
        leftHeader={leftHeaderContent}
        rightHeader={rightHeaderContent}
      >
        <Content
          fields={fields || []}
          setFields={setFields}
          setName={handleQuestionChange}
          description={description}
          setDescription={setDescription}
          name={name}
        />
      </ContentLayout>
    </Drawer>
  )
}

export default CreateForm
