import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { changePassword } from '@/api/userProfile'
import TextInput from '@/components/Inputs/TextInput'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import ContentLayout from '@/layouts/ContentLayout'
import { styled } from '@/styles'
import { ChangePasswordProps } from '@/types/user'
import { validatePassword } from '@/utils/validate'

const Container = styled('div', {
  width: '100%',
  padding: '$6 $6 0 $6',
  borderRadius: '$2',
  backgroundColor: '$backgroundLayer2',
  boxShadow: '0 0 10px $colors$shadowColor',
  marginTop: '$4',
})

const Section = styled('div', {
  width: '100%',
  marginBottom: '$6',
})

const ChangePassword = (): JSX.Element => {
  const { t } = useTranslation()
  const [newPassword1, setNewPassword1] = useState('')
  const [newPassword2, setNewPassword2] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [isPasswordMatch, setPasswordValid] = useState(true)
  const [isStrongPassword, setIsStrongPassword] = useState(true)
  const [isWrongPassword, setIsWrongPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isPasswordEmpty, setPasswordEmpty] = useState<boolean[]>([
    true,
    true,
    true,
  ])

  const inputFields = [
    {
      label: t(`account:currentPassword`),
      value: oldPassword,
      onChange: (e: string) => {
        setOldPassword(e)
        if (e === '') {
          setPasswordEmpty(prevState => [true, prevState[1], prevState[2]])
        } else {
          setPasswordEmpty(prevState => [false, prevState[1], prevState[2]])
        }
      },
      emptyWarning: t(`account:errMessage.emptyCurrentPassword`),
    },
    {
      label: t(`account:newPassword`),
      value: newPassword1,
      onChange: (e: string) => {
        setNewPassword1(e)
        setPasswordValid(e === newPassword2) // Check if passwords match
        setIsStrongPassword(validatePassword(e)) // Check password strength
        if (e === '') {
          setPasswordEmpty(prevState => [prevState[0], true, prevState[2]])
        } else {
          setPasswordEmpty(prevState => [prevState[0], false, prevState[2]])
        }
      },
      emptyWarning: t(`account:errMessage.emptyNewPassword`),
    },
    {
      label: t(`account:confirmPassword`),
      value: newPassword2,
      onChange: (e: string) => {
        setNewPassword2(e)
        setPasswordValid(newPassword1 === e)
        if (e === '') {
          setPasswordEmpty(prevState => [prevState[0], prevState[1], true])
        } else {
          setPasswordEmpty(prevState => [prevState[0], prevState[1], false])
        }
      },
      emptyWarning: t(`account:errMessage.emptyNewPassword`),
    },
  ]
  const headerBackButton: HeaderBackButtonStatus = {
    title: t(`account:account`),
    mode: 'add',
  }

  const resetPassword = async (): Promise<void> => {
    setSubmitted(true)
    if (newPassword1 !== newPassword2) {
      toast.error(t(`account:errMessage.newPasswordNotMatch`), {
        position: 'top-right',
      })
    }
    const passwordAllNotEmpty = isPasswordEmpty.every(value => value === false)

    if (!validatePassword(newPassword1)) {
      setIsStrongPassword(false)
    }
    if (
      passwordAllNotEmpty &&
      isPasswordMatch &&
      validatePassword(newPassword1)
    ) {
      setPasswordEmpty([false, false, false])
      setIsStrongPassword(true)
      try {
        const obj: ChangePasswordProps = {
          password: oldPassword,
          newPassword: newPassword1,
        }
        const res = await changePassword(obj)
        if (res) {
          toast.success(t(`account:successMessage.updatePassword`), {
            position: 'top-right',
          })
          setIsWrongPassword(false)
        }
      } catch (error: any) {
        if (error.message === 'Request failed with status code 400') {
          toast.error(t(`account:errMessage.updatePassword`), {
            position: 'top-right',
          })
          setIsWrongPassword(true)
        } else {
          toast.error(t(`account:errMessage.incorrectPassword`), {
            position: 'top-right',
          })
        }
      }
    }
    setSubmitted(false)
  }

  return (
    <ContentLayout
      headerBackButton={headerBackButton}
      rightHeader={
        <Button
          onClick={() => {
            resetPassword()
          }}
          loading={submitted}
        >
          {t(`account:saveChanges`)}
        </Button>
      }
    >
      <Box direction="col" align="start" padding="base">
        <Heading>{t(`account:changePassword`)}</Heading>
        <Text>{t('account:changePasswordExplanation')}</Text>
        <Container>
          {inputFields.map(
            ({ label, value, onChange, emptyWarning }, index) => (
              <Section key={label}>
                <TextInput
                  key={label}
                  css={{ width: '100%' }}
                  id={label.toLowerCase()}
                  name={label.toLowerCase()}
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  label={label}
                  isError={
                    ((!isPasswordMatch || !isStrongPassword) && index !== 0) ||
                    (submitted && isPasswordEmpty[index]) ||
                    (isWrongPassword && index === 0)
                  }
                  type="password"
                  helperText={
                    submitted && isPasswordEmpty[index] ? emptyWarning : ''
                  }
                  boxProps={{ direction: 'column', align: 'flex-start' }}
                />
              </Section>
            )
          )}

          {!isStrongPassword && (
            <Box direction="col" className="text-secondary" align="start">
              {t(`account:errMessage.notStrongPassword`)}
              <ul>
                {/* <li>{t(`account:strongPassword.requirement1`)}</li> */}
                <li>{t(`account:strongPassword.requirement2`)}</li>
                <li>{t(`account:strongPassword.requirement3`)}</li>
                <li>{t(`account:strongPassword.requirement4`)}</li>
              </ul>
            </Box>
          )}
        </Container>
      </Box>
    </ContentLayout>
  )
}

export default ChangePassword
