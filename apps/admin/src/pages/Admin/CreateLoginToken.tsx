import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import LoadingButton from '@/components/Buttons/LoadingButton'
import { TextInput } from '@/components/Inputs/TextInput'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import useAuth from '@/hooks/useAuth'

const CreateLoginToken = (): JSX.Element => {
  const { useCreateLoginTokenWithEmail } = useAuth()
  const [email, setEmail] = useState<string>()
  const [token, setToken] = useState<string>()
  const { t } = useTranslation()

  const handleCreateSuccess = (data: string) => {
    setToken(data)
    toast.success(`Login token created: ${data}`)
  }
  const { mutateAsync, isLoading } =
    useCreateLoginTokenWithEmail(handleCreateSuccess)

  return (
    <Box direction="col" gap="lg">
      <Box>
        <TextInput
          id="email"
          value={email}
          label="Create Login Token with email"
          onChange={e => setEmail(e.target.value)}
        />
        <LoadingButton
          disabled={!email || isLoading}
          onClick={() => {
            if (email) {
              mutateAsync(email)
            }
          }}
          isLoading={isLoading}
        >
          {t('common:action.create')}
        </LoadingButton>
      </Box>
      {token && (
        <>
          <Box>
            <Text>Token: </Text>
            <Text css={{ wordBreak: 'break-all' }}>{token}</Text>
          </Box>
          <Box>
            <Text>Login link</Text>
            <Text
              css={{ wordBreak: 'break-all' }}
            >{`${window.location.origin}/login?token=${token}`}</Text>
          </Box>
        </>
      )}
    </Box>
  )
}

export default CreateLoginToken
