import { forwardRef, useImperativeHandle, useState } from 'react'

import { Portal, Root, Title, Trigger } from '@radix-ui/react-dialog'
import { debounce } from 'lodash-es'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import Button from '@/components/Buttons/Button'
import LabelInput from '@/components/Inputs/LabelInput'
import { TextInput } from '@/components/Inputs/TextInput'
import { Spinner } from '@/components/Loaders/Spinner'
import { StyledContent, StyledOverlay } from '@/components/Popups/Modal'
import ModalCloseButton from '@/components/Popups/ModalCloseButton'
import Separator from '@/components/Separators/Separator'
import Text from '@/components/Texts/Text'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { DEMO_EMAIL } from '@/constants/config'
import useSchoolData from '@/hooks/useSchoolData'
import { userState } from '@/stores/userData'
import { CopySchool, School } from '@/types/school'
import { validateEmail } from '@/utils/validate'

type DuplicateSchoolModalProps = {
  hidden?: boolean
}

export type DuplicateSchoolModalHandle = {
  handleOpenChange: () => void
}

const DuplicateSchoolModal = forwardRef<
  DuplicateSchoolModalHandle,
  DuplicateSchoolModalProps
>(({ hidden }, ref) => {
  const [user] = useRecoilState(userState)
  const { useCopySchool, useGetDemoSchool } = useSchoolData()

  const [demoEmail, setDemoEmail] = useState(DEMO_EMAIL)

  const isMasterAdmin = user.permissions.some(o => o.isMasterAdmin)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CopySchool>()

  const [open, setOpen] = useState<boolean>(false)

  const { t } = useTranslation()

  const handleOpenChange = () => {
    setOpen(!open)
    reset()
  }

  useImperativeHandle(ref, () => ({
    handleOpenChange,
  }))

  const { data: listSchool = [] } = useGetDemoSchool(demoEmail)

  const { mutateAsync: handleCopySchool, isLoading } = useCopySchool()

  const onSubmit = async (data: CopySchool) => {
    handleCopySchool(data).then(() => {
      handleOpenChange()
    })
  }

  return (
    <Root open={open} onOpenChange={handleOpenChange}>
      <Trigger asChild>
        <Button
          css={{ display: `${hidden ? 'none' : ''}` }}
          hidden={!isMasterAdmin}
        >
          {t(`school:copySchool`)}
        </Button>
      </Trigger>
      <Portal>
        <StyledOverlay />

        <StyledContent>
          <Title>{t(`school:basic.schoolToBeDuplicated`)}</Title>
          <Separator />
          <TextInput
            label={t(`school:basic.demoEmail`)}
            type="email"
            defaultValue={DEMO_EMAIL}
            onChange={debounce(e => setDemoEmail(e.target.value), 500)}
          />
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
                      <SelectItem key={row.id} value={row.id as any}>
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
          <TextInput
            label={t(`school:basic.clientEmail`)}
            type="email"
            isError={!!errors.email}
            helperText={errors.email?.message}
            {...register('email', {
              required: t('login:errors.required') as string,
              validate: (val: string) =>
                validateEmail(val) ||
                (t('login:errors.invalidEmail') as string),
            })}
          />
          <Button
            css={{
              marginTop: '1rem',
              width: 'fit-content',
              marginLeft: 'auto',
              height: '3rem',
            }}
            disabled={isLoading}
            onClick={handleSubmit(onSubmit)}
          >
            {isLoading ? <Spinner /> : t(`school:copySchool`)}
          </Button>
          <ModalCloseButton />
        </StyledContent>
      </Portal>
    </Root>
  )
})

export default DuplicateSchoolModal
