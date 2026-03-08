import { useEffect, useRef, useState } from 'react'

import { useRecoilState } from 'recoil'

import { LucideRefreshCcw } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'
import { useForm } from 'react-hook-form'

import Button from '@/components/Buttons/Button'
import InfoDialog from '@/components/Popups/InfoDialog'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { FEATURE_FLAGS } from '@/constants/common'
import { applicationDescription } from '@/constants/course'
import { enrolState, prevSelectedOptionState } from '@/stores/enrol'
import { useEnrolState } from '@/stores/enrolContext'
import { wishlistState } from '@/stores/wishlist'
import { EnrollmentField, EnrollmentFieldFlag } from '@/types'
import { FieldAnswer } from '@/types/enrol'
import { onlyAlphaNumericAndSpace } from '@/utils/sanitize'

import AutoFillDialog from './AutoFillModal'
import CustomFieldForm from './CustomFieldForm'

import 'react-datepicker/dist/react-datepicker.css'

const CustomFieldStep = (): JSX.Element => {
  const { t } = useTranslation()
  const { course } = useEnrolState()
  const [enrolForm, setEnrolForm] = useRecoilState(enrolState)
  const [wishlist, setWishlist] = useRecoilState(wishlistState)
  const [isAutoFillDialogOpen, setIsAutoFillModalOpen] = useState(false)
  const [registrationForm, setRegistrationForm] = useState([] as any[])
  const [, setPrevSelectedOption] = useRecoilState(prevSelectedOptionState)
  const [fields, setFields] = useState<EnrollmentField[]>([])
  const [applicantFields, setApplicantFields] = useState<EnrollmentField[]>([])
  const hasInitialStateSavedRef = useRef(false)

  const selectedClass = enrolForm?.selectedClassData?.[0]?.selectedClass
  const classType = selectedClass?.type

  useEffect(() => {
    let storageItems: Record<string, any> = {}
    try {
      storageItems = JSON.parse(sessionStorage.getItem('custom-form') || '{}')
    } catch (error) {
      storageItems = {}
    }
    const applicantFields = storageItems?.[EnrollmentFieldFlag.applicant] || []
    setApplicantFields(applicantFields)

    const tuitionCopy = [...enrolForm.tuition]
    tuitionCopy.splice(enrolForm.currentSelectedClassIndex, 1)
    const updatedMultipleData = [...(enrolForm.selectedClassData || [])]

    const updatedElement = {
      ...updatedMultipleData[updatedMultipleData.length - 1],
    }

    if (enrolForm.setMultipleClass) {
      updatedMultipleData[updatedMultipleData.length - 1] = updatedElement

      setPrevSelectedOption(prev => ({
        ...prev,
        selectedClassData: updatedMultipleData,
        tuition: tuitionCopy,
      }))
    } else if (updatedMultipleData.length > 0) {
      updatedMultipleData[updatedMultipleData.length - 1] = updatedElement

      setPrevSelectedOption(prev => ({
        ...prev,
        selectedClassData: updatedMultipleData,
        tuition: tuitionCopy,
      }))
    }
  }, [])

  useEffect(() => {
    if (enrolForm.numberOfApplicant < applicantFields.length) {
      // If numberOfApplicant lower than saved applicant we need to adjust the saved applicant
      // by remove unused applicant data to prevent different data between `studentData` and `registrationForm`
      const slicedApplicant = applicantFields.slice(0, enrolForm.numberOfApplicant - 1)
      sessionStorage.setItem(
        'custom-form',
        JSON.stringify({
          applicant: slicedApplicant,
        })
      )
    }
  }, [enrolForm.numberOfApplicant, applicantFields])

  // Save old-form when fields are first initialized (if not already saved and no auto-fill has occurred)
  useEffect(() => {
    const existingOldForm = sessionStorage.getItem('old-form')
    // Only save once when fields are first loaded, if old-form doesn't exist and no auto-fill has occurred
    if (
      !hasInitialStateSavedRef.current &&
      !existingOldForm &&
      fields.length > 0 &&
      registrationForm.length === 0
    ) {
      // Fields have been initialized, but no auto-fill has occurred yet
      // Save the initial state so we can restore it later if needed
      sessionStorage.setItem(
        'old-form',
        JSON.stringify({ registrationForm: [], fields, formValue: formInstance.watch() })
      )
      hasInitialStateSavedRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.length, registrationForm.length])

  const onSubmit = (data: FieldAnswer[]) => {
    const processedData = data.map(field => {
      if (!field || field.value === undefined) {
        return { ...field, value: '' }
      }
      return field
    })

    setEnrolForm(prev => ({
      ...prev,
      currentStep: enrolForm.currentStep + 1,
      studentData: processedData,
    }))

    setWishlist(prev => ({
      ...prev,
      wishlistItems: prev.wishlistItems.map(item => {
        return {
          ...item,
          enrollForm: {
            ...item.enrollForm,
            studentData: processedData,
          },
        }
      }),
      currentStep: prev.currentStep + 1,
    }))

    // enrolCourseScrollAction(currentTheme)
  }

  const formInstance = useForm({
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  const oldForm = sessionStorage.getItem('old-form')

  const handleAutoFill = (form: Record<string, any>[]) => {
    if (!oldForm && fields.length > 0) {
      // Only save old-form if fields have been initialized (not empty)
      sessionStorage.setItem(
        'old-form',
        JSON.stringify({ registrationForm, fields, formValue: formInstance.watch() })
      )
      hasInitialStateSavedRef.current = true
    }
    setRegistrationForm(form.map(o => ({ ...o, isDisabled: true })))
    setFields(prev => {
      // If fields haven't been initialized yet, wait for them to be set
      if (prev.length === 0) {
        return prev
      }
      return prev.map(field => {
        const found = form.find(f => {
          return (
            onlyAlphaNumericAndSpace(f.question?.toLowerCase()) ===
            onlyAlphaNumericAndSpace(field.question?.toLowerCase())
          )
        })
        if (found) {
          return { ...field, isDisabled: true }
        }
        return field
      })
    })
    setIsAutoFillModalOpen(false)
  }

  const { numberOfApplicant } = enrolForm

  const [showInfoDialog, setShowInfoDialog] = useState(false)

  return (
    <div className="box-col-full items-start">
      <div className="box-col-full sm:box-row-full items-end">
        <Heading className="w-fit">{t('enrol:customFieldStep.fillDetail')}</Heading>
        {FEATURE_FLAGS.AUTO_FILL && (
          <div className="box-row-full items-center justify-end gap-0">
            <AutoFillDialog setRegistrationForm={handleAutoFill} selectedClass={selectedClass} />
            {oldForm && (
              <InfoDialog
                key={'refill-form'}
                title={t('enrol:refillConfirm.title')}
                description={t('enrol:refillConfirm.description')}
                trigger={
                  <Button
                    data-testid="auto-fill-button"
                    variant="textPrimary"
                    iconBefore={<LucideRefreshCcw />}
                    className="text-primary hover:text-primary-highlight shrink-0"
                  >
                    {t('enrol:autoFillForm.resetAllFields')}
                  </Button>
                }
                open={showInfoDialog}
                setOpen={setShowInfoDialog}
              >
                <div>
                  <div className="mt-4 flex justify-end gap-3">
                    <Button variant="outlined" onClick={() => setShowInfoDialog(false)}>
                      {t('common:action.cancel')}
                    </Button>
                    <Button
                      className="flex gap-x-2"
                      onClick={() => {
                        try {
                          const parsedOldForm = JSON.parse(oldForm)
                          const {
                            registrationForm: savedRegistrationForm,
                            fields: savedFields,
                            formValue,
                          } = parsedOldForm

                          sessionStorage.removeItem('old-form')
                          hasInitialStateSavedRef.current = false

                          formInstance.reset()

                          formInstance.trigger()

                          setShowInfoDialog(false)
                          setIsAutoFillModalOpen(false)

                          // Restore registrationForm and remove isDisabled flag to make all fields editable
                          if (savedRegistrationForm !== undefined) {
                            const editableRegistrationForm = Array.isArray(savedRegistrationForm)
                              ? savedRegistrationForm.map(item => {
                                  const { isDisabled, ...rest } = item
                                  return rest
                                })
                              : savedRegistrationForm
                            setRegistrationForm(editableRegistrationForm)
                          } else {
                            // If no saved registrationForm, set to empty array to clear auto-filled data
                            setRegistrationForm([])
                          }

                          // Restore fields and remove isDisabled flag to make all fields editable
                          if (
                            savedFields !== undefined &&
                            Array.isArray(savedFields) &&
                            savedFields.length > 0
                          ) {
                            const editableFields = savedFields.map(field => {
                              const { isDisabled, ...rest } = field
                              return rest
                            })
                            setFields(editableFields)
                          }

                          // Restore form values if they exist
                          if (formValue !== undefined) {
                            formInstance.reset(formValue)
                          }
                        } catch (error) {
                          console.error('Error parsing old-form:', error)
                          // If parsing fails, just clear the old-form and reset
                          sessionStorage.removeItem('old-form')
                          hasInitialStateSavedRef.current = false
                          formInstance.reset()
                          // Clear auto-filled data and make all fields editable
                          setRegistrationForm([])
                          setFields(prev =>
                            prev.map(field => {
                              return field
                            })
                          )
                          setShowInfoDialog(false)
                          setIsAutoFillModalOpen(false)
                        }
                      }}
                    >
                      {t('common:action.confirm')}
                    </Button>
                  </div>
                </div>
              </InfoDialog>
            )}
          </div>
        )}
      </div>

      <Text>{t(applicationDescription.customField[classType as string])}</Text>

      <CustomFieldForm
        course={course}
        onSubmit={onSubmit}
        registrationForm={registrationForm}
        fields={fields}
        setFields={setFields}
        numberOfApplicant={numberOfApplicant}
        formInstance={formInstance}
      />
    </div>
  )
}

export default CustomFieldStep
