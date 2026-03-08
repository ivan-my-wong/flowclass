import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { FaRegSave } from 'react-icons/fa'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import useTemplateManagement from '@/hooks/useTemplateManagement'
import ContentLayout from '@/layouts/ContentLayout'
import {
  DocumentTemplateStatus,
  DocumentTemplateType,
  TemplateBackgroundProps,
  TemplateFieldData,
} from '@/types/templateManagement'

import CenterCanvas from './CenterCanvas'
import LeftSidebar from './LeftSidebar'
import PreviewCertificate from './Preview'

const defaultBackground: TemplateBackgroundProps = {
  url: '',
  width: 800,
  height: 600,
}

const DocumentTemplatesDetails = () => {
  const { t } = useTranslation()

  const params = useParams()
  const templateId = params?.templateId as string | undefined

  const [name, setName] = useState('')
  const [fields, setFields] = useState<TemplateFieldData[]>([])
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [image, setImage] = useState<HTMLImageElement>()
  const [background, setBackground] =
    useState<TemplateBackgroundProps>(defaultBackground)

  const {
    useGetDocumentTemplateById,
    useCreateDocumentTemplate,
    useUpdateDocumentTemplate,
    useGetFieldsTemplate,
  } = useTemplateManagement()

  const { data: availableFields } = useGetFieldsTemplate()
  const { data: detail } = useGetDocumentTemplateById(+(templateId ?? 0))
  const { mutateAsync: handleCreate } = useCreateDocumentTemplate()
  const { mutateAsync: handleUpdate } = useUpdateDocumentTemplate()

  useEffect(() => {
    if (detail) {
      setName(detail.name || '')
      setFields(detail.fieldData || [])
      setBackground(detail.background || defaultBackground)
      const img = new Image()
      img.src = detail.background?.url || ''
      setImage(img)
      setSelectedFieldId((detail.fieldData ?? [])?.[0]?.id || null)
    }
  }, [detail])

  const handleSaveTemplate = async () => {
    // check mandatory fields
    const mandatoryFields =
      availableFields?.filter(field => field.required) ?? []
    if (mandatoryFields.length > 0) {
      const isValid = mandatoryFields.every(field => {
        return fields.some(f => f.name === field.name)
      })

      if (!isValid) {
        toast.error(t('templateManagement:errors.mandatoryFieldMissing'))
        return
      }
    }

    if (templateId) {
      // Update existing template
      await handleUpdate({
        id: +templateId,
        fieldData: fields,
        background,
        name,
      }).then(res => {
        if (res) window.history.back()
      })
    } else {
      // Create new template
      await handleCreate({
        name,
        status: DocumentTemplateStatus.ACTIVE,
        fieldData: fields,
        background,
        type: DocumentTemplateType.CERTIFICATE,
      }).then(res => {
        if (res) window.history.back()
      })
    }
  }

  const values = useMemo(() => {
    const result = {}
    availableFields?.forEach(field => {
      result[field.name] = field.example || ''
    })
    return result
  }, [fields, availableFields])

  return (
    <ContentLayout
      leftHeader={
        <div>
          <h1 className="text-xl font-bold">
            {t('templateManagement:certificateTemplatesEditor')}
          </h1>
        </div>
      }
      rightHeader={
        <div className="flex gap-2 mt-2">
          <PreviewCertificate
            background={background}
            fieldData={fields}
            values={values}
            image={image}
          />
          <Button
            iconBefore={<FaRegSave />}
            onClick={() => handleSaveTemplate()}
          >
            {t('templateManagement:buttons.saveTemplate')}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-12 gap-4 p-4 min-h-dvh w-full">
        <div className="col-span-3">
          <LeftSidebar
            name={name}
            setName={setName}
            image={image}
            setImage={setImage}
            fields={fields}
            setFields={setFields}
            selectedFieldId={selectedFieldId}
            setSelectedFieldId={setSelectedFieldId}
            background={background}
            setBackground={setBackground}
            availableFields={availableFields ?? []}
          />
        </div>

        <div className="col-span-9">
          <CenterCanvas
            image={image}
            setImage={setImage}
            fields={fields}
            setFields={setFields}
            selectedFieldId={selectedFieldId}
            setSelectedFieldId={setSelectedFieldId}
            background={background}
          />
        </div>
      </div>
    </ContentLayout>
  )
}

export default DocumentTemplatesDetails
