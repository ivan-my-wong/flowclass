import React, { useState } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { FaCheckCircle } from 'react-icons/fa'
import { useMutation } from 'react-query'

import { sendEmailVerification } from '@/api/courseApi'
import Button from '@/components/Buttons/Button'
import TextInput from '@/components/Inputs/TextInput'
import { useCourseState } from '@/hooks/useCourse'
import { validateEmail } from '@/utils/validate'

interface DialogEnterEmailProps {
  onClose: () => void
  onSuccess?: () => void
}

const DialogEnterEmail: React.FC<DialogEnterEmailProps> = ({ onClose, onSuccess }) => {
  const { course } = useCourseState()
  const { t } = useTranslation('course')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const {
    mutateAsync: sendEmailVerificationMutateAsync,
    isLoading: isSendingEmail,
    isSuccess,
  } = useMutation((email: string) => sendEmailVerification({ courseId: course.id, email }))

  const handleSubmit = async () => {
    setError('')
    if (!validateEmail(email)) {
      setError(t('emailVerificationModal.invalidEmail'))
      return
    }
    try {
      await sendEmailVerificationMutateAsync(email)
      if (onSuccess) onSuccess()
    } catch (e) {
      setError(t('emailVerificationModal.error'))
    }
  }

  if (!isSuccess) {
    return (
      <div className="box-col-full mt-[-1rem] items-start gap-4">
        <TextInput
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t('emailVerificationModal.emailPlaceholder')}
          disabled={isSendingEmail}
          vertical
          label={t('emailVerificationModal.emailLabel')}
          helperText={error}
          isError={!!error}
        />

        <Button type="submit" isLoading={isSendingEmail} onClick={handleSubmit}>
          {t('emailVerificationModal.submit')}
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-backgroundLayer2 rounded-md p-5">
        <div className="flex items-center justify-center gap-x-2">
          <FaCheckCircle className="h-[45px] w-[45px] text-[#78A55A]" />
          <div className="text-sm">
            <h2>{t('emailVerificationModal.successTitle')}</h2>
            <p>{t('emailVerificationModal.successDescription')}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-x-2">
        <Button onClick={onClose}>{t('emailVerificationModal.close')}</Button>
      </div>
    </div>
  )
}

export default DialogEnterEmail
