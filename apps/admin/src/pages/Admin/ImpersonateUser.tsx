import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import apiClient from '@/api'
import LoadingButton from '@/components/Buttons/LoadingButton'
import { TextInput } from '@/components/Inputs/TextInput'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { LocalStorageKeys } from '@/constants/localStorageKeys'

const ImpersonateUser = (): JSX.Element => {
  const [identifier, setIdentifier] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { t } = useTranslation()

  const handleImpersonate = async () => {
    if (!identifier.trim()) {
      toast.error('Please enter an email or phone number')
      return
    }

    setIsLoading(true)
    try {
      const isEmail = identifier.includes('@')

      // 1. Request impersonation login token from backend
      const resToken = await apiClient.post({
        url: '/admin/auth/create-login-token',
        needAuth: true,
        data: isEmail
          ? { email: identifier.trim() }
          : { phone: identifier.trim() },
      })

      if (resToken.status !== 201) {
        throw new Error('User not found or permission denied')
      }
      const loginToken = resToken.data.data

      // 2. Exchange login token for target user's session tokens
      const resLogin = await apiClient.post({
        url: '/admin/auth/login-with-token',
        needAuth: true,
        data: { token: loginToken },
      })

      if (resLogin.status !== 201) {
        throw new Error('Failed to exchange login token')
      }
      const { accessToken, refreshToken } = resLogin.data.data

      // 3. Backup current administrator's credentials
      const originalAccess = localStorage.getItem(
        LocalStorageKeys.UserAccessToken
      )
      const originalRefresh = localStorage.getItem(
        LocalStorageKeys.UserRefreshToken
      )

      if (originalAccess) {
        localStorage.setItem('impersonator-access-token', originalAccess)
      }
      if (originalRefresh) {
        localStorage.setItem('impersonator-refresh-token', originalRefresh)
      }

      // 4. Overwrite standard credentials with the impersonated user's tokens
      localStorage.setItem(LocalStorageKeys.UserAccessToken, accessToken)
      localStorage.setItem(LocalStorageKeys.UserRefreshToken, refreshToken)

      toast.success(`Successfully impersonating ${identifier}`)

      // 5. Force reload and redirect to dashboard with new session active
      window.location.href = '/'
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to impersonate user'
      toast.error(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '500px', width: '100%' }}>
      <Box direction="col" gap="lg">
        <Box direction="col" gap="sm">
          <Text css={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
            Impersonate User Account
          </Text>
          <Text css={{ color: '$textLight', fontSize: '0.875rem' }}>
            Enter a user&apos;s email address or phone number to impersonate
            their account. You will inherit all of their permissions. A global
            banner will appear at the top allowing you to return to your
            administrator account at any time.
          </Text>
        </Box>

        <Box direction="col" gap="lg">
          <TextInput
            id="impersonation-identifier"
            value={identifier}
            label="Email or Phone Number"
            placeholder="e.g. user@flowclass.co or +85291234567"
            onChange={e => setIdentifier(e.target.value)}
            disabled={isLoading}
          />

          <Box>
            <LoadingButton
              disabled={!identifier.trim() || isLoading}
              onClick={handleImpersonate}
              isLoading={isLoading}
              style={{ width: '100%' }}
            >
              Impersonate
            </LoadingButton>
          </Box>
        </Box>
      </Box>
    </div>
  )
}

export default ImpersonateUser
