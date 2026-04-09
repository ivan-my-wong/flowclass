import { useEffect, useState } from 'react'

import { t } from 'i18next'
import { debounce } from 'lodash-es'
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
  useWatch,
} from 'react-hook-form'
import { LuExternalLink } from 'react-icons/lu'

import { TextInput } from '@/components/Inputs/TextInput'
import PhoneNumberInput from '@/components/PhoneNumberInput/PhoneNumberInput'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Card } from '@/components/ui/Card'
import { WhatsAppSupportLinks } from '@/constants/guides'
import useInstructors from '@/hooks/useInstructors'
import useSchoolData from '@/hooks/useSchoolData'
import useStudentData from '@/hooks/useStudentData'
import { IFormInput } from '@/pages/Setting/CustomDataField/CreateNewFieldComponent'
import { StudentPrimaryIdentifier } from '@/types/school'
import { UserAlias } from '@/types/studentMemo'
import { formatPhoneNumber } from '@/utils/misc'

import { ErrorField } from './createTeachingService'

type PersonalInformationFormProps = {
  register: UseFormRegister<any>
  errors: FieldErrors<IFormInput>
  control?: Control<any>
  disabled?: boolean
  isTeachingService?: boolean
  isPhoneEditable: boolean
  isCreateStudent?: boolean
  institutionId?: number
  onPhoneConflictChange?: (conflict: boolean) => void
}

const PersonalInformationForm = ({
  register,
  errors,
  control,
  disabled = false,
  isPhoneEditable = false,
  isCreateStudent = false,
  institutionId,
  onPhoneConflictChange,
}: PersonalInformationFormProps): JSX.Element => {
  const { currentSchool } = useSchoolData()
  const { useGetInstructors } = useInstructors()
  const { data: staffList, isLoading: isStaffListLoading } = useGetInstructors()

  const isRequireSetting = {
    name: true,
    phone: true,
    email:
      currentSchool?.studentPrimaryIdentifier ===
      StudentPrimaryIdentifier.EMAIL,
  }
  const [hasPhoneConflict, setHasPhoneConflict] = useState(false)
  const phoneValue = useWatch({ control, name: 'phone' }) as string

  const normalizePhone = (phone: string) => formatPhoneNumber(phone)

  useEffect(() => {
    const currentInstitutionId = institutionId ?? currentSchool?.id
    if (!currentInstitutionId || isStaffListLoading) {
      setHasPhoneConflict(false)
      onPhoneConflictChange?.(true)
      return
    }

    const normalizedPhone = normalizePhone(phoneValue)
    if (!phoneValue || !normalizedPhone) {
      setHasPhoneConflict(false)
      onPhoneConflictChange?.(false)
      return
    }

    const conflict = !!staffList?.some(
      s =>
        s.institutionId === currentInstitutionId &&
        (s.isInstructor ||
          s.isInstitutionManager ||
          s.isSiteManager ||
          s.isMasterAdmin) &&
        normalizePhone(s.user?.phone || '') === normalizedPhone
    )

    setHasPhoneConflict(conflict)
    onPhoneConflictChange?.(conflict)
  }, [
    phoneValue,
    staffList,
    currentSchool?.id,
    institutionId,
    isStaffListLoading,
  ])

  const { useGetStudentsByPhone } = useStudentData()
  const { mutateAsync: handleGetStudentsByPhone } = useGetStudentsByPhone()

  const [student, setStudent] = useState<UserAlias>()

  if (!control) {
    return <></>
  }

  return (
    <Box direction="col" gap="base" padding="0">
      <Box direction="col" padding="0">
        <div className="flex items-center justify-start w-full gap-2">
          <Text bold>{t('student:create.phone')}</Text>
          {isRequireSetting.phone && <p className="text-warn font-bold">*</p>}
        </div>

        <Controller
          name="phone"
          control={control}
          rules={{
            required:
              isRequireSetting.phone && `${t('student:create.phoneRequired')}`,
          }}
          render={({ field: { onChange, value } }) => (
            <PhoneNumberInput
              country="hk"
              onChange={debounce(async (phone: string) => {
                onChange(phone)
                if (phone && isCreateStudent) {
                  try {
                    const students = await handleGetStudentsByPhone(phone)
                    if (students.length > 0) setStudent(students[0])
                    else setStudent(undefined)
                  } catch (error) {
                    console.error('Failed to fetch student by phone:', error)
                    setStudent(undefined)
                  }
                }
              }, 1000)}
              disabled={disabled || !isPhoneEditable}
              value={value}
            />
          )}
        />
        {hasPhoneConflict && (
          <Card className="w-full mt-2 p-3">
            <div className="text-sm">
              <p className="font-semibold">
                {t('teachingService:phoneConflict')}
              </p>
              <p>{t('teachingService:phoneConflictDescription')}</p>
            </div>
          </Card>
        )}
        {!isPhoneEditable && (
          <>
            <p
              className="text-xs text-left w-full max-w-full cursor-pointer hover:underline text-primary"
              onClick={() => {
                window.open(
                  WhatsAppSupportLinks.changeStudentPhone +
                    encodeURIComponent(control._formValues.phone),
                  '_blank'
                )
              }}
            >
              <LuExternalLink />
              {t('student:create.phoneTooltip')}
            </p>
          </>
        )}

        {errors.phone?.type === 'required' && (
          <div className="absolute text-[#ff4d4f] -bottom-6 left-0 text-sm">
            {t('student:create.phoneRequired')}
          </div>
        )}
      </Box>
      {!!student && isCreateStudent && (
        <div className="border border-background-layer-3 rounded-sm p-3 w-full bg-white flex gap-2">
          <div className="h-[20px] min-w-[20px] rounded-full bg-black" />
          <div className="space-y-1 text-sm">
            <div className="font-bold">
              A student exists with this phone number
            </div>
            <div>
              A <b>sub-account</b> will be created, which is linked to the
              following account:
            </div>
            <div>Name: {student?.name}</div>
            <div>Email: {student?.email ?? '-'}</div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-start w-full gap-2">
        <Text bold>{t('student:create.nameAlias')}</Text>
        {isRequireSetting.name && <p className="text-warn font-bold">*</p>}
      </div>
      <Box direction="col" padding="0">
        <TextInput
          id="alias"
          disabled={disabled}
          vertical
          {...register('alias', { required: true, maxLength: 200 })}
        />
      </Box>
      {errors.name?.type === 'required' && (
        <div className="absolute text-[#ff4d4f] -bottom-6 left-0 text-sm">
          {t('student:create.nameRequired')}
        </div>
      )}
      <Box direction="col" padding="0">
        <div className="flex items-center justify-start w-full gap-2">
          <Text bold>{t('student:create.email')}</Text>
          {isRequireSetting.email && <p className="text-warn font-bold">*</p>}
        </div>
        <TextInput
          id="email"
          vertical
          disabled={disabled}
          {...register('email', {
            required:
              isRequireSetting.email && `${t('student:create.emailRequired')}`,
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: t('student:create.emailFormat'),
            },
            maxLength: 200,
          })}
        />

        {errors.email && (
          <div className="absolute text-[#ff4d4f] -bottom-6 left-0 text-sm">
            {errors.email.message}
          </div>
        )}
      </Box>
      <Box direction="col" padding="0">
        <div className="flex items-center justify-start w-full gap-2">
          <Text bold>{t('student:create.secondaryEmail')}</Text>
        </div>
        <TextInput
          id="secondaryEmail"
          vertical
          disabled={disabled}
          {...register('secondaryEmail', {
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: t('student:create.emailFormat'),
            },
            maxLength: 200,
          })}
        />
        {errors.secondaryEmail && (
          <ErrorField>{(errors.secondaryEmail as any).message}</ErrorField>
        )}
      </Box>
    </Box>
  )
}

export default PersonalInformationForm
