import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

import { t } from 'i18next'
import { FaPlus } from 'react-icons/fa'
import Select, { components, SingleValue } from 'react-select'
import { useRecoilState } from 'recoil'

import PlusIcon from '@/assets/svgs/PlusIcon'
import Box from '@/components/Containers/Box'
import { Spinner } from '@/components/Loaders/Spinner'
import { Button } from '@/components/ui/Button'
import { defaultApplicationForm } from '@/constants/applicationForm'
import useApplicationFormData from '@/hooks/useApplicationFormData'
import useCourseData from '@/hooks/useCourseData'
import { useCourseEditSave } from '@/hooks/useCourseEditSave'
// import { defaultApplicationForm } from '@/Setting/ApplicationForm'
import { applicationFormState } from '@/stores/applicationFormData'
import { courseState } from '@/stores/courseData'
import {
  DefaultInformationFieldTypes,
  InformationFieldTypes,
} from '@/types/applicationForm'
import { TypeOpts } from '@/types/student'

import RegistrationFields from '../RegistrationFields'

const defaultFormOption = [
  {
    value: null,
    label: t('teachingService:enrollment.enrollmentForm.defaultForm'),
  },
]

const EnrollmentFormList = forwardRef<any, any>((props, ref): JSX.Element => {
  const navigate = useNavigate()
  const { setIsOpenMessageUnSavedChanges } = useCourseEditSave()
  const [optionSelected, setOptionSelected] = useState<TypeOpts>()
  const [fieldsForm, setFieldsForm] = useState<
    InformationFieldTypes[] | DefaultInformationFieldTypes[]
  >([])
  const [hasEnrollmentFormChanged, setHasEnrollmentFormChanged] =
    useState<boolean>(false)
  const [courseRecoilState, setCourseRecoilState] = useRecoilState(courseState)

  const [applicationFormData] = useRecoilState(applicationFormState)
  const {
    useFetchAllApplicationFormData,
    setCurrentApplicationForm,
    useFetchCurrentApplicationForm,
    useAssignApplicationForm,
  } = useApplicationFormData()
  const { useFetchCurrentCourse } = useCourseData()

  const [options, setOptions] = useState<TypeOpts[]>(defaultFormOption)
  useFetchAllApplicationFormData((data = []) => {
    let list = data.map(item => ({
      label: item.name,
      value: item.id?.toString() || null,
    }))

    const isCheckDefault = list.some(
      o => o.label === defaultFormOption[0].label
    )
    if (!isCheckDefault) {
      list = [...defaultFormOption, ...list]
    }

    setOptions(list)
  })

  const { data: currentCourseData } = useFetchCurrentCourse(data => {
    setCourseRecoilState(prev => ({ ...prev, currentCourse: data }))
  })
  const { isLoading } = useFetchCurrentApplicationForm(data => {
    setFieldsForm(data.fields as InformationFieldTypes[])
  })
  const messageRef = useRef<any>(null)

  useEffect(() => {
    if (options.length > 0) {
      setCurrentApplicationForm(courseRecoilState.currentCourse?.formId || null)

      const optionsForm = courseRecoilState.currentCourse?.formId
        ? options.find(
            opt =>
              opt.value === courseRecoilState.currentCourse?.formId?.toString()
          )
        : options
      if (Array.isArray(optionsForm)) {
        setOptionSelected(optionsForm.length > 0 ? optionsForm[0] : undefined)
      } else {
        setOptionSelected(optionsForm)
      }
      if (!courseRecoilState.currentCourse?.formId) {
        setFieldsForm(defaultApplicationForm)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseRecoilState.currentCourse?.formId, options.length])

  const handleSelect = (opt: SingleValue<TypeOpts>) => {
    if (opt) {
      setHasEnrollmentFormChanged(true)
      setIsOpenMessageUnSavedChanges(true)
      setOptionSelected(opt)
      setCurrentApplicationForm(Number(opt.value) || null)

      if (!opt.value) {
        setFieldsForm(defaultApplicationForm)
      }
    }
  }
  const handleEdit = () => {
    if (optionSelected) {
      setCurrentApplicationForm(Number(optionSelected.value))
      navigate(`/settings/application-form?formId=${optionSelected.value}`)
    }
  }

  const handleReset = () => {
    setHasEnrollmentFormChanged(true)
    setIsOpenMessageUnSavedChanges(true)
    setOptionSelected(defaultFormOption[0])
    setCurrentApplicationForm(null)
    setFieldsForm(defaultApplicationForm)
  }

  const assignApplicationForm = useAssignApplicationForm()

  const handleAssign = useCallback(async () => {
    let formId: number | null = null
    if (optionSelected?.value === null) {
      formId = null
    } else if (applicationFormData.currentApplicationForm) {
      formId = applicationFormData.currentApplicationForm.id
    }
    await assignApplicationForm.mutateAsync({
      formId,
      courseId: currentCourseData?.id || 0,
    })
  }, [
    optionSelected,
    applicationFormData,
    assignApplicationForm,
    currentCourseData,
  ])

  const handleSaveAll = useCallback(async () => {
    if (hasEnrollmentFormChanged) {
      await handleAssign()
    }
    if (messageRef.current && messageRef.current.handleUpdate) {
      await messageRef.current.handleUpdate()
    }
    setHasEnrollmentFormChanged(false)
    setIsOpenMessageUnSavedChanges(false)
  }, [handleAssign, hasEnrollmentFormChanged, setIsOpenMessageUnSavedChanges])

  useImperativeHandle(ref, () => ({
    submitForm: handleSaveAll,
  }))

  const Option = ({ data, ...props }: any) => {
    if (data.isButton) {
      return (
        <div className="w-full h-[42px] flex justify-center items-center gap-2.5 text-base cursor-pointer border-t border-[#BFBFBF]">
          <PlusIcon fill="#5C95FF" />
          {t(
            'teachingService:enrollment.enrollmentForm.createNewApplicationForm'
          )}
        </div>
      )
    }
    return (
      <div className="flex">
        <components.Option {...props} />
      </div>
    )
  }
  return (
    <Box direction="column" gap="large">
      <Box direction="column" align="flex-start">
        <Box responsive justify="space-between">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2 w-full">
            <div className="w-full md:col-span-4">
              <Select
                options={options}
                components={{ Option }}
                onChange={handleSelect}
                value={optionSelected}
              />
            </div>
            <Button
              data-testid="reset-form-btn"
              variant="outline"
              disabled={!optionSelected}
              onClick={() => handleReset()}
            >
              {t('teachingService:enrollment.enrollmentForm.resetForm')}
            </Button>
            {optionSelected &&
            JSON.stringify(fieldsForm) !==
              JSON.stringify(defaultApplicationForm) ? (
              <Button
                data-testid="edit-form-btn"
                variant="outline"
                disabled={!optionSelected}
                onClick={() => handleEdit()}
              >
                {t('teachingService:enrollment.enrollmentForm.editForm')}
              </Button>
            ) : (
              <Button
                data-testid="add-form-btn"
                variant="outline"
                onClick={() => {
                  navigate('/settings/application-form?tab=add')
                }}
                iconBefore={<FaPlus />}
              >
                {t('teachingService:enrollment.enrollmentForm.addForm')}
              </Button>
            )}
            {/* <LoadingButton
                  onClick={() => handleAssign()}
                  isLoading={assignApplicationForm.isLoading}
                >
                  {t('setting:applicationForm.save')}
                </LoadingButton> */}
          </div>
        </Box>
        <Box direction="column">
          {/* <AlertBox
            icon={<IoMdInformationCircle />}
            content={t('teachingService:enrollment.enrollmentForm.noti')}
          /> */}

          {isLoading && (
            <div className="w-full flex justify-center">
              <Spinner />
            </div>
          )}
          {fieldsForm.length > 0 && <RegistrationFields fields={fieldsForm} />}
        </Box>
      </Box>
    </Box>
  )
})

export default EnrollmentFormList
