import { forwardRef, useImperativeHandle, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Content,
  Overlay,
  Portal,
  Root,
  Title,
  Trigger,
} from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { createWebpageStyle } from '@/api/settingSite'
import { TextInput } from '@/components/Inputs/TextInput'
import { Spinner } from '@/components/Loaders/Spinner'
import ModalCloseButton from '@/components/Popups/ModalCloseButton'
import Separator from '@/components/Separators/Separator'
import Text from '@/components/Texts/Text'
import { Button } from '@/components/ui/Button'
import { defaultThemeColor, WebsiteTemplate } from '@/constants/websiteTemplate'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import { keyframes, styled } from '@/styles'
import { WebpageInstitutionSettingProps } from '@/types/settingWebpageInstitution'
import { validateDomain } from '@/utils/validate'

export const StyledOverlay = styled(Overlay, {
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  position: 'fixed',
  inset: 0,
})

export const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(.1)' },
  '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
})

export const StyledContent = styled(Content, {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '$background',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: '90%',
  minWidth: '50%',
  maxHeight: '90vh',
  overflowY: 'auto',
  borderRadius: '$medium',
  padding: '$4',
  gap: '$4',
  boxShadow: `$shadows[1]`,
  zIndex: '$modalContent',
  animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  '@sm': {
    minWidth: '90%',
  },
})

type AddSchoolModalProps = {
  hidden?: boolean
}

export type AddSchoolModalHandle = {
  handleOpenChange: () => void
}

const AddSchoolModal = forwardRef<AddSchoolModalHandle, AddSchoolModalProps>(
  ({ hidden }, ref) => {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm()
    const [schoolName, setSchoolName] = useState<string>('')
    const [url, setUrl] = useState<string>('')
    const [open, setOpen] = useState<boolean>(false)
    const { useCreateSchool } = useSchoolData()
    const { siteData } = useSiteData()

    const { mutateAsync, isLoading } = useCreateSchool(
      siteData.currentSite?.id || 0,
      setOpen
    )

    const { t } = useTranslation()
    const navigate = useNavigate()
    const handleOpenChange = () => {
      setOpen(!open)
      setSchoolName('')
      setUrl('')
    }

    useImperativeHandle(ref, () => ({
      handleOpenChange,
    }))

    const { mutateAsync: createInstituionSetting } = useMutation<
      WebpageInstitutionSettingProps,
      ApiError,
      any
    >(
      (data: { institutionId: number; templates: string }) => {
        return createWebpageStyle(data.institutionId, {
          templates: data.templates,
          themeColor: defaultThemeColor,
        })
      },
      {
        onSuccess: async (data: WebpageInstitutionSettingProps) => {
          return data
        },

        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
      }
    )
    const onSubmit = async () => {
      if (!siteData.currentSite?.id) return
      const result = await mutateAsync({
        name: schoolName,
        url,
      })
      await createInstituionSetting({
        institutionId: result.id,
        templates: WebsiteTemplate.Hero,
      })
      toast.success(t('component:select.createSchool'))

      await navigate('/')
      setOpen(false)
    }

    const customLink = `https://${
      siteData.currentSite?.url
    }/@${encodeURIComponent(url ?? '')}`

    // const handleButtonClick = () => {
    //   if (!siteData.currentSite?.id) return
    //   mutateAsync({
    //     name: schoolName,
    //     url,
    //   })
    // }

    return (
      <Root open={open} onOpenChange={handleOpenChange}>
        <Trigger asChild>
          <Button className={hidden ? 'hidden' : ''}>
            {t('school:addSchool')}
          </Button>
        </Trigger>
        <Portal>
          <StyledOverlay />

          <StyledContent>
            <Title>{t(`school:addSchoolModalTitle`)}</Title>
            <Separator />
            <TextInput
              label={t(`school:basic.schoolName`)}
              value={schoolName}
              id="name"
              isError={!!errors.schoolName}
              {...register('schoolName', {
                required: t('login:errors.required') as string,
                onChange: e => {
                  setSchoolName(e.target.value)
                },
              })}
            />
            <TextInput
              value={url}
              placeholder={t('school:basic.website') as string}
              id="url"
              label={t('school:basic.website')}
              isError={!!errors.url}
              helperText={errors.url?.message as string}
              {...register('url', {
                required: t('login:errors.required') as string,
                validate: (value: string) => {
                  return (
                    validateDomain(value) ||
                    (t('onboarding:errors.invalidDomain') as string)
                  )
                },
                onChange: e => {
                  setUrl(e.target.value)
                },
              })}
            />
            <Text css={{ marginTop: '$4' }}>{t(`school:visitSchoolSite`)}</Text>
            <Text
              css={{
                wordBreak: 'break-all',
                lineHeight: 1.25,
                textDecoration: 'underline',
              }}
            >
              {customLink}
            </Text>
            <Button
              className="mt-4 w-fit ml-auto h-12"
              disabled={isLoading}
              onClick={handleSubmit(onSubmit)}
            >
              {isLoading ? <Spinner /> : t('school:addSchool')}
            </Button>
            <ModalCloseButton />
          </StyledContent>
        </Portal>
      </Root>
    )
  }
)

export default AddSchoolModal
