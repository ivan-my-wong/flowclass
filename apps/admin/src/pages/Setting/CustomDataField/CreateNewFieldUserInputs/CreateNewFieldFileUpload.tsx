import { Dispatch, SetStateAction } from 'react'

import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import FileInput from '@/components/ui/FileInput'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/Form'
import { MediaFileDirectory } from '@/constants/MediaFileDirectory'

import { IFormInput } from '../CreateNewFieldComponent'

const CreateNewFieldFileUpload = ({
  form,
  uploadedFile,
  setUploadedFile,
}: {
  form: UseFormReturn<IFormInput>
  uploadedFile: string | undefined
  setUploadedFile: Dispatch<SetStateAction<string | undefined>>
}): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <FormField
      {...form.register('file')}
      control={form.control}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormControl>
            <FileInput
              croppable
              label={t('common:action:imageGuidance').toString()}
              field={field}
              form={form}
              imageUrl={uploadedFile}
              directory={MediaFileDirectory.CUSTOM_FORM}
              onFileUpload={setUploadedFile}
            />
          </FormControl>
          <FormMessage className="text-warn" />
        </FormItem>
      )}
    />
  )
}

export default CreateNewFieldFileUpload
