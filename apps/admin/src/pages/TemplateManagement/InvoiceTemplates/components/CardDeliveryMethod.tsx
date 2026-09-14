/* eslint-disable prettier/prettier */
import { FC, useEffect, useMemo, useRef } from 'react'

import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FaWhatsapp } from 'react-icons/fa'
import { LuMail } from 'react-icons/lu'

import { WhatsAppConnectionStatus } from '@/api/whatsappWeb'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardTitleIcon,
} from '@/components/ui/Card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Switch } from '@/components/ui/Switch'
import TextArea from '@/components/ui/TextAreaBase'
import useCustomMessageData from '@/hooks/useCustomMessageData'
import useSchoolData from '@/hooks/useSchoolData'
import { useWhatsappWeb } from '@/hooks/useWhatsappWeb'
import WhatsappConnection from '@/pages/CustomMessages/components/WhatsappConnection'
import { SupportedType } from '@/types/customMessage'
import { StudentPrimaryIdentifier } from '@/types/school'
import { NotificationChannel, VariableItem } from '@/types/studentInvoice.type'
import { cn } from '@/utils/cn'

import TemplateOptions from '../TemplateOptions'

type Props = {
  channel?: NotificationChannel
  name: string
  subjectName?: string
  switchName?: string
  withSwitch?: boolean
  isRequired?: boolean
  module?: 'invoiceCampaign' | 'material' | 'studentSubmission'
}

const CardDeliveryMethod: FC<Props> = ({
  channel,
  name,
  subjectName,
  switchName,
  withSwitch,
  isRequired,
  module,
}) => {
  const { t } = useTranslation(['invoiceCampaign'])
  const form = useFormContext()
  const messageInputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(
    null
  )
  const isEmail = useMemo(
    () => channel === NotificationChannel.Email,
    [channel]
  )
  const watchedAll = useWatch({ control: form.control })
  const isEnabled = switchName
    ? Boolean((watchedAll as Record<string, unknown>)?.[switchName])
    : true

  const onSelectMessage = (messageItem: VariableItem) => {
    const tempName = isEmail ? subjectName : name
    if (!tempName) return
    const content = form.getValues(tempName) || ''
    // formData.setValue('content', `${content}${messageItem.value}`)
    // Insert the message into the content at the cursor position
    if (messageInputRef?.current) {
      const textarea = messageInputRef.current
      const startPos = textarea.selectionStart ?? content.length
      const endPos = textarea.selectionEnd ?? content.length
      const char = messageItem.value
      // Get current value of textarea
      const currentValue = content

      // Insert character at the cursor position
      const newValue =
        currentValue.substring(0, startPos) +
        char +
        currentValue.substring(endPos, currentValue.length)

      // Update state and the textarea value
      form.setValue(tempName, newValue, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })

      // Move the cursor after the inserted character
      setTimeout(() => {
        textarea.setSelectionRange(
          startPos + char.length,
          startPos + char.length
        )
      }, 0)
    }
  }
  const whatsappPlaceholder = useMemo(() => {
    if (module === 'material') {
      return t('setting:whatsappSetting.sendMaterialPlaceholder') as string
    }
    if (module === 'studentSubmission') {
      return t(
        'setting:whatsappSetting.sendStudentSubmissionPlaceholder'
      ) as string
    }
    return t('editor.send.contentPlaceholder') as string
  }, [module, t])

  const { useGetSessionStatus } = useWhatsappWeb()
  const {
    data: whatsappSessionStatus,
    isLoading: isWhatsappSessionStatusLoading,
    refetch: refetchSessionStatus,
  } = useGetSessionStatus()

  const { currentSchool } = useSchoolData()
  const { useFetchCustomMessageData } = useCustomMessageData()
  const { data: customMessagesData } = useFetchCustomMessageData()

  // Get the default WhatsApp message from custom messages
  const defaultWhatsAppMessage = useMemo(() => {
    if (!customMessagesData?.data) return null
    const enrollmentMessage = customMessagesData.data.find(
      msg => msg.type === SupportedType.STUDENT_NOTIF_AFTER_ENROLLMENT_SUBMITTED
    )
    return enrollmentMessage?.content || null
  }, [customMessagesData?.data])

  // Check if WhatsApp is ready/connected
  const isWhatsAppReady = useMemo(() => {
    return (
      whatsappSessionStatus?.data?.status === WhatsAppConnectionStatus.READY
    )
  }, [whatsappSessionStatus?.data?.status])

  // Set default values based on school settings and WhatsApp status
  useEffect(() => {
    if (!switchName) return

    if (isEmail) {
      // Email: default ON if primary identifier is EMAIL
      const shouldEnableEmail =
        currentSchool?.studentPrimaryIdentifier ===
        StudentPrimaryIdentifier.EMAIL
      if (shouldEnableEmail) {
        form.setValue(switchName, true, { shouldDirty: false })
      }
    }

    if (isWhatsAppReady) {
      // WhatsApp: default ON only if WhatsApp is ready/connected
      form.setValue(switchName, true, { shouldDirty: false })
    }
  }, [currentSchool?.studentPrimaryIdentifier, isWhatsAppReady])

  // Set default WhatsApp message content from custom message template
  useEffect(() => {
    if (isEmail || !name || !defaultWhatsAppMessage) return

    const currentContent = form.getValues(name)
    // Only set default if content is empty or undefined
    // This allows users to modify the default value
    if (!currentContent || currentContent.trim() === '') {
      form.setValue(name, defaultWhatsAppMessage, { shouldDirty: false })
    }
  }, [isEmail, name, defaultWhatsAppMessage, form])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <CardTitleIcon
            icon={isEmail ? <LuMail /> : <FaWhatsapp />}
            title={
              isEmail
                ? t('editor.emailNotification')
                : t('editor.whatsappNotification')
            }
            subTitle={
              withSwitch &&
              switchName && (
                <FormField
                  control={form.control}
                  name={switchName}
                  render={({ field }) => (
                    <Switch
                      onCheckedChange={value => field.onChange(value)}
                      checked={field.value}
                    />
                  )}
                />
              )
            }
          />
        </CardTitle>
      </CardHeader>
      <CardDescription className={cn(withSwitch && !isEnabled && 'hidden')}>
        {!isEmail && (
          <div className="p-4">
            <WhatsappConnection
              whatsappSessionStatus={whatsappSessionStatus}
              refetchSessionStatus={refetchSessionStatus}
              isWhatsappSessionStatusLoading={isWhatsappSessionStatusLoading}
            />
          </div>
        )}
        {/* {isEmail && subjectName && (
          <FormField
            control={form.control}
            rules={{
              required:
                isRequired ?? isEnabled
                  ? (t('editor.send.subjectRequired') as string)
                  : false,
            }}
            name={subjectName}
            render={({ field }) => (
              <FormItem className="p-4 pt-0">
                <div className="flex flex-col gap-2">
                  <FormLabel
                    required={Boolean(isRequired ?? isEnabled)}
                    className="w-full"
                  >
                    {t('editor.send.subject')}
                  </FormLabel>
                  {isEmail && (
                    <TemplateOptions onSelectMessage={onSelectMessage} />
                  )}
                </div>
                <FormControl>
                  <Input
                    {...field}
                    ref={el => {
                      messageInputRef.current = el
                      field.ref(el)
                    }}
                    placeholder={t('editor.send.subjectPlaceholder') as string}
                  />
                </FormControl>
                <FormMessage className="text-warn" />
              </FormItem>
            )}
          />
        )} */}
        {!isEmail && (
          <FormField
            control={form.control}
            rules={{
              required:
                isRequired ?? isEnabled
                  ? (t('customMessage:form.contentRequired') as string)
                  : false,
            }}
            name={name}
            render={({ field }) => (
              <FormItem className="p-4 pt-0">
                <div className="flex flex-col gap-2">
                  <FormLabel
                    required={Boolean(isRequired ?? isEnabled)}
                    className="w-full"
                  >
                    {t('editor.send.whatsappContent')}
                  </FormLabel>

                  <TemplateOptions
                    onSelectMessage={onSelectMessage}
                    module={module ?? 'invoiceCampaign'}
                  />
                </div>
                <FormControl>
                  <TextArea
                    {...field}
                    ref={el => {
                      messageInputRef.current = el
                      field.ref(el)
                    }}
                    placeholder={whatsappPlaceholder}
                    rows={15}
                  />
                </FormControl>
                <FormMessage className="text-warn" />
              </FormItem>
            )}
          />
        )}
      </CardDescription>
    </Card>
  )
}
export default CardDeliveryMethod
