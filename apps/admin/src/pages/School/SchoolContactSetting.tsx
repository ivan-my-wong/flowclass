import { ChangeEvent, ReactNode, useCallback, useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import { GtmEvent, setGtmEvent } from '@/api/external/gtmEvent'
import LabelInput from '@/components/Inputs/LabelInput'
import PhoneNumberInput from '@/components/Inputs/PhoneInput'
import { TextInput } from '@/components/Inputs/TextInput'
import AreaSelector from '@/components/Selector/AreaSelector'
import TextSearchSelector from '@/components/Selector/TextSearchSelector'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import ShadowBox from '@/components/ui/ShadowBox'
import { countryConfig } from '@/constants/countryConfig'
import { HongKong } from '@/constants/localities'
import useSchoolData from '@/hooks/useSchoolData'
import { useSchoolEditSave } from '@/hooks/useSchoolEditSave'
import { siteState } from '@/stores/siteData'
import { AddressDetail, PhoneContactMethod, School } from '@/types/school'
import { getCountryCodeFromConfig } from '@/utils/convert'
import { contactMethodIcon } from '@/utils/options'
import { validateEmail } from '@/utils/validate'

import SetPrimaryIdentifier from '../Contact/components/SetPrimaryIdentifier'

interface ContactProps {
  tabName: string
  allSaveMethods: any
}

const countries = countryConfig.map(obj => ({
  name: obj.name,
  code: obj.code,
  nativeName: obj.nativeName,
}))
const countryOptions = countries.map(option => ({
  value: option.code,
  name: option.name,
  label: `${option.nativeName} [${option.name}]`,
}))

type PhoneContactOptionType = {
  label: ReactNode
  value: string
}

const SchoolContactSetting = ({
  tabName,
  allSaveMethods,
}: ContactProps): JSX.Element => {
  const { currentSite } = useRecoilValue(siteState)
  const { t } = useTranslation()

  const [originalSchool, setOriginalSchool] = useState<School>()
  const { currentSchool, setCurrentSchool, setIsRegionLanguageUnsavedChanges } =
    useSchoolEditSave()

  useEffect(() => {
    if (currentSchool) {
      setOriginalSchool(currentSchool)
    }
  }, [])

  useEffect(() => {
    if (!currentSchool || !originalSchool) return
    if (
      currentSchool?.phone !== originalSchool?.phone ||
      currentSchool?.email !== originalSchool?.email ||
      currentSchool?.contactId !== originalSchool?.contactId ||
      currentSchool?.phoneContactMethod !==
        originalSchool?.phoneContactMethod ||
      JSON.stringify(currentSchool?.address) !==
        JSON.stringify(originalSchool?.address)
    ) {
      setIsRegionLanguageUnsavedChanges(true)
    } else {
      setIsRegionLanguageUnsavedChanges(false)
    }
  }, [currentSchool])

  const { useUpdateSchool } = useSchoolData()

  const createPhoneContactOptions = (): PhoneContactOptionType[] => {
    const options: PhoneContactOptionType[] = []
    Object.keys(PhoneContactMethod).forEach(method => {
      if (Object.prototype.hasOwnProperty.call(PhoneContactMethod, method)) {
        const value =
          PhoneContactMethod[method as keyof typeof PhoneContactMethod]
        options.push({
          label: (
            <Box>
              <div
                style={{
                  display: 'flex',
                  marginRight: '$5',
                  alignItems: 'center',
                }}
              >
                {contactMethodIcon(value)}
              </div>
              <Box
                justify="start"
                className="flex-grow-2 w-full md:justify-center"
              >
                <Text style={{ verticalAlign: 'top' }}> {value}</Text>
              </Box>
            </Box>
          ),
          value,
        })
      }
    })
    return options
  }
  const phoneContactOptions: PhoneContactOptionType[] =
    createPhoneContactOptions()

  const [contactMethodPreference, setContactMethodPreference] =
    useState<PhoneContactOptionType>(phoneContactOptions[0])

  useEffect(() => {
    if (currentSchool && currentSchool.phoneContactMethod) {
      const opt = phoneContactOptions.find(
        option => option.value === currentSchool.phoneContactMethod
      )
      setContactMethodPreference(opt ?? phoneContactOptions[0])
    } else {
      setContactMethodPreference(phoneContactOptions[0])
    }
  }, [])

  const updateSchoolResult = useUpdateSchool(currentSchool?.id ?? 0, true)

  const onSubmit = useCallback((): void => {
    if (!currentSchool) return
    if (currentSchool.phoneContactMethod === null) {
      currentSchool.phoneContactMethod = PhoneContactMethod.WhatsApp
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let updatedFields: any = {}
    Object.keys(currentSchool).forEach(key => {
      updatedFields[key] = currentSchool[key]
    })

    // wait backend fix the payload structure
    updatedFields = {
      ...updatedFields,
      description: currentSchool.description ?? [],
    }
    updateSchoolResult.mutateAsync(updatedFields).then(() => {
      setOriginalSchool(currentSchool)
      setIsRegionLanguageUnsavedChanges(false)
    })
  }, [currentSchool])

  useEffect(() => {
    allSaveMethods(tabName, onSubmit)
  }, [allSaveMethods, tabName, onSubmit])

  if (!currentSchool) return <></>

  const handlePhoneChange = (phone: string): void => {
    setCurrentSchool({ ...currentSchool, phone })
  }

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setCurrentSchool({ ...currentSchool, email: event.target.value })

    // Update GTM Tracking
    setGtmEvent({
      schoolId: currentSchool.id,
      event: GtmEvent.updateSchoolEmail,
    })
  }

  const handleContactIdChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setCurrentSchool({ ...currentSchool, contactId: event.target.value })
  }

  const handleAddressChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = event.target
    setCurrentSchool({
      ...currentSchool,
      address: {
        ...currentSchool.address,
        [id]: value,
      } as AddressDetail,
    })
  }

  const handleCountryChange = (value: string): void => {
    setCurrentSchool({
      ...currentSchool,
      address: {
        ...currentSchool.address,
        country: value,
        area: '',
      } as AddressDetail,
    })
  }

  const contactLinkLabel = () => {
    if (contactMethodPreference.value === PhoneContactMethod.Line) {
      return t('school:contact.lineId')
    }
    return t('school:contact.contactId')
  }
  const handleAreaChange = (value: string): void => {
    setCurrentSchool({
      ...currentSchool,
      address: {
        ...currentSchool.address,
        area: value,
      } as AddressDetail,
    })
  }

  const defaultCountry = countryOptions.find(obj => {
    return obj.name === currentSite?.country
  })

  return (
    <div className="box-col justify-between">
      <div className="shadow-box gap-4 justify-between">
        <LabelInput label={t('school:contact.phone')}>
          <PhoneNumberInput
            fullWidth
            country={getCountryCodeFromConfig(currentSite)}
            value={currentSchool.phone ?? ''}
            onChange={handlePhoneChange}
          />
        </LabelInput>
        <LabelInput label={t('school:contact.contactMethod')}>
          <TextSearchSelector
            onChange={(val: any) => {
              setContactMethodPreference(val)
              setCurrentSchool({
                ...currentSchool,
                phoneContactMethod: val.value,
              })
            }}
            selectOption={contactMethodPreference}
            options={phoneContactOptions}
            width="100%"
          />
        </LabelInput>
        {contactMethodPreference.value !== PhoneContactMethod.WhatsApp && (
          <TextInput
            id="contactId"
            type="text"
            value={currentSchool.contactId ?? ''}
            label={contactLinkLabel()}
            onChange={handleContactIdChange}
          />
        )}

        <TextInput
          id="email"
          type="email"
          value={currentSchool.email ?? ''}
          label={t('login:loginModal.email')}
          isError={
            currentSchool?.email !== null &&
            currentSchool?.email !== '' &&
            !validateEmail(currentSchool?.email ?? '')
          }
          helperText={
            currentSchool?.email !== null &&
            currentSchool?.email !== '' &&
            !validateEmail(currentSchool?.email ?? '')
              ? (t('login:errors.invalidEmail') as string)
              : ''
          }
          onChange={handleEmailChange}
        />
      </div>

      <ShadowBox
        id="addressBox"
        direction="col"
        align="start"
        gap="lg"
        padding="lg"
      >
        <Heading>{t(`school:contact.addressTitle`)}</Heading>
        <Text>{t(`school:contact.addressTips`)}</Text>
        <LabelInput label={t('school:contact.address.country')}>
          <TextSearchSelector
            onChange={(e: any) => {
              handleCountryChange(e.value)
            }}
            selectOption={
              countryOptions.find(obj => {
                return obj.value === currentSchool.address?.country
              }) ||
              defaultCountry ||
              ''
            }
            options={countryOptions}
            width="100%"
          />
        </LabelInput>
        <TextInput
          value={currentSchool.address?.state ?? ''}
          id="state"
          label={`${t('school:contact.address.state')} (${t(
            'common:description.ifApplicable'
          )})`}
          onChange={handleAddressChange}
        />
        {currentSchool.address?.country === HongKong ? (
          <LabelInput label={t('school:contact.address.area')}>
            <AreaSelector
              onValueChange={handleAreaChange}
              currentSelect={currentSchool.address?.area || ''}
            />
          </LabelInput>
        ) : (
          <TextInput
            value={currentSchool.address?.area ?? ''}
            id="area"
            label={t('school:contact.address.area')}
            onChange={handleAddressChange}
          />
        )}
        <TextInput
          value={currentSchool.address?.addressLine1 ?? ''}
          id="addressLine1"
          label={t('school:contact.address.addressLine1')}
          onChange={handleAddressChange}
        />
        <TextInput
          value={currentSchool.address?.addressLine2 ?? ''}
          id="addressLine2"
          label={t('school:contact.address.addressLine2')}
          onChange={handleAddressChange}
        />
      </ShadowBox>

      <SetPrimaryIdentifier />
    </div>
    // <TourGuide
    //   css={{ alignSelf: 'flex-start' }}
    //   tourGuideKey={TourGuideKeys.schoolContact}
    //   steps={getContactTourSteps()}
    //   icon
    //   autoStart={false}
    // />
  )
}
export default SchoolContactSetting
