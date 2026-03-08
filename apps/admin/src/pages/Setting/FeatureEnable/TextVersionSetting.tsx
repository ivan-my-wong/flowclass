import { useEffect } from 'react'

import { t } from 'i18next'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import {
  createWebpageStyle,
  getWebpageStyle,
  updateWebpageStyle,
} from '@/api/settingSite'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import { Button } from '@/components/ui/Button'
import FormProvider, {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { QUERY_KEY } from '@/constants/queryKey'
import useSchoolData from '@/hooks/useSchoolData'
import useTextVersion from '@/hooks/useTextVersion'
import {
  TextVersion,
  UpdateWebpageInstitutionSettingProps,
} from '@/types/settingWebpageInstitution'

type FormValues = {
  textVersion: TextVersion
}
const TextVersionSetting = () => {
  const { changeTextVersion } = useTextVersion()
  const { useFetchCurrentSchool } = useSchoolData()
  const { data: currentSchoolData, isLoading: isGetCurrentSchoolLoading } =
    useFetchCurrentSchool()
  const {
    data: webpageStyle,
    refetch,
    isLoading: isGetWebpageStyleLoading,
    isError,
    isSuccess,
  } = useQuery(
    [QUERY_KEY.settings.getWebpageSettingSchoolKey, currentSchoolData?.id],
    () => getWebpageStyle(currentSchoolData?.id ?? 0),
    {
      enabled: !!currentSchoolData?.id,
    }
  )
  const {
    mutateAsync: createInstitutionSetting,
    isLoading: isCreateInstitutionSettingLoading,
  } = useMutation({
    mutationFn: (data: UpdateWebpageInstitutionSettingProps) =>
      createWebpageStyle(currentSchoolData?.id ?? 0, {
        textVersion: data.textVersion,
      }),
    onSuccess: () => {
      toast.success(t('setting:textVersion.updateSuccess'))
      refetch()
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  const { mutateAsync: handleUpdate, isLoading: isUpdateWebpageStyleLoading } =
    useMutation({
      mutationFn: (props: UpdateWebpageInstitutionSettingProps) =>
        updateWebpageStyle(webpageStyle?.id ?? 0, {
          ...props,
          institutionId: currentSchoolData?.id,
        }),
      onSuccess: () => {
        toast.success(t('setting:textVersion.updateSuccess'))
        refetch()
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })

  const form = useForm<FormValues>({
    defaultValues: {
      textVersion: webpageStyle?.textVersion ?? TextVersion.SCHOOL,
    },
  })

  useEffect(() => {
    if (webpageStyle?.textVersion) {
      form.setValue('textVersion', webpageStyle.textVersion)
    }
  }, [webpageStyle, form])

  const onSubmit = (data: FormValues) => {
    if (!webpageStyle) {
      createInstitutionSetting({
        textVersion: data.textVersion,
      })
    } else {
      handleUpdate({ textVersion: data.textVersion })
    }
    changeTextVersion(data.textVersion)
  }
  return (
    <>
      {(isGetCurrentSchoolLoading || isGetWebpageStyleLoading) && (
        <FullScreenLoading />
      )}
      {isError && (
        <FullScreenAlertBox text={t(`common:errors.UNKNOWN_ERROR`)} />
      )}
      {isSuccess && webpageStyle && (
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full flex flex-col"
          >
            <Button
              type="submit"
              className="w-fit self-end mb-2"
              disabled={
                isGetWebpageStyleLoading ||
                isUpdateWebpageStyleLoading ||
                isCreateInstitutionSettingLoading
              }
              loading={
                isUpdateWebpageStyleLoading || isCreateInstitutionSettingLoading
              }
            >
              {t(`setting:textVersion.update`)}
            </Button>
            <FormField
              control={form.control}
              name="textVersion"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-2xl font-bold">
                    {t(`setting:textVersion.textOption`)}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('setting:textVersion.placeholder')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={TextVersion.SCHOOL}>
                        {t('setting:textVersion.school')}
                      </SelectItem>
                      <SelectItem value={TextVersion.EVENT}>
                        {t('setting:textVersion.event')}
                      </SelectItem>
                      <SelectItem value={TextVersion.SERVICE}>
                        {t('setting:textVersion.service')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t(`setting:textVersion.hint`)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </FormProvider>
      )}
    </>
  )
}

export default TextVersionSetting
