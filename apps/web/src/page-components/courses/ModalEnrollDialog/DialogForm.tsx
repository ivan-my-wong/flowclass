import { useEffect } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { useForm } from 'react-hook-form'
import { MdLoop } from 'react-icons/md'

import Button from '@/components/Buttons/Button'
import Form from '@/components/Form'
import { useCourseState } from '@/hooks/useCourse'
import { useCheckCourseCompleted } from '@/hooks/useDialogEnroll'
import PhoneNumberField from '@/page-components/enrol/ApplicationFormSteps/PhoneNumberField'
import { handlePhoneInputChange } from '@/page-components/enrol/ApplicationFormSteps/RequiredFields'
import TextAnswerField from '@/page-components/enrol/ApplicationFormSteps/TextAnswerField'
import { CheckEnrollCompleted } from '@/types/enrol'
import { validateEmail } from '@/utils/validate'

const questionClassNames = 'raw-input-label mb-0 text-wrap'

export const enrollCompletedFormKey = 'enroll-completed-form'

type IProps = {
  setShowInfoDialog: (value: boolean) => void
  setStatusComplete: (value: boolean) => void
}
const DialogForm = ({ setShowInfoDialog, setStatusComplete }: IProps): JSX.Element => {
  const { t } = useTranslation()

  const { course } = useCourseState()

  const { mutateAsync: handleCheck, isLoading } = useCheckCourseCompleted()

  const formInstance = useForm<CheckEnrollCompleted>()

  const handleOnSubmit = async (data: CheckEnrollCompleted) => {
    const paylaod = { ...data, courseId: course.id }
    sessionStorage.setItem(enrollCompletedFormKey, JSON.stringify(paylaod))

    await handleCheck(paylaod).then(() => setStatusComplete(false))
  }

  useEffect(() => {
    const form = JSON.parse(sessionStorage.getItem(enrollCompletedFormKey) || '{}')
    if (form?.name) formInstance.reset(form)
  }, [])

  return (
    <Form {...formInstance}>
      <form onSubmit={formInstance.handleSubmit(handleOnSubmit)}>
        <TextAnswerField
          labelClass={questionClassNames}
          label={t('enrol:fieldData.Name')}
          required
          name="name"
          form={formInstance}
        />
        <TextAnswerField
          form={formInstance}
          name={'email'}
          labelClass={questionClassNames}
          label={t('enrol:fieldData.Email')}
          required
          rules={{
            required: t('errors:VALIDATE.FIELD_REQUIRED') as string,
            validate: value => {
              if (!validateEmail(value)) {
                return t('errors:VALIDATE.INVALID_EMAIL') as string
              }
              return undefined
            },
          }}
        />
        <PhoneNumberField
          name="phone"
          form={formInstance}
          labelClass={questionClassNames}
          label={t('enrol:fieldData.Phone')}
          required={true}
          rules={{
            required: t('errors:VALIDATE.FIELD_REQUIRED') as string,
            validate: value => {
              if (value) {
                return handlePhoneInputChange(value, t)
              }
              return undefined
            },
          }}
        />
        <div className="mt-4 flex justify-end gap-x-2">
          <Button variant="disabled" onClick={() => setShowInfoDialog(false)} disabled={isLoading}>
            {t('common:action.cancel')}
          </Button>
          <Button className="flex gap-x-2" type="submit" disabled={isLoading}>
            {isLoading && <MdLoop className="animate-spin" />}
            {t('common:action.submit')}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default DialogForm
