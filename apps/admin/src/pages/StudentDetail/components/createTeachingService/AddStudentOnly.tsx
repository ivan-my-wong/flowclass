import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { t } from 'i18next'
import { LuMail, LuPhoneCall, LuUser, LuX } from 'react-icons/lu'
import { useQueryClient } from 'react-query'
import { useRecoilState } from 'recoil'

import Box from '@/components/Containers/Box'
import { Spinner } from '@/components/Loaders/Spinner'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import Heading from '@/components/Texts/Heading'
import Switch from '@/components/Toggle/Switch'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { QUERY_KEY } from '@/constants/queryKey'
import useStudentCRMData from '@/hooks/useStudentCRMData'
import ContentLayout from '@/layouts/ContentLayout'
import PersonalInformationForm from '@/pages/StudentDetail/components/PersonalInformationForm'
import { AddTeachingServiceMode, studentState } from '@/stores/studentData'
import { TypeCreateStudent } from '@/types/student'
import { FormTeachingServiceProps } from '@/types/studentAddTeachingService'
import { StudentUser } from '@/types/user'

import {
  CreateStudentAndAddLessonInputFields,
  Field,
  InputFields,
  LabelField,
  Loading,
} from '.'

type Props = FormTeachingServiceProps & {
  headerBackButton: HeaderBackButtonStatus
  handleCloseAndClearData: () => void
}

const AddStudentOnly = (props: Props) => {
  const {
    headerBackButton,
    handleCloseAndClearData,
    currentDetail,
    form,
    isSendEmail,
    setIsSendEmail,
  } = props
  const [, setStudentData] = useRecoilState(studentState)

  const navigate = useNavigate()
  const {
    handleSubmit,
    formState: { errors },
    register,
    control,
  } = form

  const { useCreateStudent } = useStudentCRMData()

  const {
    mutateAsync: mutationCreateStudent,
    isLoading: isMutationCreateStudentLoading,
  } = useCreateStudent()

  const queryClient = useQueryClient()

  const [isSaveDisabled, setIsSaveDisabled] = useState(false)

  // New state for two-step process
  const [createdStudent, setCreatedStudent] = useState<null | {
    id: number
    name: string
    email: string
    phone: string
  }>(null)

  const onSubmitAddStudentWithOptionalLesson = async (
    data: CreateStudentAndAddLessonInputFields
  ) => {
    const { alias, email, secondaryEmail, phone, studentId } = data
    const createStudentParams: TypeCreateStudent = {
      name: alias,
      email: email !== '' ? email : undefined,
      secondaryEmail: secondaryEmail !== '' ? secondaryEmail : undefined,
      phone,
      institutionId: currentDetail?.institutionId,
      siteId: currentDetail.siteId,
      isSendEmail,
    }

    const returnedStudent = await mutationCreateStudent(createStudentParams)

    queryClient.invalidateQueries({
      queryKey: [
        QUERY_KEY.student.studentListNewKey,
        currentDetail?.institutionId,
      ],
    })

    // Set created student info for success screen
    setCreatedStudent({
      id: returnedStudent.id,
      name: alias,
      email,
      phone,
    })
  }

  const rightHeaderContent = () => {
    return (
      <Button
        disabled={isSaveDisabled}
        onClick={handleSubmit((data: InputFields) =>
          onSubmitAddStudentWithOptionalLesson(
            data as CreateStudentAndAddLessonInputFields
          )
        )}
        data-testid="save-button"
      >
        {t('student:saveBtn')}
        {isMutationCreateStudentLoading && (
          <Loading>
            <Spinner size="small" />
          </Loading>
        )}
      </Button>
    )
  }

  // Success screen
  if (createdStudent) {
    return (
      <ContentLayout
        headerBackButton={headerBackButton}
        leftHeader={
          <Heading size="smallMedium">
            {t('student:teachingService.addStudentWithOptionalCourse')}
          </Heading>
        }
        rightHeader={
          // close the modal
          <Button variant="ghost" onClick={() => handleCloseAndClearData()}>
            <LuX size={20} />
          </Button>
        }
      >
        <Card className="p-8 mt-8">
          <Box direction="row" align="center" gap="small">
            <span
              style={{
                display: 'inline-block',
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#22c55e',
              }}
            />
            <span style={{ fontWeight: 600, lineHeight: 1.5 }}>
              {t('teachingService:createStudentSuccess')}
            </span>
          </Box>
          <Box direction="column" gap="small" style={{ marginTop: 12 }}>
            <div className="flex items-center gap-2">
              <LuPhoneCall size={20} /> {t('student:phone', 'Phone')}:{' '}
              {createdStudent.phone}
            </div>
            <div className="flex items-center gap-2">
              <LuUser size={20} /> {t('student:name', 'Name')}:{' '}
              {createdStudent.name}
            </div>
            <div className="flex items-center gap-2">
              <LuMail size={20} /> {t('student:email', 'Email')}:{' '}
              {createdStudent.email}
            </div>
          </Box>
        </Card>
        <Box direction="row" gap="medium" style={{ marginTop: 32 }}>
          <Button
            variant="outline"
            onClick={() => {
              navigate(`?student=${createdStudent.id}`)
              setStudentData(prev => ({
                ...prev,
                tableDrawers: {
                  ...prev.tableDrawers,
                  isOpenAssignCourse: true,
                  assignCourseMode: AddTeachingServiceMode.addCourseDirectly,
                },
                currentStudent: {
                  fullName: createdStudent.name,
                  phone: createdStudent.phone,
                  email: createdStudent.email,
                } as StudentUser,
              }))
            }}
          >
            {t('teachingService:assignCourseNow')}
          </Button>
          <Button onClick={() => setCreatedStudent(null)}>
            {t('teachingService:createAnother')}
          </Button>
        </Box>
      </ContentLayout>
    )
  }

  // Step 1: Form
  return (
    <form style={{ width: '100%' }} data-testid="teaching-service-form">
      <ContentLayout
        headerBackButton={headerBackButton}
        leftHeader={
          <Heading size="smallMedium">
            {t('student:teachingService.addStudentWithOptionalCourse')}
          </Heading>
        }
        rightHeader={rightHeaderContent()}
      >
        <div className="my-2" />
        <PersonalInformationForm
          errors={errors}
          register={register}
          control={control}
          isPhoneEditable
          isCreateStudent
          institutionId={currentDetail?.institutionId}
          onPhoneConflictChange={setIsSaveDisabled}
        />
      </ContentLayout>
    </form>
  )
}

export default AddStudentOnly
