import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import Button from '@/components/Buttons/Button'
import Box from '@/components/Containers/Box'
import Drawer from '@/components/Drawer/Drawer'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import useApplicationFormData from '@/hooks/useApplicationFormData'
import useSchoolData from '@/hooks/useSchoolData'
import ContentLayout from '@/layouts/ContentLayout'
import { applicationFormState } from '@/stores/applicationFormData'
import { informationFieldState } from '@/stores/informationFieldData'
import {
  FlagInformationFieldTypes,
  InformationFieldTypes,
} from '@/types/applicationForm'
import { Course } from '@/types/course'
import { validateInputLength } from '@/utils/validate'

import Content from './Content'

const EditForm = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(true)
  const [informationFieldData] = useRecoilState(informationFieldState)
  const { useFetchCurrentApplicationForm, useUpdateApplicationForm } =
    useApplicationFormData()

  const [applicationFormRecoilState] = useRecoilState(applicationFormState)
  const { schoolData } = useSchoolData()
  const currentInstitutionId = schoolData.currentSchool?.id || 0
  const [name, setName] = useState<string>()
  const [fields, setFields] = useState<InformationFieldTypes[]>()
  const [isValidQuestion, setIsValidQuestion] = useState<boolean>(true)
  const [description, setDescription] = useState<string>()
  const { currentApplicationForm } = applicationFormRecoilState

  useEffect(() => {
    if (
      informationFieldData.informationFields &&
      currentApplicationForm?.fields
    ) {
      const result = currentApplicationForm.fields
        .map(field => {
          if (typeof field === 'object') {
            if (field.isDefault) return undefined
            return field
          }
          if (!Number.isNaN(+field)) return field

          const [flag, fieldId] = field.split('.')
          const form = informationFieldData.informationFields.find(
            infoField => infoField.id === +fieldId
          )
          return {
            ...form,
            flag: [FlagInformationFieldTypes.common, 'undefined'].includes(flag)
              ? FlagInformationFieldTypes.common
              : FlagInformationFieldTypes.applicant,
          }
        })
        .filter(d => d !== undefined) as InformationFieldTypes[]

      const defaultFields: InformationFieldTypes[] = []
      const defaultFieldMappings = ['email', 'phone', 'name']

      defaultFieldMappings.forEach(mapping => {
        if (!result.find(d => d.isDefault)) {
          defaultFields.push(
            informationFieldData.informationFields.filter(
              d => d.isDefault && d.columnMapping === mapping
            )[0]
          )
        }
      })

      setFields([...defaultFields, ...result])
    }
  }, [informationFieldData, currentApplicationForm])

  const { isLoading, isError, isSuccess, isIdle } =
    useFetchCurrentApplicationForm(form => {
      // Already set inside hook
      // setApplicationFormRecoildState({
      //   ...applicationFormRecoilState,
      //   currentApplicationForm: form,
      // })
      setName(form.name)
      setFields(form.fields as InformationFieldTypes[])
      setDescription(form.description)
      // setFields(form.fields as InformationFieldTypes[])
    })

  const handleClose = () => {
    setIsOpen(false)
    navigate('/settings/application-form')
  }
  const handleCloseAndRemoveData = () => {
    setName(applicationFormRecoilState.currentApplicationForm?.name)
    setDescription(
      applicationFormRecoilState.currentApplicationForm?.description
    )
    setFields(informationFieldData.informationFields)
    handleClose()
  }

  const updateForm = useUpdateApplicationForm()
  const handleUpdate = () => {
    const courses: number[] = applicationFormRecoilState.currentApplicationForm
      ?.courses
      ? (
          applicationFormRecoilState.currentApplicationForm?.courses as Course[]
        ).map(course => course.id)
      : []

    const fieldsList =
      fields?.map(field => {
        if (field.id) return `${field.flag || 'applicant'}.${field.id}`
        return `${field.flag}.0`
      }) || []
    updateForm
      .mutateAsync({
        ...applicationFormRecoilState.currentApplicationForm,
        courses,
        formId: applicationFormRecoilState.currentApplicationForm?.id || 0,
        fields: fieldsList,
        institutionId: currentInstitutionId,
        description,
        name,
      })
      .then(() => {
        // refetch()
        handleCloseAndRemoveData()
      })
  }

  const handleQuestionChange = (value: string) => {
    if (validateInputLength(value, 200)) {
      setIsValidQuestion(true)
    } else {
      setIsValidQuestion(false)
    }
    setName(value)
  }

  /** Headers */

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
    <Box>
      <Button
        disabled={!isValidQuestion || !fields}
        onClick={() => handleUpdate()}
      >
        {t('setting:applicationForm.save')}
      </Button>
    </Box>
  )

  return (
    <Drawer open={isOpen}>
      <ContentLayout
        headerBackButton={headerBackButton}
        leftHeader={leftHeaderContent}
        rightHeader={rightHeaderContent}
      >
        {isIdle && (
          <FullScreenAlertBox text={t(`setting:applicationForm.noForm`)} />
        )}
        {isLoading && <FullScreenLoading />}
        {isError && (
          <FullScreenAlertBox text={t(`common:errors.UNKNOWN_ERROR`)} />
        )}
        {isSuccess && !applicationFormRecoilState.currentApplicationForm && (
          <FullScreenAlertBox text={t(`setting:applicationForm.noForm`)} />
        )}
        {isSuccess && applicationFormRecoilState.currentApplicationForm && (
          <Content
            fields={fields || []}
            setFields={setFields}
            setName={handleQuestionChange}
            description={description}
            setDescription={setDescription}
            name={name}
          />
        )}
      </ContentLayout>
    </Drawer>
  )
}

export default EditForm
