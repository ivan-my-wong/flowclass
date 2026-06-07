/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FaWhatsapp } from 'react-icons/fa'
import { LuMail } from 'react-icons/lu'

import { Spinner } from '@/components/Loaders/Spinner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardTitleIcon
} from '@/components/ui/Card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import ModalDialog from '@/components/ui/ModalDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import TextArea from '@/components/ui/TextAreaBase'
import {
  courseItemVariableOptions,
  customMessageOptions,
  defaultWhatsappTemplate,
  lessonItemVariableOptions,
} from '@/constants/whatsappTemplate'
import useCustomMessageData from '@/hooks/useCustomMessageData'
import useNavigateDialogPage from '@/hooks/useNavigateDialogPage'
import { CustomMessage } from '@/types/customMessage'
import { CustomMessageType } from '@/types/whatsappTemplate'

// import { countPlaceholder } from '@/utils/string'

const ManageCustomMessage = (): React.ReactElement => {
  const { t } = useTranslation()
  const {
    useGetCustomMessageById,
    useUpdateOrCreateCustomMessage,
    useGetPreparedData,
  } = useCustomMessageData()
  const [params] = useSearchParams()

  const [isEditWaMessage, setIsEditWaMessage] = useState(true)
  const { data: preparedData } = useGetPreparedData()

  const types = useMemo(() => preparedData?.data?.types, [preparedData?.data])
  const variables = useMemo(
    () => preparedData?.data?.variables,
    [preparedData?.data?.variables]
  )
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const repeaterTextAreaRef = useRef<HTMLTextAreaElement | null>(null)

  const customMessageId = useMemo(
    () => (params.get('id') ? Number(params.get('id')) : -1),
    [params]
  )

  const formData = useForm<CustomMessage>({
    defaultValues: {
      ...defaultWhatsappTemplate,
    },
  })
  const { data: detail, isLoading: isDetailLoading } =
    useGetCustomMessageById(customMessageId)
  const {
    mutateAsync: submitCreateOrUpdate,
    isLoading: isLoadingCreateOrUpdate,
  } = useUpdateOrCreateCustomMessage()
  const { isOpen, setIsOpen } = useNavigateDialogPage(
    '/custom-messages',
    () => {}
  )

  const syncVariableWithContent = (content: string): Record<string, string> => {
    // Read the variables from the content
    const variablesMatch = content.matchAll(/{{(.*?)}}/g)

    const variables: Record<string, string> = {}
    // Set the variables in the form
    // eslint-disable-next-line no-restricted-syntax
    for (const variable of variablesMatch) {
      const name = customMessageOptions.find(d => d.value === variable[0])?.name
      variables[variable[1] as string] = name
        ? t(name)
        : String(variable[0]).replace(/{{|}}/g, '')
    }
    return variables
  }
  const onSubmit: SubmitHandler<CustomMessage> = async (
    data: CustomMessage
  ) => {
    const variables = syncVariableWithContent(data.content)

    const payload = {
      ...data,
      variables,
    }
    if (detail?.data) {
      payload.id = detail.data.id
    }

    await submitCreateOrUpdate(payload)

    setIsOpen(false)
  }

  const onSelectMessage = (messageItem: CustomMessageType) => {
    const content = formData.getValues('content') || ''
    // formData.setValue('content', `${content}${messageItem.value}`)

    // Insert the message into the content at the cursor position
    if (textAreaRef.current) {
      const textarea = textAreaRef.current
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
      formData.setValue('content', newValue)

      // Move the cursor after the inserted character
      setTimeout(() => {
        textarea.setSelectionRange(
          startPos + char.length,
          startPos + char.length
        )
      }, 0)
    }
  }
  useEffect(() => {
    if (detail?.data) {
      formData.reset(detail.data)
    }
    return () => {
      formData.reset(defaultWhatsappTemplate)
    }
  }, [detail?.data, formData])
  const selectedType = formData.watch('type')
  const variablesOptions = useMemo(() => {
    const selectedTypeVariables = variables?.find(d => d.type === selectedType)
    const listVariables = (selectedTypeVariables?.variables || []).map(d => ({
      name: d.label,
      value: d.value,
    }))
    // Use Map to ensure unique variables
    const uniqueVariables = Array.from(
      new Map(listVariables.map(item => [item.value, item])).values()
    )
    return uniqueVariables
  }, [t, variables, selectedType, formData])

  const content = formData.watch('content')
  const emailNotification = formData.watch('emailNotification')
  const whatsappNotification = formData.watch('whatsappNotification')

  const hasCourseItems = content?.includes('{{courseItems}}')
  const hasLessonItems = content?.includes('{{lessonItems}}')
  const showRepeaterFormat = hasCourseItems || hasLessonItems

  const repeaterVariableOptions = useMemo(() => {
    if (hasCourseItems) return courseItemVariableOptions
    if (hasLessonItems) return lessonItemVariableOptions
    return []
  }, [hasCourseItems, hasLessonItems])

  const onSelectRepeaterVariable = (messageItem: CustomMessageType) => {
    const content = formData.getValues('repeaterFormat') || ''
    if (repeaterTextAreaRef.current) {
      const textarea = repeaterTextAreaRef.current
      const startPos = textarea.selectionStart ?? content.length
      const endPos = textarea.selectionEnd ?? content.length
      const char = messageItem.value
      const currentValue = content
      const newValue =
        currentValue.substring(0, startPos) +
        char +
        currentValue.substring(endPos, currentValue.length)
      formData.setValue('repeaterFormat', newValue)
      setTimeout(() => {
        textarea.setSelectionRange(
          startPos + char.length,
          startPos + char.length
        )
      }, 0)
    }
  }

  return (
    <>
      <ModalDialog
        title={
          t(
            detail
              ? 'customMessage:customMessage.editTemplate'
              : 'customMessage:customMessage.addTemplate'
          ) as string
        }
        open={isOpen}
        onOpenChange={() => setIsOpen(false)}
        formData={formData}
        dataTestId="custom-message-form"
        onSubmit={onSubmit as SubmitHandler<any>}
        className="max-w-screen md:!max-w-2xl"
        classBody="p-4"
        footer={
          <>
            <Button
              type="button"
              className="w-full md:w-1/2"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              {t('common:action:cancel')}
            </Button>
            <Button
              type="submit"
              loading={isLoadingCreateOrUpdate}
              disabled={!formData.formState.isValid}
              className="w-full md:w-1/2"
              data-testid="save-custom-message"
            >
              {t('common:action:save')}
            </Button>
          </>
        }
      >
        {isDetailLoading ? (
          <Spinner />
        ) : (
          <>
            <FormField
              control={formData.control}
              rules={{
                required: t('customMessage:form.nameRequired') as string,
              }}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('customMessage:form.name')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t(
                        'customMessage:form.namePlaceholder'
                      ).toString()}
                      data-testid="custom-message-name"
                    />
                  </FormControl>
                  <FormMessage className="text-warn" />
                </FormItem>
              )}
            />
            <FormField
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('customMessage:form.type')}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultValue="all"
                    disabled
                  >
                    <FormControl>
                      <SelectTrigger
                        className="w-full"
                        data-testid="custom-message-type"
                      >
                        <SelectValue
                          placeholder={t('customMessage:form.typePlaceholder')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {types?.map(d => (
                        <SelectItem key={d} value={d}>
                          {t(`customMessage:form.typeOptions.${d}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <CardTitleIcon
                    icon={<LuMail />}
                    title={t('customMessage:form.emailNotification')}
                    subTitle={<Switch checked={emailNotification} disabled />}
                  />
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <CardTitleIcon
                    icon={<FaWhatsapp />}
                    title={t('customMessage:form.whatsappNotification')}
                    subTitle={
                      <FormField
                        control={formData.control}
                        name="whatsappNotification"
                        render={({ field }) => (
                          <Switch
                            onCheckedChange={value => field.onChange(value)}
                            checked={field.value}
                          />
                        )}
                      />
                    }
                  />
                  {/* <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsEditWaMessage(!isEditWaMessage)}
                    dataTestId="edit-message"
                  >
                    {t('customMessage:form.editMessage')}
                  </Button> */}
                </CardTitle>
              </CardHeader>
              <CardDescription>
                {isEditWaMessage && (
                  <FormField
                    control={formData.control}
                    rules={{
                      required: t(
                        'customMessage:form.contentRequired'
                      ) as string,
                    }}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="p-4 pt-0">
                        <div className="flex flex-col gap-2">
                          <FormLabel required className="w-full">
                            {t('customMessage:form.content')}
                          </FormLabel>

                          <div className="flex flex-wrap gap-1">
                            {variablesOptions.map(item => (
                              <Badge
                                key={item.name}
                                variant="light"
                                className="cursor-pointer"
                                onClick={() => onSelectMessage(item)}
                                data-testid="content-variable"
                              >
                                {t(item.name)}{' '}
                                {/* {countPlaceholder(content, item.value)} */}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <FormControl>
                          <TextArea
                            {...field}
                            ref={textAreaRef}
                            placeholder={t(
                              'customMessage:form.contentPlaceholder'
                            ).toString()}
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
            {showRepeaterFormat && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t('customMessage:form.repeaterFormat')}
                  </CardTitle>
                </CardHeader>
                <CardDescription>
                  <FormField
                    control={formData.control}
                    name="repeaterFormat"
                    render={({ field }) => (
                      <FormItem className="p-4 pt-0">
                        <div className="flex flex-col gap-2">
                          <p className="text-xs text-gray-400">
                            {t('customMessage:form.repeaterFormatHint')}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {repeaterVariableOptions.map(item => (
                              <Badge
                                key={item.value}
                                variant="light"
                                className="cursor-pointer"
                                onClick={() => onSelectRepeaterVariable(item)}
                              >
                                {t(item.name)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <FormControl>
                          <TextArea
                            {...field}
                            ref={repeaterTextAreaRef}
                            placeholder={t(
                              'customMessage:form.repeaterFormatPlaceholder'
                            ).toString()}
                            rows={8}
                          />
                        </FormControl>
                        <FormMessage className="text-warn" />
                      </FormItem>
                    )}
                  />
                </CardDescription>
              </Card>
            )}
          </>
        )}
      </ModalDialog>
    </>
  )
}

export default ManageCustomMessage
