import { forwardRef, useImperativeHandle, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Portal, Root, Title, Trigger } from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { createWebpageStyle } from '@/api/settingSite'
import { TextInput } from '@/components/Inputs/TextInput'
import { Spinner } from '@/components/Loaders/Spinner'
import { StyledContent, StyledOverlay } from '@/components/Popups/Modal'
import ModalCloseButton from '@/components/Popups/ModalCloseButton'
import Separator from '@/components/Separators/Separator'
import Text from '@/components/Texts/Text'
import { Button } from '@/components/ui/Button'
import { defaultThemeColor, WebsiteTemplate } from '@/constants/websiteTemplate'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import { WebpageInstitutionSettingProps } from '@/types/settingWebpageInstitution'
import { validateDomain } from '@/utils/validate'

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
            <Text className="mt-4">{t(`school:visitSchoolSite`)}</Text>
            <Text className="break-all leading-[1.25] underline">
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
