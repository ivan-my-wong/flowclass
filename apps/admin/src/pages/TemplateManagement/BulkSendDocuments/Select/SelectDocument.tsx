import { useState } from 'react'

import dayjs from 'dayjs'
import { FaFileAlt } from 'react-icons/fa'
import { IoMdAdd } from 'react-icons/io'

import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import useTemplateManagement from '@/hooks/useTemplateManagement'
import { DocumentTemplate } from '@/types/templateManagement'

type SelectDocumentsProps = {
  setSelectedDocument: (document?: DocumentTemplate) => void
}

const SelectDocuments = (props: SelectDocumentsProps) => {
  const { setSelectedDocument } = props

  const [open, setOpen] = useState(false)

  const { useGetDocumentTemplates } = useTemplateManagement()
  const { data: templates } = useGetDocumentTemplates()

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <Button iconBefore={<IoMdAdd />} size="sm" onClick={() => setOpen(true)}>
        Select
      </Button>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              Select Document Template
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 space-y-4 mb-4">
            {templates?.map(template => (
              <button
                key={template.id}
                type="button"
                className="flex items-center gap-4 border border-background-layer-3 rounded-lg p-4 bg-white hover:bg-gray-50 w-full"
                onClick={() => {
                  setSelectedDocument(template)
                  handleClose()
                }}
              >
                <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded">
                  <FaFileAlt className="text-2xl text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-base text-gray-800">
                      {template.name}
                    </h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full capitalize">
                      {template.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 text-left">
                    {template?.description}
                  </p>
                  <div className="text-xs text-gray-500 mt-2 space-x-4 text-left">
                    <span>Fields: {template.fieldData?.length}</span>
                    <span>Used: {template.campaigns?.length}</span>
                    <span>
                      Modified: {dayjs(template.updatedAt).format('YYYY/MM/DD')}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SelectDocuments
