import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import { getUserProfile, updateUserProfile } from '@/api/userProfile'
import LabelInput from '@/components/Inputs/LabelInput'
import PhoneNumberInput from '@/components/Inputs/PhoneInput'
import TextInput from '@/components/Inputs/TextInput'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { countryOptions } from '@/constants/countryConfig'
import ContentLayout from '@/layouts/ContentLayout'
import { siteState } from '@/stores/siteData'
import { defaultUserState } from '@/stores/userData'
import { styled } from '@/styles'
import { UserState } from '@/types/user'

const Container = styled('div', {
  width: '100%',
  padding: '$6 $6 0 $6',

  borderRadius: '$2',
  backgroundColor: '$backgroundLayer2',
})

const Section = styled('div', {
  width: '100%',
  marginBottom: '$6',
})

const ProfilePage = (): JSX.Element => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [profile, setProfile] = useState<UserState>(defaultUserState)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [position, setPosition] = useState('')
  const [unSavedChanges, setUnSavedChanges] = useState(false)

  const loadProfile = async (): Promise<void> => {
    const res = await getUserProfile()
    setProfile(res)
    setEmail(res.email)
    setFirstName(res.firstName)
    setLastName(res.lastName)
    setCompany(res.company != null ? res.company : '')
    setPhone(res.phone != null ? res.phone : '')
    setPosition(res.position != null ? res.position : '')
  }

  const updateProfile = async (): Promise<void> => {
    const userProfile = {
      email,
      firstName,
      lastName,
      firebaseId: profile.firebaseId,
      company,
      phone,
      country: profile.country,
      position,
    }
    try {
      await updateUserProfile(userProfile)
      toast.success(t(`account:successMessage.updateProfile`), {
        position: 'top-right',
      })
    } catch (error) {
      toast.error(t(`account:errMessage.updateProfile`), {
        position: 'top-right',
      })
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const inputFields = [
    { label: t(`account:firstName`), value: firstName, onChange: setFirstName },
    { label: t(`account:lastName`), value: lastName, onChange: setLastName },
    { label: t(`account:company`), value: company, onChange: setCompany },
    { label: t(`account:position`), value: position, onChange: setPosition },
  ]
  const headerBackButton: HeaderBackButtonStatus = {
    title: t(`account:account`),
    mode: 'add',
  }

  const { currentSite } = useRecoilValue(siteState)

  const defaultCountry = countryOptions.find(obj => {
    return obj.name === currentSite?.country
  })
  return (
    <ContentLayout
      headerBackButton={headerBackButton}
      rightHeader={
        <Box>
          {unSavedChanges && <Text>{t(`account:haveUnSavedChanges`)}</Text>}
          <Button
            onClick={() => {
              updateProfile()
              setUnSavedChanges(false)
            }}
          >
            {t(`account:saveChanges`)}
          </Button>
        </Box>
      }
    >
      <Box justify="start" direction="col" padding="lg">
        {/* <Heading>{t(`account:updateProfile`)}</Heading> */}
        <Container>
          <form action="" method="POST">
            <Section>
              <TextInput
                disabled
                label={t(`account:email`)}
                name="email"
                value={email}
                placeholder={email}
              />
            </Section>
            <Section>
              <LabelInput label={t(`account:phone`)}>
                <PhoneNumberInput
                  fullWidth
                  country={defaultCountry?.value?.toLocaleLowerCase() ?? 'hk'}
                  value={phone}
                  onChange={setPhone}
                />
              </LabelInput>
            </Section>

            {inputFields.map(({ label, value, onChange }) => (
              <Section key={label}>
                <TextInput
                  key={label}
                  css={{ width: '100%' }}
                  id={label.toLowerCase()}
                  name={label.toLowerCase()}
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  label={label}
                />
              </Section>
            ))}
          </form>
        </Container>
      </Box>
    </ContentLayout>
  )
}

export default ProfilePage
