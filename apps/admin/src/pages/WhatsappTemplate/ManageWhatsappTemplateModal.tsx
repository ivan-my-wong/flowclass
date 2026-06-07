/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import { Spinner } from '@/components/Loaders/Spinner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  FormControl,
  FormDescription,
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
import { supportedLanguages } from '@/constants/locales'
import {
  categoriesSupported,
  customMessageOptions,
  defaultWhatsappTemplate,
} from '@/constants/whatsappTemplate'
import useNavigateDialogPage from '@/hooks/useNavigateDialogPage'
import useWhatsappTemplateData from '@/hooks/useWhatsappTemplateData'
import { schoolState } from '@/stores/schoolData'
import { CustomMessageType, WhatsappTemplate } from '@/types/whatsappTemplate'

const ManageWhatsappTemplate = (): React.ReactElement => {
  const { t } = useTranslation()
  const schoolData = useRecoilValue(schoolState)

  const currentSchoolId = schoolData.currentSchool?.id || 0
  const {
    useFetchDetailWhatsappTemplate,
    useCreateWhatsappTemplate,
    useUpdateWhatsappTemplate,
  } = useWhatsappTemplateData()

  const [params] = useSearchParams()

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)

  const whatsappTemplateId = useMemo(
    () => (params.get('id') ? Number(params.get('id')) : -1),
    [params]
  )

  const formData = useForm<WhatsappTemplate>({
    defaultValues: {
      ...defaultWhatsappTemplate,
    },
  })
  const { data: detail, isLoading: isDetailLoading } =
    useFetchDetailWhatsappTemplate(whatsappTemplateId)
  const { mutateAsync: submitCreate, isLoading: isLoadingCreate } =
    useCreateWhatsappTemplate()
  const { mutateAsync: submitUpdate, isLoading: isLoadingUpdate } =
    useUpdateWhatsappTemplate()
  const { isOpen, setIsOpen } = useNavigateDialogPage(
    '/whatsapp-templates',
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
  const onSubmit: SubmitHandler<WhatsappTemplate> = async (
    data: WhatsappTemplate
  ) => {
    const variables = syncVariableWithContent(data.content)

    const payload = {
      ...data,
      variables,
      assignedTo: data.assignedTo ?? {},
      category: data.category ?? categoriesSupported[0].value,
      isDefault: data.isDefault ?? false,
    }

    if (detail) {
      await submitUpdate({
        whatsappTemplateId: detail.id as number,
        data: payload,
      })
    } else {
      await submitCreate(payload)
    }

    setIsOpen(false)
  }

  const onSelectMessage = (messageItem: CustomMessageType) => {
    const content = formData.getValues('content')
    // formData.setValue('content', `${content}${messageItem.value}`)

    // Insert the message into the content at the cursor position
    if (textAreaRef.current) {
      const textarea = textAreaRef.current
      const startPos = textarea.selectionStart
      const endPos = textarea.selectionEnd
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
    if (detail) {
      formData.reset({
        ...detail,
      })
    }
    return () => {
      formData.reset(defaultWhatsappTemplate)
    }
  }, [detail, formData])

  const isLoading = useMemo(
    () => isLoadingCreate || isLoadingUpdate,
    [isLoadingCreate, isLoadingUpdate]
  )

  const contentValue = formData.watch('content')

  const variablesOptions = useMemo(() => {
    const variables = Object.keys(syncVariableWithContent(contentValue || ''))
    return variables.map(d => ({
      name: t(d.replace(/{{|}}/g, '')),
      value: `{{${d}}}`,
    }))
  }, [contentValue, t])

  return (
    <ModalDialog
      title={
        t(
          detail ? 'whatsappTemplate:form.edit' : 'whatsappTemplate:form.add'
        ) as string
      }
      open={isOpen}
      onOpenChange={() => setIsOpen(false)}
      formData={formData}
      onSubmit={onSubmit as SubmitHandler<any>}
      className="max-w-screen lg:!max-w-2xl"
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
            loading={isLoading}
            disabled={!formData.formState.isValid}
            className="w-full md:w-1/2"
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
              required: t('whatsappTemplate:form.nameRequired') as string,
              validate: (value: string) => {
                // Only lowercase, number and underscore allowed
                return new RegExp(/^[a-z]*(?:[\d_]?[a-z]*)*$/).test(value)
              },
            }}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>
                  {t('whatsappTemplate:form.name')}
                </FormLabel>
                <FormDescription>
                  {t('whatsappTemplate:form.nameRequirements')}
                </FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t(
                      'whatsappTemplate:form.namePlaceholder'
                    ).toString()}
                  />
                </FormControl>
                <FormMessage className="text-warn" />
              </FormItem>
            )}
          />
          <FormField
            control={formData.control}
            rules={{
              required: t('whatsappTemplate:form.contentRequired') as string,
            }}
            name="content"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <FormLabel required className="w-full">
                    {t('whatsappTemplate:form.content')}
                  </FormLabel>

                  <div className="flex flex-wrap gap-1">
                    {variablesOptions.map(item => (
                      <Badge
                        key={item.name}
                        variant="light"
                        className="cursor-pointer"
                        onClick={() => onSelectMessage(item)}
                      >
                        {t(item.name)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <FormControl>
                  <TextArea
                    {...field}
                    ref={textAreaRef}
                    placeholder={t(
                      'whatsappTemplate:form.contentPlaceholder'
                    ).toString()}
                    rows={5}
                  />
                </FormControl>
                <FormMessage className="text-warn" />
              </FormItem>
            )}
          />

          <FormField
            name="isDefault"
            render={({ field }) => (
              <div className="w-full flex flex-col gap-4">
                <FormItem className="w-full flex justify-between items-center space-y-0">
                  <FormLabel className="w-2/3">
                    {t('whatsappTemplate:form.isDefault')}
                  </FormLabel>
                  <FormControl>
                    <Switch
                      {...field}
                      onCheckedChange={field.onChange}
                      checked={field.value}
                      className="shadow-md border-gray-100"
                    />
                  </FormControl>
                </FormItem>
                <span className="font-normal italic text-gray-500">
                  {t('whatsappTemplate:form.isDefaultDescription')}
                </span>
              </div>
            )}
          />
          <FormField
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('whatsappTemplate:form.language')}</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={t('whatsappTemplate:language.all')}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {supportedLanguages
                      .sort((a, b) => a.country.localeCompare(b.country))
                      .map(item => (
                        <SelectItem key={item.code} value={item.code}>
                          {item.country}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('whatsappTemplate:form.category')}</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={t('whatsappTemplate:category.utility')}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoriesSupported.map(item => (
                      <SelectItem key={item.name} value={item.value}>
                        {t(item.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </>
      )}
    </ModalDialog>
  )
}

export default ManageWhatsappTemplate
