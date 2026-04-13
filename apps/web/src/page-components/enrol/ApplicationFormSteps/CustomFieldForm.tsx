import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'

import { useRecoilValue } from 'recoil'

import _ from 'lodash'
import useTranslation from 'next-translate/useTranslation'
import { FieldValues, UseFormReturn } from 'react-hook-form'
import useFormPersist from 'react-hook-form-persist'
import { MdOutlineNavigateNext } from 'react-icons/md'
import { toast } from 'sonner'

import Button from '@/components/Buttons/Button'
import Form from '@/components/Form'
import Spinner from '@/components/Loaders/Spinner'
import { FieldTypes } from '@/constants/common'
import useFormFieldsData from '@/hooks/useFormFieldsData'
import useTrialLessonData from '@/hooks/useTrialLessonData'
import AlertTrialLesson from '@/page-components/enrol/AlertTrialLesson'
import { enrolState } from '@/stores/enrol'
import {
  Course,
  EnrollmentField,
  EnrollmentFieldFlag,
  EnrollmentForm,
  FieldsDefaults,
} from '@/types'
import { CustomDataFieldColumnMapping } from '@/types/enrol'
import { onlyAlphaNumericAndSpace } from '@/utils/sanitize'

import RequiredFields from './RequiredFields'
import ApplicationSteps from './StepRenderer'
import SwitchField from './SwitchField'

export const defaultApplicationForm = [
  {
    question: 'Name',
    type: FieldTypes.SHORT_ANSWER,
    isDefault: true,
    flag: EnrollmentFieldFlag.applicant,
    isRequire: true,
    columnMapping: CustomDataFieldColumnMapping.NAME,
  },
  {
    question: 'Email',
    type: FieldTypes.EMAIL,
    isDefault: true,
    flag: EnrollmentFieldFlag.applicant,
    isRequire: true,
    columnMapping: CustomDataFieldColumnMapping.EMAIL,
  },
  {
    question: 'Phone',
    type: FieldTypes.PHONE,
    isDefault: true,
    flag: EnrollmentFieldFlag.applicant,
    isRequire: true,
    columnMapping: CustomDataFieldColumnMapping.PHONE,
  },
]

type CustomFieldFormProps = {
  course: Course | undefined
  onSubmit: (prop: any, fields: FieldsDefaults) => void
  registrationForm: any[]
  fields: EnrollmentField[]
  setFields: (fields: EnrollmentField[]) => void
  numberOfApplicant: number
  formInstance: UseFormReturn<FieldValues, any, undefined>
}

type CustomObjFields = {
  [key: string]: EnrollmentField
}

type IRenderApplicantSteps = {
  currStep: number
  setCurrStep: Dispatch<SetStateAction<number>>
  steps: EnrollmentField[][]
}

const CustomFieldForm = ({
  course,
  onSubmit,
  registrationForm,
  fields,
  setFields,
  numberOfApplicant,
  formInstance,
}: CustomFieldFormProps): JSX.Element => {
  const { t } = useTranslation()
  const router = useRouter()
  const { watch, setValue, control, reset, trigger } = formInstance

  const [fieldChanged, setFieldChanged] = useState<CustomObjFields | EnrollmentField[]>([])
  const formId = course?.formId || ''

  const [currentStep, setCurrentStep] = useState(0)
  const [isCustomFieldLoading, setIsCustomFieldLoading] = useState(true)

  useEffect(() => {
    if (!formId) {
      setIsCustomFieldLoading(false)
      setFields(defaultApplicationForm as EnrollmentField[])
    }
  }, [formId])

  const getApplicationSteps = (flag: EnrollmentFieldFlag, total: number): EnrollmentField[][] => {
    if (fields.length === 0) return []
    if (!fields.find(field => field.type !== FieldTypes.STEP_SEPARATOR)) {
      return [fields]
    }
    return (
      fields
        .filter(o => o.flag === flag)
        // .sort((a, b) => a.order - b.order)
        .reduce((acc: EnrollmentField[][], field) => {
          if (field.type === FieldTypes.STEP_SEPARATOR) {
            acc.push([])
          } else {
            if (acc.length === 0) {
              acc.push([])
            }
            acc[acc.length - 1].push(field)
          }
          return acc
        }, Array(total).fill([]))
    )
  }

  const stepsApplicant = useMemo(() => {
    return getApplicationSteps(EnrollmentFieldFlag.applicant, numberOfApplicant || 1)
  }, [fields])

  const stepsCommon = useMemo(() => {
    const list = getApplicationSteps(EnrollmentFieldFlag.common, 1).flat()
    if (list.length > 0) return [list]
    return []
  }, [fields])

  useFormPersist('custom-form', { watch, setValue })
  // get applicants in form
  const applicants = formInstance.watch('applicant')

  useEffect(() => {
    // If there is one applicant and more than one applicant inside the form
    // We need to set the default value to the first applicant
    // This will fix issue: https://flowclass.atlassian.net/browse/FLOW-1620
    if (numberOfApplicant <= 1 && (applicants?.length || 1) > 1) {
      setValue('applicant', [applicants[0]])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicants, numberOfApplicant])

  const { useFetchFormFields } = useFormFieldsData()
  const { refetch } = useFetchFormFields(formId, (rs: EnrollmentForm) => {
    if (rs) {
      setIsCustomFieldLoading(false)
    }
    setFields(
      rs.fields.filter(o => {
        return (
          (numberOfApplicant > 1 && o.type !== FieldTypes.STEP_SEPARATOR) || numberOfApplicant === 1
        )
      })
    )
  })

  useEffect(() => {
    if (formId) {
      refetch()
    }
  }, [formId])

  useEffect(() => {
    if (fields) {
      const newObj = _.reduce(
        fields,
        (sum: any, n: any) => {
          // eslint-disable-next-line no-param-reassign
          sum[n.id] = n
          return sum
        },
        []
      )

      setFieldChanged(newObj)
    }
  }, [fields])

  useEffect(() => {
    const tempRegistrationForm: any = {}

    const id = registrationForm?.[0]?.id

    // new format with id include flag, index and fieldId with dot separated
    if (id?.toString()?.includes('.')) {
      registrationForm?.forEach(o => {
        const { id, question, value } = o
        let [flag, index] = id?.toString()?.split('.')

        if (typeof flag !== 'string' || flag === 'undefined' || isNaN(index as any)) {
          flag = EnrollmentFieldFlag.applicant
          index = '0'
        }

        if (!tempRegistrationForm[flag]) tempRegistrationForm[flag] = []
        if (!tempRegistrationForm[flag][index]) tempRegistrationForm[flag][index] = {}

        tempRegistrationForm[flag][index][onlyAlphaNumericAndSpace(question)] = value
      })

      return reset(tempRegistrationForm)
    }

    // old format with id only
    Object.entries(registrationForm).reduce((acc, [key, value]) => {
      let formKey
      let formValue
      // we have two structures of registration form
      if (typeof value === 'object' && value !== null) {
        const valObj = value as {
          description?: string
          question?: string
          value?: string | boolean
        }
        formKey = (valObj.description || valObj.question) as string
        // value may not exist in the object
        if ('value' in valObj) formValue = valObj.value
        else formValue = ''
      } else {
        formKey = key
        formValue = value
      }

      const flag = EnrollmentFieldFlag.applicant // default is applicants
      const index = '0' // first applicant

      if (!tempRegistrationForm[flag]) tempRegistrationForm[flag] = []
      if (!tempRegistrationForm[flag][index]) tempRegistrationForm[flag][index] = {}

      tempRegistrationForm[flag][index][formKey] = formValue

      return { ...acc, [formKey]: formValue }
    }, {})

    const { name, email, phone } = router.query
    if (name || email || phone) {
      const initialValues = {
        applicant: [
          {
            Name: name || '',
            Email: email || '',
            Phone: phone || '',
          },
        ],
      }

      reset(initialValues)
      formInstance.trigger(['applicant.0.Name', 'applicant.0.Email', 'applicant.0.Phone'])
    }

    if (Object.keys(tempRegistrationForm).length > 0) {
      return reset(tempRegistrationForm)
    }
  }, [registrationForm, reset, router.query])

  // format result
  const transformObject = (obj: any) => {
    const result: any = []

    // For the default fields
    Object.keys(obj)
      .filter(o => typeof obj[o] === 'string')
      .forEach((key, index) => {
        result.push({
          id: `${index}`,
          question: key,
          value: obj[key],
          isDefault: true,
          columnMapping: key.toLowerCase(),
        })
      })

    // Logic:
    // 1. Get keys of object and do a looping through the keys
    // 2. Filter the keys except `exceptFields`
    // 3. Create object from given keys and set the attribute based on key
    // Result: Should be list of object

    Object.keys(obj)
      .filter(o => typeof obj[o] === 'object')
      .forEach((key: any, i) => {
        obj[key].forEach((o: any, j: any) => {
          if (!o) return

          return Object.keys(o).forEach(p => {
            if (p === 'createAnAccount') return

            const field = fields.find(field => {
              return (
                onlyAlphaNumericAndSpace(field.question.toLowerCase()) ===
                onlyAlphaNumericAndSpace(p.toLowerCase())
              )
            })

            const fieldId = field?.id || field?.columnMapping || EnrollmentFieldFlag.createAnAccount

            const pickedField = Array.isArray(fieldChanged)
              ? Object.values(fieldChanged).find(f => f.id === fieldId)
              : fieldChanged[p]

            result.push({
              id: `${key}.${j}.${fieldId}`,
              value: o[p],
              type: pickedField?.type || field?.type,
              question:
                pickedField?.question || field?.question || EnrollmentFieldFlag.createAnAccount,
              isDefault: field?.isDefault || false,
              order: +`${i}${j}${field?.order || 0}`,
              columnMapping: field?.columnMapping,
            })
          })
        })
      })

    return result
  }

  const { selectedClassData, currentSelectedClassIndex, classTrialLesson } =
    useRecoilValue(enrolState)
  const currentSelectedClassData = selectedClassData[currentSelectedClassIndex]

  const selectedClass = currentSelectedClassData?.selectedClass
  const [isOpenAlert, setIsOpenAlert] = useState<boolean>(false)

  const { useValidateTrialLesson } = useTrialLessonData()

  const { mutateAsync: validateTrialLesson } = useValidateTrialLesson(selectedClass?.id)

  const handleOnSubmit = async (rs: any) => {
    const params = transformObject(rs)
    if (classTrialLesson) {
      const { isValid } = await validateTrialLesson({
        classIds: [selectedClass?.id as number],
        applicants: rs.applicant.map((d: any) => ({
          email: d.Email,
          phone: d.Phone,
        })),
      })
      if (!isValid) {
        setIsOpenAlert(true)
        return
      }
    }

    if (!formInstance.formState.isValid) {
      toast.error(t('enrol:customFieldStep.pleaseValidateForm') as string)
      return
    }

    // Scroll to the top of the page
    setTimeout(() => {
      const sectionElement = document.getElementById('step-indicator')

      window.scrollTo({
        top: sectionElement?.offsetHeight,
        behavior: 'smooth',
      })
    }, 100)
    onSubmit(params, rs)
  }

  const renderApplicationSteps = ({ currStep, setCurrStep, steps }: IRenderApplicantSteps) => {
    // The problem is that there is not loader for before isCustomFieldLoading is false
    // So we need to show the loader when isCustomFieldLoading is false

    if (isCustomFieldLoading) {
      return (
        <div className="mt-4">
          <Spinner />
        </div>
      )
    }

    if (currStep === 0 && fields.length === 0) {
      // This is not really used because the fields are in the custom fields
      return <RequiredFields form={formInstance} />
    }

    // When there are any custom fields, this will be triggered instead
    return (
      <ApplicationSteps
        currentStep={currStep}
        setCurrentStep={setCurrStep}
        steps={steps}
        formInstance={formInstance}
        numberOfApplicant={numberOfApplicant}
      />
    )
  }

  let labelForm = t('enrol:customFieldStep.applicantOfNumber')
  if (numberOfApplicant === 1) {
    labelForm = labelForm.replace('{step}', '1').replace('{total}', '1')
  } else {
    labelForm = labelForm
      .replace('{step}', `${currentStep + 1}`)
      .replace('{total}', `${stepsApplicant.length}`)
  }
  if (typeof course === 'undefined') return <></>

  return (
    <>
      <Form {...formInstance}>
        <div className="box-col-full break-word">
          <form onSubmit={formInstance.handleSubmit(handleOnSubmit)} className="box-col-full">
            {stepsApplicant.length > 1 &&
              (currentStep > 0 ? (
                <div className="box-col bg-background-layer-2 rounded-lg">
                  <div className="w-full text-left font-bold">{labelForm}</div>
                  {numberOfApplicant > 1 && (
                    <SwitchField
                      wrapperClass="flex-row justify-between items-center"
                      defaultValue={true}
                      labelClass={'raw-input-label mb-0 font-bold text-wrap'}
                      label={t('enrol:customFieldStep.createAnAccount')}
                      name={`${EnrollmentFieldFlag.applicant}[${currentStep}].${EnrollmentFieldFlag.createAnAccount}`}
                      form={formInstance}
                    />
                  )}
                </div>
              ) : (
                <div className="bg-background-layer-2 w-full rounded-lg p-2 text-left font-bold">
                  {labelForm}
                </div>
              ))}

            {renderApplicationSteps({
              currStep: currentStep,
              setCurrStep: setCurrentStep,
              steps: stepsApplicant,
            })}

            {!isCustomFieldLoading &&
              stepsCommon.length > 0 &&
              stepsCommon[0].length > 0 &&
              (stepsApplicant.length === 0 || currentStep === stepsApplicant.length - 1) && (
                <>
                  <div className="box-col bg-background-layer-2 mt-10 rounded-lg">
                    <div className="w-full text-left font-bold">
                      {t('enrol:customFieldStep.commonFields')}
                    </div>
                  </div>
                  {renderApplicationSteps({
                    currStep: 0,
                    setCurrStep: () => {},
                    steps: stepsCommon,
                  })}
                </>
              )}

            {!isCustomFieldLoading &&
              (stepsApplicant.length === 0 || currentStep === stepsApplicant.length - 1) && (
                <Button
                  iconAfter={<MdOutlineNavigateNext />}
                  className="mt-4 w-full"
                  type="submit"
                  // onClick={() => {
                  //   handleOnSubmit(formInstance.getValues())
                  // }}
                  disabled={!formInstance.formState.isValid}
                >
                  {t('common:action.nextStep')}
                </Button>
              )}
          </form>
        </div>
      </Form>
      {isOpenAlert && <AlertTrialLesson open={isOpenAlert} setOpen={setIsOpenAlert} />}
    </>
  )
}
export default CustomFieldForm
