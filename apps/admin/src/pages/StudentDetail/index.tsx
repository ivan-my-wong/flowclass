import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FaPencilAlt } from 'react-icons/fa'
import { GiConfirmed } from 'react-icons/gi'
import { ImCross } from 'react-icons/im'
import { useMutation } from 'react-query'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import {
  updateStudentContactInfoV2,
  UpdateStudentEnrollment,
} from '@/api/student'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import { Spinner } from '@/components/Loaders/Spinner'
import Separator from '@/components/Separators/Separator'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import { Badge } from '@/components/ui/Badge'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { StudentStatus } from '@/constants/common'
import useEnrollmentFormData from '@/hooks/useEnrollmentFormData'
import useSiteData from '@/hooks/useSiteData'
import useStudentCRMData from '@/hooks/useStudentCRMData'
import ContentLayout from '@/layouts/ContentLayout'
import PersonalInformationForm from '@/pages/StudentDetail/components/PersonalInformationForm'
import { requiredParamsState } from '@/stores/requiredParamsData'
import { schoolState } from '@/stores/schoolData'
import { studentState } from '@/stores/studentData'
import { StudentFormResponse } from '@/types/enrollCourse'
import { StudentUpdateTeachingServiceRequestDto } from '@/types/studentAddTeachingService'
import { EditStudentContactInfoV2RequestDto } from '@/types/studentMemo'
import { StudentUser } from '@/types/user'

import EnrollmentFormDetail from './components/EnrollmentForm'
import RightHeaderStudentDetail from './components/RightHeaderStudentDetail'
import TeachingService from './components/TeachingService'

const StudentDetail = (): React.ReactElement => {
  const [schoolData] = useRecoilState(schoolState)
  const currentSchoolId = schoolData.currentSchool?.id || 0
  const [isDisabled, setIsDisabled] = useState(true)
  const [isActive, setIsActive] = useState(true)
  const [personalInfo, setPersonalInfo] = useState<StudentUser | any>({})

  const { id: userAliasId } = useParams()

  const { siteData } = useSiteData()
  const currentSiteId = siteData.currentSite?.id.toString() || 0
  const isStudentDeleted = personalInfo?.deletedAt

  const [, setStudentData] = useRecoilState(studentState)
  const [, setRequiredParams] = useRecoilState(requiredParamsState)

  const userId = new URLSearchParams(window.location.search).get('userId')

  const { t } = useTranslation()
  const navigate = useNavigate()
  const headerBackButton: HeaderBackButtonStatus = {
    mode: 'backWithWords',
    action: () => {
      navigate(-1)
    },
    title: t('student:studentTable'),
  }

  const {
    register,
    setValue,
    control,
    formState: { errors },
    getValues: getContactInformationFormValues,
  } = useForm({
    defaultValues: {
      name: '',
      alias: '',
      email: '',
      secondaryEmail: '',
      phone: '',
    },
  })

  const enrollmentForm = useForm({
    mode: 'onBlur',
  })

  const { useFetchStudentEnrollmentForm } = useEnrollmentFormData()
  const { data: studentEnrollment } = useFetchStudentEnrollmentForm({
    userId: Number(userId),
    institutionId: Number(currentSchoolId),
    siteId: +currentSiteId,
    userAliasId: Number(userAliasId),
  })

  const { useStudentDetail } = useStudentCRMData()

  const { isLoading: isStudentDetailLoading, data: studentDetail } =
    useStudentDetail({
      userId: Number(userId),
      institutionId: Number(currentSchoolId),
      siteId: +currentSiteId,
      userAliasId: Number(userAliasId),
    })

  useEffect(() => {
    if (studentDetail) {
      const userFullName = studentDetail.fullName
      const aliasName =
        studentDetail.studentInfo?.userAlias?.name || studentDetail.fullName
      const email =
        studentDetail.studentInfo?.userAlias?.email ?? studentDetail.email ?? ''
      const { phone } = studentDetail

      setPersonalInfo({
        ...studentDetail,
        fullName: userFullName,
        aliasName,
        email,
        phone,
      })

      setValue('name', userFullName)
      setValue('alias', aliasName || '')
      setValue('email', email || '')
      setValue('phone', phone || '')
      setIsActive(studentDetail.status === StudentStatus.ACTIVE)

      setStudentData(prev => ({ ...prev, currentStudent: studentDetail }))
    }
  }, [studentDetail])

  useEffect(() => {
    setStudentData(prev => ({
      ...prev,
      currentStudent: null,
      tableDrawers: {
        ...prev.tableDrawers,
        isOpenAssignCourse: false,
      },
    }))
  }, [])

  useEffect(() => {
    if ([undefined, null, 0, '0', ''].includes(userId)) {
      navigate('/student-record')
      return
    }

    setRequiredParams({
      userId: Number(userId),
      institutionId: Number(currentSchoolId),
      userAliasId: Number(userAliasId),
      siteId: +currentSiteId,
    })
  }, [userId, currentSchoolId, userAliasId, currentSiteId, setRequiredParams])

  const studentEnrollmentForm = Object.values(studentEnrollment || {}).map(
    item => ({
      id: item.id,
      type: item.type,
      value: item.value,
      question: item.question,
    })
  ) as StudentFormResponse[]

  const mutationEditEnrollmentForm = useMutation({
    mutationFn: (params: StudentUpdateTeachingServiceRequestDto) =>
      UpdateStudentEnrollment(params),
    onSuccess: async () => {
      toast.success(t('student:edit.updateEnrollmentSuccess'))
      setIsDisabled(true)
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  const mutationUpdateStudentContactInfoV2 = useMutation({
    mutationFn: (params: EditStudentContactInfoV2RequestDto) =>
      updateStudentContactInfoV2(params),
    onSuccess: () => {
      // queryClient.invalidateQueries(
      //   QUERY_KEY.enrollmentForm.studentEnrollmentKey
      // ) // call API get detail
      toast.success(t('student:edit.updateEnrollmentSuccess'))
      setIsDisabled(true)
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  const handleEditEnrollmentForm = async () => {
    const dataEnrollmentForm = enrollmentForm.getValues()

    // This getValues() is for personal information form
    const { email, phone, alias } = getContactInformationFormValues()

    await mutationUpdateStudentContactInfoV2.mutateAsync({
      institutionId: currentSchoolId,
      userId: Number(userId),
      userAliasId: Number(userAliasId),
      alias,
      email,
      phone,
    })

    if (studentEnrollment && Object.keys(studentEnrollment).length > 0) {
      const metadata = Object.keys(studentEnrollment).map(field => {
        const fieldId = field.split('.')[2]
        const newField = studentEnrollment[field]
        newField.value = dataEnrollmentForm[fieldId]
        return newField
      })
      const payload = {
        siteId: +currentSiteId,
        institutionId: currentSchoolId,
        userAliasId: Number(userAliasId),
        userId: Number(userId),
        metadata,
      }
      await mutationEditEnrollmentForm.mutateAsync(payload)
    }
  }

  if (isStudentDetailLoading) {
    return <FullScreenLoading />
  }

  return (
    <ContentLayout
      key={userAliasId}
      headerBackButton={headerBackButton}
      rightHeader={
        !isStudentDeleted && (
          <RightHeaderStudentDetail
            institutionId={Number(currentSchoolId)}
            siteId={+currentSiteId}
            userId={Number(userAliasId)}
            isActive={isActive}
            studentEmail={personalInfo?.email}
            isStudentDeleted={isStudentDeleted}
          />
        )
      }
    >
      <Box
        padding="lg"
        align="start"
        className="w-full grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4"
      >
        <div>
          <Box direction="col">
            <div className="box-row-full justify-between">
              <p className="text-xl font-bold">
                {t('student:detail.personalInformation')}
              </p>
              {isDisabled ? (
                <Button
                  variant="outline"
                  iconBefore={<FaPencilAlt />}
                  onClick={e => {
                    setIsDisabled(false)
                    e.preventDefault()
                  }}
                  disabled={isStudentDeleted}
                >
                  {mutationUpdateStudentContactInfoV2.isLoading ? (
                    <Spinner />
                  ) : (
                    t('student:editBtn')
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    iconBefore={<ImCross />}
                    onClick={e => {
                      setIsDisabled(true)
                      e.preventDefault()
                    }}
                  >
                    {t('common:action.cancel')}
                  </Button>
                  <Button
                    variant="default"
                    iconBefore={<GiConfirmed />}
                    onClick={() => {
                      handleEditEnrollmentForm()
                    }}
                    type="submit"
                    disabled={isStudentDeleted}
                  >
                    {t('student:saveBtn')}
                    {mutationUpdateStudentContactInfoV2.isLoading && (
                      <Spinner />
                    )}
                  </Button>
                </>
              )}
            </div>
            <Separator margin="medium" />

            <Box className="pb-4">
              <PersonalInformationForm
                errors={errors}
                register={register}
                disabled={isDisabled}
                control={control}
                isPhoneEditable={personalInfo.isOnlyUserAlias}
              />
            </Box>
            <Separator margin="medium" />

            {studentEnrollment && (
              <EnrollmentFormDetail
                disabled={isDisabled}
                enrollmentForm={enrollmentForm}
                studentEnrollment={studentEnrollment}
              />
            )}
          </Box>
        </div>
        <TeachingService
          tabName="teachingService"
          student={personalInfo}
          studentEnrollmentForm={studentEnrollmentForm}
        />
      </Box>
    </ContentLayout>
  )
}

export default StudentDetail
