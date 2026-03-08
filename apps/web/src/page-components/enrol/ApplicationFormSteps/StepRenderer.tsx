import { Dispatch, SetStateAction } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { UseFormReturn } from 'react-hook-form'
import { MdOutlineNavigateBefore, MdOutlineNavigateNext } from 'react-icons/md'

import Button from '@/components/Buttons/Button'
import { useEnrolState } from '@/stores/enrolContext'
import { EnrollmentField, EnrollmentFieldFlag, StudentPrimaryIdentifier } from '@/types'
import { CustomDataFieldColumnMapping } from '@/types/enrol'
import { onlyAlphaNumericAndSpace } from '@/utils/sanitize'

import DynamicField from './DynamicField'

type PropsType = {
  // The first layer is an array for each applicant, the second layer is an array of fields of each applicant
  steps: EnrollmentField[][]
  currentStep: number
  setCurrentStep: Dispatch<SetStateAction<number>>
  formInstance: UseFormReturn<any, any>
  numberOfApplicant?: number
}
const ApplicationSteps = ({
  steps,
  currentStep,
  setCurrentStep,
  formInstance,
  numberOfApplicant = 1,
}: PropsType): JSX.Element => {
  const { t } = useTranslation()

  const { school } = useEnrolState()

  const studentPrimaryIdentifier = school?.studentPrimaryIdentifier
  const isEmailPrimary = studentPrimaryIdentifier === StudentPrimaryIdentifier.EMAIL

  const currentStepArray = steps[currentStep]

  if (!currentStepArray) {
    return <></>
  }

  const getOpts = (arr: string[]): { label: string; value: string }[] => {
    if (arr) {
      return arr.map((option: string) => {
        return { label: option, value: option }
      })
    }
    return []
  }

  const applicantIndex = numberOfApplicant > 1 ? currentStep : 0

  const createAnAccount = formInstance.watch(
    `applicant.[${applicantIndex}].${EnrollmentFieldFlag.createAnAccount}`
  )

  const checkRequired = (field: EnrollmentField): boolean => {
    if (
      field.columnMapping &&
      field.columnMapping.toLowerCase().includes(CustomDataFieldColumnMapping.NAME)
    ) {
      if (createAnAccount) {
        return field.columnMapping.toLowerCase().includes(CustomDataFieldColumnMapping.NAME)
      }
      return true
    }

    if (field.isDefault && currentStep === 0) {
      // I decided it's better in the front end to force the user to enter the email
      if (
        !isEmailPrimary &&
        field.columnMapping?.toLowerCase().includes(CustomDataFieldColumnMapping.EMAIL)
      ) {
        return false
      }
      return true
    }

    return field.isRequire
  }

  return (
    <>
      {steps.length <= 0 && <></>}

      {steps.length > 1 && currentStep > 0 && (
        <div className="box-row-full mt-4 flex justify-between">
          <Button
            onClick={() => setCurrentStep(currentStep - 1)}
            iconBefore={<MdOutlineNavigateBefore />}
            variant="outlined"
            className="w-full"
          >
            {numberOfApplicant > 1
              ? t('enrol:customFieldStep.previousApplicant')
              : t('enrol:customFieldStep.previousStep')}
          </Button>
        </div>
      )}

      {steps.length === 1 &&
        steps[0].map((customField, index) => (
          <DynamicField
            key={`field-${currentStep}-${customField.id ?? index}`}
            name={`${customField.flag}[${applicantIndex}].${onlyAlphaNumericAndSpace(
              customField.question
            )}`}
            customfield={{
              ...customField,
              isRequire: checkRequired(customField),
            }}
            form={formInstance}
            options={getOpts(customField.option)}
            applicantIndex={steps.length > 1 ? currentStep : undefined}
          />
        ))}
      {steps.length > 1 &&
        currentStepArray.map((stepFields, stepIndex) => {
          const fieldsComponent = (
            <div key={`field-${currentStep}-${stepFields.id ?? stepIndex}`} className="w-full">
              <DynamicField
                name={`${stepFields.flag}[${applicantIndex}].${onlyAlphaNumericAndSpace(
                  stepFields.question
                )}`}
                customfield={{
                  ...stepFields,
                  isRequire: checkRequired(stepFields),
                }}
                form={formInstance}
                options={getOpts(stepFields.option)}
                applicantIndex={steps.length > 1 ? currentStep : undefined}
              />
            </div>
          )

          return (
            // eslint-disable-next-line react/no-array-index-key
            <div key={`step-${currentStep}-${stepIndex}-${stepFields.id}`} className="box-col-full">
              {fieldsComponent}
            </div>
          )
        })}

      {steps.length > 1 && (
        <div className="box-row-full mt-4 flex justify-between">
          {currentStep < steps.length - 1 && (
            <Button
              data-testid="next-applicant"
              onClick={async () => {
                const isValid = await formInstance.trigger() // Trigger validation
                if (isValid) {
                  setCurrentStep(currentStep + 1) // Move to the next step if valid

                  setTimeout(() => {
                    const sectionElement = document.getElementById('step-indicator')

                    window.scrollTo({
                      top: sectionElement?.offsetHeight,
                      behavior: 'smooth',
                    })
                  }, 100)
                }
              }}
              iconAfter={<MdOutlineNavigateNext />}
              className="w-full"
            >
              {numberOfApplicant > 1
                ? t('enrol:customFieldStep.nextApplicant')
                : t('enrol:customFieldStep.nextStep')}
            </Button>
          )}
        </div>
      )}
    </>
  )
}

export default ApplicationSteps
