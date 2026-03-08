import React, { useCallback, useEffect, useRef, useState } from 'react'

import { LucideAlertCircle, LucideCheck, LucideDownload, LucideRefreshCcw } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { toast } from 'sonner'

import { enrolRecord } from '@/api/enrolApi'
import Button from '@/components/Buttons/Button'
import InfoDialog from '@/components/Popups/InfoDialog'
import { useLoginWithAliasPassword } from '@/hooks/useProfile'
import FormLogin from '@/page-components/profile/FormLogin'
import { useAuth } from '@/stores/auth'
import { useEnrolState } from '@/stores/enrolContext'
import { Class } from '@/types'
import { EnrolCourseData, EnrollmentRecord } from '@/types/enrol'
import { StudentLoginWithAliasPasswordDto } from '@/types/profile'

type AutofillDialogProps = {
  setRegistrationForm: (value: any) => void
  selectedClass?: Class
}
type ButtonState = 'normal' | 'loading' | 'success' | 'error' | 'needLogin'

const AutoFillDialog = ({
  setRegistrationForm,
  selectedClass,
}: AutofillDialogProps): JSX.Element => {
  const { t } = useTranslation()
  const { school } = useEnrolState()
  const { auth, setAuth } = useAuth()
  const [buttonState, setButtonState] = useState<ButtonState>('normal')
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [statusComplete, setStatusComplete] = useState<boolean | undefined>()
  const [hasTriedAutoLoad, setHasTriedAutoLoad] = useState(false)
  const isAutoLoadingRef = useRef(false)

  const { mutateAsync: handleLoginWithAliasPassword, isLoading: isLoginLoading } =
    useLoginWithAliasPassword()

  const { mutateAsync: fetchEnrolRecord, isLoading: isEnrolLoading } = useMutation({
    mutationFn: (payload: EnrollmentRecord) => enrolRecord(payload, selectedClass?.institutionId),
    onSuccess: (data: EnrolCourseData) => {
      if (!data?.registrationForm?.length) {
        toast.error(`${t('enrol:autoFillForm.noRecordFound')}`)
        return
      }

      setRegistrationForm(data.registrationForm)
      setButtonState('success')
      toast.success(`${t('enrol:autoFillForm.bookingFound')}`)
    },
    onError: (e: any) => {
      setButtonState('error')
      toast.error(`${t('errors:ENROL.RECORDNOTFOUND')}`)
    },
  })
  const formInstance = useForm<StudentLoginWithAliasPasswordDto>({
    defaultValues: {
      institutionId: school?.id || 0,
      phone: '',
      aliasPassword: '',
      name: '',
    },
  })

  useEffect(() => {
    if (auth?.firstName && auth?.phone) {
      formInstance.setValue('name', auth.firstName)
      formInstance.setValue('phone', auth.phone)
    }
  }, [auth, formInstance])

  useEffect(() => {
    if (
      auth?.firstName &&
      !hasTriedAutoLoad &&
      selectedClass?.courseId &&
      !isAutoLoadingRef.current
    ) {
      isAutoLoadingRef.current = true
      setHasTriedAutoLoad(true)
      setButtonState('loading')

      const autoFetchData = async () => {
        try {
          await fetchEnrolRecord({
            fullName: auth.firstName ?? '',
            email: auth.email ?? '',
            phone: auth.phone,
            courseId: selectedClass?.courseId ?? 0,
          })
        } catch (error) {
          console.error('Auto-fetch failed:', error)
          // Don't show error immediately, just make button available for manual retry
          setButtonState('normal')
        } finally {
          isAutoLoadingRef.current = false
        }
      }

      autoFetchData()
    }
  }, [auth.email, auth.firstName, auth.phone, hasTriedAutoLoad, selectedClass?.courseId])

  const handleLogin = useCallback(
    async (values: StudentLoginWithAliasPasswordDto) => {
      try {
        // First authenticate the user
        const result = await handleLoginWithAliasPassword({
          phone: values.phone,
          aliasPassword: values.aliasPassword,
          institutionId: school?.id || 0,
          name: values.name,
        })

        if (result.firstName) {
          setStatusComplete(true)

          // Set auth state
          const currentlyActiveChild = result.listChildren?.find(
            c => c.userAliasId === result.activeUserAliasId
          )

          if (currentlyActiveChild) {
            setAuth({ ...result, currentlyActiveChild })
          } else {
            setAuth(result)
          }

          // Close login dialog and fetch data
          setShowLoginDialog(false)
          setButtonState('loading')
          setHasTriedAutoLoad(true)
          isAutoLoadingRef.current = true

          // After successful login, fetch enrollment record
          await fetchEnrolRecord({
            fullName: result.firstName,
            email: result.email ?? '',
            phone: result.phone,
            courseId: selectedClass?.courseId ?? 0,
          })
        }
      } catch (error) {
        console.error('Login failed:', error)
        setStatusComplete(false)
        isAutoLoadingRef.current = false
      }
    },
    [handleLoginWithAliasPassword, school?.id, setAuth, fetchEnrolRecord, selectedClass?.courseId]
  )

  const handleRetrievePreviousApplication = useCallback(async () => {
    // If user is not logged in, show login dialog
    if (!auth?.firstName) {
      setButtonState('needLogin')
      setShowLoginDialog(true)
      return
    }

    // If user is logged in, directly fetch data
    setButtonState('loading')
    setHasTriedAutoLoad(true)

    try {
      await fetchEnrolRecord({
        fullName: auth.firstName,
        email: auth.email ?? '',
        phone: auth.phone,
        courseId: selectedClass?.courseId ?? 0,
      })
    } catch (error) {
      // If API call fails, might need re-authentication
      console.error('Failed to fetch data for logged in user:', error)
      const status = (error as any)?.response?.status
      if (status === 401 || status === 403) {
        setButtonState('needLogin')
        setShowLoginDialog(true)
      } else {
        setButtonState('error')
        // toast handled by onError
      }
    }
  }, [auth, fetchEnrolRecord, selectedClass?.courseId])

  const handleShowLoginDialog = (value: boolean) => {
    setStatusComplete(undefined)
    setShowLoginDialog(value)
    if (!value && buttonState === 'needLogin') {
      setButtonState('normal')
    }
  }

  if (!school) {
    return <></>
  }

  const contentDialog = () => {
    if (statusComplete === false) {
      return (
        <div className="box-col-full">
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <h3 className="mb-2 font-semibold text-red-900">
              {t('enrol:autoFillForm.loginFailed')}
            </h3>
            <p className="text-red-800">{t('enrol:autoFillForm.pleaseCheckCredentials')}</p>
          </div>
          <FormLogin
            form={formInstance}
            handleLogin={handleLogin}
            isLoading={isLoginLoading || isEnrolLoading}
            school={school}
          />
        </div>
      )
    }

    return (
      <FormLogin
        form={formInstance}
        handleLogin={handleLogin}
        isLoading={isLoginLoading || isEnrolLoading}
        school={school}
      />
    )
  }

  const getButtonProps = () => {
    switch (buttonState) {
      case 'loading':
        return {
          disabled: true,
          children: (
            <>
              <LucideRefreshCcw className="mr-2 animate-spin" />
              {t('enrol:autoFillForm.loading')}
            </>
          ),
          variant: 'textPrimary' as const,
        }
      case 'success':
        return {
          disabled: true,
          children: (
            <>
              <LucideCheck className="mr-2" />
              {t('enrol:autoFillForm.previousApplicationRetrieved')}
            </>
          ),
          variant: 'textPrimary' as const,
        }
      case 'error':
        return {
          disabled: false,
          children: (
            <>
              <LucideAlertCircle className="mr-2" />
              {t('enrol:autoFillForm.tryAgain')}
            </>
          ),
          variant: 'textPrimary' as const,
        }
      case 'needLogin':
      case 'normal':
      default:
        return {
          disabled: false,
          children: (
            <>
              <LucideDownload className="mr-2" />
              {t('enrol:autoFillForm.autoFill')}
            </>
          ),
          variant: 'textPrimary' as const,
        }
    }
  }
  const buttonProps = getButtonProps()

  return (
    <>
      <Button
        data-testid="auto-fill-button"
        onClick={handleRetrievePreviousApplication}
        className="text-primary hover:text-primary-highlight shrink-0 disabled:cursor-not-allowed"
        {...buttonProps}
      >
        {buttonProps.children}
      </Button>

      <InfoDialog
        key={'dialog-autofill-login'}
        title={t('enrol:autoFillForm.title')}
        description={t('enrol:autoFillForm.description')}
        trigger={<div />} // Empty trigger since we control open state
        open={showLoginDialog}
        setOpen={handleShowLoginDialog}
      >
        {contentDialog()}
      </InfoDialog>
    </>
  )
}

export default AutoFillDialog
