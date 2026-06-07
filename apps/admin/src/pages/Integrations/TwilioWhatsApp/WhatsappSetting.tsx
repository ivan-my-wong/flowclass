import { useMemo, useState } from 'react'

import { t } from 'i18next'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'
import { toast } from 'sonner'

import { sendWtsTestMessage } from '@/api/admin'
import { ApiError, handleApiError } from '@/api/errors/apiError'
import {
  createNotificationsSettingRecord,
  updateNotificationsSettingRecord,
} from '@/api/settingNotifications'
import { getListWhatsappTemplates } from '@/api/whatsappTemplate'
import AlertBox from '@/components/Boxes/AlertBox'
import LoadingButton from '@/components/Buttons/LoadingButton'
import PhoneNumberInput from '@/components/PhoneNumberInput/PhoneNumberInput'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import Form, {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { STALE_TIME } from '@/constants/common'
import { QUERY_KEY } from '@/constants/queryKey'
import useSchoolData from '@/hooks/useSchoolData'
import ContentLayout from '@/layouts/ContentLayout'
import {
  NotificationsSettingProps,
  NotificationsSettingUpdateProps,
} from '@/types/notifications'
import { WhatsappMessageType } from '@/types/whatsappMessage'
import { WhatsappTemplateStatus } from '@/types/whatsappTemplate'

import AlertPendingTemplate from '../../Setting/AlertPendingTemplate'

const WhatsappSetting = (): JSX.Element => {
  const { schoolData } = useSchoolData()
  const currentInstitutionId = schoolData.currentSchool?.id || 0
  const formData = useForm<WhatsappMessageType>({
    defaultValues: {
      siteId: 0,
      institutionId: currentInstitutionId,
      wtsApiToken: '',
      wtsApiSid: '',
      wtsApiPhoneNumber: '',
      studentPhone: '',
      templateId: '',
    },
  })
  const [hasWtsSettings, setHasWtsSettings] = useState(false)
  const [currentWtsSettingId, setCurrentWtsSettingId] = useState(0)

  const { useFetchCurrentSchoolNotificationsSetting } = useSchoolData()
  const { data: whatsappTemplates } = useQuery({
    queryKey: [QUERY_KEY.whatsappTemplate.whatsappTemplatesKey],
    queryFn: () => getListWhatsappTemplates(currentInstitutionId),
    staleTime: STALE_TIME,
  })

  useFetchCurrentSchoolNotificationsSetting(data => {
    setHasWtsSettings(data.id !== 0)
    setCurrentWtsSettingId(data.id ?? 0)

    if (data.id !== 0) {
      formData.reset({
        ...formData.getValues(),
        wtsApiToken: data.wtsApiToken,
        wtsApiSid: data.wtsApiSid,
        wtsApiPhoneNumber: data.wtsApiPhoneNumber,
      })
    }
  })

  const {
    mutateAsync: mutateSendTestMessage,
    isLoading: isLoadingSendTestMessage,
  } = useMutation({
    mutationFn: (data: WhatsappMessageType) => sendWtsTestMessage(data),
    onSuccess: () => {
      toast.success(t('setting:whatsappSetting.sendTestMsgSuccess'))
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (props: NotificationsSettingUpdateProps) =>
      !hasWtsSettings
        ? createNotificationsSettingRecord(currentInstitutionId, props)
        : updateNotificationsSettingRecord(
            currentInstitutionId,
            currentWtsSettingId,
            props
          ),
    onSuccess: (data: NotificationsSettingProps) => {
      if (data) {
        toast.success(t('setting:webpageSetting.updateSuccess'))
      } else {
        toast.error(t('setting:webpageSetting.updateError'))
      }
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  const updateWtsSetting: SubmitHandler<WhatsappMessageType> = async (
    data: WhatsappMessageType
  ) => {
    mutateAsync({
      wtsApiToken: data.wtsApiToken,
      wtsApiSid: data.wtsApiSid,
      wtsApiPhoneNumber: data.wtsApiPhoneNumber,
    })
  }

  const sendTestMessage: SubmitHandler<WhatsappMessageType> = async (
    data: WhatsappMessageType
  ) => {
    mutateSendTestMessage(data)
  }

  const selectedTemplateId = formData.watch('templateId')

  const selectedTemplate = useMemo(() => {
    return whatsappTemplates?.content?.find(t => t.id === +selectedTemplateId)
  }, [selectedTemplateId, whatsappTemplates?.content])

  const isDisabled = useMemo(() => {
    return (
      selectedTemplate?.status &&
      [
        WhatsappTemplateStatus.PENDING,
        WhatsappTemplateStatus.UNSUBMITTED,
        WhatsappTemplateStatus.REJECTED,
      ].includes(selectedTemplate?.status)
    )
  }, [selectedTemplate?.status])

  return (
    <ContentLayout
      headerBackButton={{
        title: t('integration:title'),
        mode: 'add',
      }}
      rightHeader={
        <LoadingButton
          type="button"
          name="saveWtsSetting"
          onClick={formData.handleSubmit(updateWtsSetting)}
          isLoading={isLoading}
        >
          {t(`setting:webpageSetting.save`)}
        </LoadingButton>
      }
    >
      <Form {...formData}>
        <form
          onSubmit={formData.handleSubmit(sendTestMessage)}
          className="w-full justify-start p-4"
        >
          <AlertBox
            content={t(`setting:whatsappSetting.settingHints`)}
            actionText={
              t(`setting:whatsappSetting.contactUsOnWhatsapp`) as string
            }
            actionLink="https://api.whatsapp.com/send/?phone=85257225763&text=I%20need%20help%20on%20connecting%20Twilio%20WhatsApp%20to%20Flowclass"
          />

          <Card className="flex flex-col max-w-full p-4 mt-4">
            <CardHeader>
              <CardTitle>
                {t(`whatsappTemplate:form.twilioIntegration`)}
              </CardTitle>
              <CardDescription>
                {t(`whatsappTemplate:form.twilioIntegrationDescription`)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FormField
                name="wtsApiToken"
                control={formData.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="w-full font-bold">
                      {t(`setting:whatsappSetting.wtsApiToken`)}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="password" showPasswordToggler />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="wtsApiSid"
                control={formData.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="w-full font-bold">
                      {t(`setting:whatsappSetting.wtsApiSid`)}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="wtsApiPhoneNumber"
                control={formData.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="w-full font-bold">
                      {t(`setting:whatsappSetting.phoneNumberSender`)}
                    </FormLabel>
                    <FormControl>
                      <PhoneNumberInput
                        country="hk"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* <ShadowBox className="flex-col gap-4 !items-start p-4"> */}
              <FormField
                name="studentPhone"
                control={formData.control}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="w-full font-bold">
                      {t(`setting:whatsappSetting.phoneNumberReceiver`)}
                    </FormLabel>
                    <FormControl>
                      <PhoneNumberInput
                        country="hk"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="templateId"
                control={formData.control}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="w-full font-bold">
                      {t(`setting:whatsappSetting.selectWhatsappTemplate`)}
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t(
                              'setting:whatsappSetting.selectWhatsappTemplate'
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {whatsappTemplates?.content?.map(item => (
                          <SelectItem
                            key={item.id}
                            value={item.id?.toString() || ''}
                            className="flex items-center gap-2 justify-between"
                          >
                            <Badge
                              variant={
                                item.status === WhatsappTemplateStatus.APPROVED
                                  ? 'success'
                                  : 'warning'
                              }
                              className="mr-2"
                            >
                              {item.status}
                            </Badge>
                            {t(item.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              {selectedTemplate &&
                selectedTemplate.status === WhatsappTemplateStatus.APPROVED && (
                  <>
                    <h3 className="font-bold">Template Variables</h3>
                    <span>Please input template variables</span>
                    {selectedTemplate.variables &&
                      Object.keys(selectedTemplate.variables).map(key => (
                        <FormField
                          key={key}
                          name={`variables.${key}`}
                          control={formData.control}
                          render={({ field }) => (
                            <FormItem className="flex items-center w-full">
                              <FormLabel className="w-full font-bold">
                                Sample input for variable {`{{${key}}}`}
                              </FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                  </>
                )}
              {isDisabled && (
                <AlertPendingTemplate
                  status={selectedTemplate?.status as WhatsappTemplateStatus}
                />
              )}
              {/* </ShadowBox> */}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                disabled={
                  isDisabled || !selectedTemplate || isLoadingSendTestMessage
                }
                loading={isLoadingSendTestMessage}
                onClick={formData.handleSubmit(sendTestMessage)}
              >
                {t(`setting:whatsappSetting.send`)}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </ContentLayout>
  )
}

export default WhatsappSetting
