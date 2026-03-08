import { useState } from 'react'

import { debounce } from 'lodash-es'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import LabelInput from '@/components/Inputs/LabelInput'
import { TextInput } from '@/components/Inputs/TextInput'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { DEMO_EMAIL } from '@/constants/config'
import useSchoolData from '@/hooks/useSchoolData'
import { CopySchool, School } from '@/types/school'
import { validateEmail } from '@/utils/validate'

// admin/sites
// admin/institutions?siteId=1

const DuplicateSchool = (): JSX.Element => {
  const { t } = useTranslation()

  const { useCopySchool, useGetDemoSchool } = useSchoolData()

  const [demoEmail, setDemoEmail] = useState(DEMO_EMAIL)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CopySchool>()

  const { data: listSchool = [] } = useGetDemoSchool(demoEmail)

  const { mutateAsync: handleCopySchool, isLoading } = useCopySchool()

  const onSubmit = async (data: CopySchool) => {
    try {
      handleCopySchool(data).then(() => {
        reset({ email: demoEmail })
      })

      toast.success(t('school:copySchoolSuccess'))
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Box direction="col" gap="lg">
      <Box>
        <TextInput
          label={t(`school:basic.demoEmail`)}
          type="email"
          defaultValue={demoEmail}
          onChange={debounce(e => setDemoEmail(e.target.value), 500)}
        />
      </Box>
      <Box>
        <LabelInput label={t(`school:basic.demoSchool`)}>
          <div className="w-full">
            <Select
              {...register('institutionId', {
                required: t('login:errors.required') as string,
              })}
              onValueChange={value => {
                setValue('institutionId', +value)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {listSchool?.map((row: School) => {
                  return (
                    <SelectItem key={row.id} value={row.id.toString()}>
                      {row.name}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {!!errors.institutionId && (
              <Text size="small" type="error" css={{ color: '$warn' }}>
                {errors.institutionId?.message}
              </Text>
            )}
          </div>
        </LabelInput>
      </Box>
      <Box>
        <TextInput
          label={t(`school:basic.clientEmail`)}
          type="email"
          isError={!!errors.email}
          helperText={errors.email?.message}
          {...register('email', {
            required: t('login:errors.required') as string,
            validate: (val: string) =>
              validateEmail(val) || (t('login:errors.invalidEmail') as string),
          })}
        />
      </Box>

      <Box direction="col" align="end">
        <Button loading={isLoading} onClick={handleSubmit(onSubmit)}>
          {t(`school:copySchool`)}
        </Button>
      </Box>
    </Box>
  )
}

export default DuplicateSchool
