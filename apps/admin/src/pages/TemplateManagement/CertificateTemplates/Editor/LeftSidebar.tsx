import { useRef } from 'react'

import { useTranslation } from 'react-i18next'
import { CiSettings } from 'react-icons/ci'
import { FiPlus } from 'react-icons/fi'
import { IoCloseSharp } from 'react-icons/io5'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

import DraggableFileInput from '@/components/ui/FileInput'
import { Input } from '@/components/ui/Inputs/Input'
import { MediaFileDirectory } from '@/constants/MediaFileDirectory'
import {
  FieldDocumentTemplate,
  TemplateBackgroundProps,
  TemplateFieldData,
} from '@/types/templateManagement'
import { getMediaFileUrl } from '@/utils/generate-link.utils'

type LeftSidebarProps = {
  name: string
  setName: (name: string) => void
  image: HTMLImageElement | undefined
  setImage: (image: HTMLImageElement) => void
  fields: TemplateFieldData[]
  setFields: (fields: TemplateFieldData[]) => void
  selectedFieldId: string | null
  setSelectedFieldId: (fields: string) => void
  background: TemplateBackgroundProps
  setBackground: (bg: TemplateBackgroundProps) => void
  availableFields: FieldDocumentTemplate[]
}

const LeftSidebar = (props: LeftSidebarProps) => {
  const {
    name,
    setName,
    image,
    setImage,
    fields,
    setFields,
    selectedFieldId,
    setSelectedFieldId,
    background,
    setBackground,
    availableFields,
  } = props

  const { t } = useTranslation()

  const inputRef = useRef<HTMLInputElement>(null)

  const handleUploadFile = (imageUrl: string) => {
    const image = new Image()
    image.src = getMediaFileUrl(imageUrl)
    setImage(image)

    image.onload = () => {
      setBackground({
        ...background,
        url: getMediaFileUrl(imageUrl),
        width: image.width,
        height: image.height,
      })
    }

    if (inputRef.current) inputRef.current.value = ''
  }

  const handleAddField = (field: FieldDocumentTemplate) => {
    if (!image) {
      toast.error(t('templateManagement:errors.imageIsEmpty'))
      return
    }
    const id = uuidv4()
    const newField: TemplateFieldData = {
      id,
      name: field.name,
      field: field.field,
      x: 100 + fields.length * 20,
      y: 100 + fields.length * 20,
      fontSize: 20,
      color: '#000000',
    }
    setFields([...fields, newField])
    setSelectedFieldId(id)
  }

  const handleDeleteField = (id: string) => {
    setFields(fields.filter(field => field.id !== id))
    if (selectedFieldId === id) setSelectedFieldId('')
  }

  const updateSelectedField = (changes: Partial<TemplateFieldData>) => {
    if (!selectedFieldId) return
    setFields(
      fields.map(field =>
        field.id === selectedFieldId ? { ...field, ...changes } : field
      )
    )
  }

  const { color, fontSize } = fields.find(
    field => field.id === selectedFieldId
  ) || { fontSize: 20, color: '#000000' }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-background-layer-3 rounded-lg p-4">
        <p className="text-sm font-semibold mb-2">Certificate Name</p>

        <Input
          type="text"
          placeholder="Enter certificate name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full"
          data-testid="certificate-name-input"
        />
      </div>

      <div className="bg-white border border-background-layer-3 rounded-lg p-4">
        <p className="text-sm font-semibold mb-2">Upload Template</p>

        <DraggableFileInput
          directory={MediaFileDirectory.SITE}
          imageUrl={image?.src}
          onFileUpload={handleUploadFile}
          classDropZone="w-full"
          croppable
        />
      </div>

      <div className="bg-white border border-background-layer-3 rounded-lg p-4">
        <p className="text-sm font-semibold mb-2">Available Fields</p>
        <div className="space-y-2">
          {availableFields.map((field, index) => (
            <button
              key={`field-${index}`}
              type="button"
              className="flex items-center justify-between text-sm bg-background-layer-2 rounded-md px-3 py-2 hover:bg-background-layer-3 cursor-pointer w-full"
              onClick={() => handleAddField(field)}
            >
              <span className="flex items-center gap-2">
                <span>{field.name}</span>
                {field.required && (
                  <span className="text-xs text-red-500 font-semibold bg-red-100 px-1 rounded">
                    Required
                  </span>
                )}
              </span>
              <FiPlus size={14} />
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-background-layer-3 rounded-lg p-4">
        <p className="text-sm font-semibold mb-2">
          Added Fields ({fields.length})
        </p>
        <div className="mt-4">
          {fields.length === 0 ? (
            <p className="text-gray-500 text-sm">No fields added yet</p>
          ) : (
            <ul className="space-y-2">
              {fields.map(field => (
                <li
                  key={field.id}
                  className={`flex items-center justify-between text-sm px-3 py-2 rounded-md cursor-pointer ${
                    selectedFieldId === field.id
                      ? 'bg-blue-100 text-primary'
                      : 'bg-background-layer-2 hover:bg-background-layer-3'
                  }`}
                  onClick={() => setSelectedFieldId(field.id)}
                >
                  <span>{field.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteField(field.id)}
                  >
                    <IoCloseSharp
                      size={16}
                      className="text-red-500 hover:text-red-700"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white border border-background-layer-3 rounded-lg p-4">
        <p className="text-sm font-semibold mb-4 border-b border-b-background-layer-3 pb-4">
          Field Properties
        </p>
        <div>
          {!!selectedFieldId && fields.length > 0 ? (
            <div>
              <div className="block text-sm">Font Size:</div>
              <Input
                type="number"
                className="mt-2"
                value={fontSize}
                onChange={e =>
                  updateSelectedField({ fontSize: Number(e.target.value) })
                }
              />

              <div className="block text-sm mt-4">Color:</div>
              <Input
                type="color"
                className="mt-2"
                value={color}
                onChange={e => updateSelectedField({ color: e.target.value })}
              />
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center text-gray-500">
              <CiSettings className="mx-auto text-4xl mb-2" />
              <p className="mt-2 text-sm">
                Select a field to edit its properties
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeftSidebar
