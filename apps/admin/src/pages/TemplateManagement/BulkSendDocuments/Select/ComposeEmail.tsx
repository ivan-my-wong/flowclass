import { useState } from 'react'

import { FaFileAlt } from 'react-icons/fa'
import { IoIosSend, IoMdCheckmarkCircleOutline } from 'react-icons/io'

import Label from '@/components/Inputs/Label'
import TextEditor from '@/components/Inputs/TextEditor'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Inputs/Input'
import { MediaFileDirectory } from '@/constants/MediaFileDirectory'
import useTemplateManagement from '@/hooks/useTemplateManagement'
import { StudentEnrolmentRecord } from '@/types/student'
import {
  BulkSendDocumentStatus,
  DocumentTemplate,
} from '@/types/templateManagement'

type ComposeEmailProps = {
  campaignId?: string
  name: string
  lessonDetails?: { courseId?: number; classId?: number }
  selectedStudents: StudentEnrolmentRecord[]
  selectedDocument?: DocumentTemplate
  setSendDocument: (v: boolean) => void
}

const ComposeEmail = (props: ComposeEmailProps) => {
  const {
    campaignId,
    name,
    setSendDocument,
    selectedDocument,
    selectedStudents,
    lessonDetails,
  } = props

  const [open, setOpen] = useState(false)
  const [openSuccess, setOpenSuccess] = useState(false)
  const [payload, setPayload] = useState({ emailSubject: '', emailBody: '' })

  const { useCreateBulkSendDocument } = useTemplateManagement()
  const { mutateAsync: handleCreate, isLoading } = useCreateBulkSendDocument()

  const handleClose = () => {
    setOpen(false)
  }
  const isDisabled =
    !name ||
    !selectedDocument ||
    !selectedStudents.length ||
    !!campaignId ||
    isLoading

  const handleSend = async () => {
    await handleCreate({
      title: name,
      emailBody: payload.emailBody,
      emailSubject: payload.emailSubject,
      documentId: selectedDocument?.id ?? 0,
      institutionId: selectedDocument?.institutionId ?? 0,
      recipients: selectedStudents.length,
      recipientIds: selectedStudents.map(s => s.id),
      status: BulkSendDocumentStatus.PENDING,
      courseId: lessonDetails?.courseId,
      classId: lessonDetails?.classId,
    }).then(() => {
      handleClose()
      setOpenSuccess(true)
      setSendDocument(true)
    })
  }

  return (
    <>
      <Button
        iconBefore={<IoIosSend />}
        onClick={() => setOpen(true)}
        disabled={isDisabled}
      >
        Send to {selectedStudents.length} Students
      </Button>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              Compose Email
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 space-y-4 mb-4">
            <div className="space-y-2">
              <Label>Email Subject</Label>
              <Input
                value={payload.emailSubject}
                onChange={e =>
                  setPayload(prev => ({
                    ...prev,
                    emailSubject: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Email Message</Label>
              <TextEditor
                style={{ height: '300px', maxHeight: '300px' }}
                isSimpleEditor
                content={payload.emailBody ?? null}
                imageDirectory={MediaFileDirectory.COURSE}
                onValueChange={value => {
                  setPayload(prev => ({
                    ...prev,
                    emailBody: value as string,
                  }))
                }}
              />
            </div>

            <div className="flex items-center gap-4 border border-primary-subtle bg-blue-100 rounded-lg p-4">
              <FaFileAlt className="text-2xl text-primary-subtle" />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-base text-primary-highlight">
                    Template: {selectedDocument?.name}
                  </h3>
                </div>
                <p className="text-sm text-primary-subtle mt-1">
                  Will be generated for {selectedStudents.length} students
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              iconBefore={<IoIosSend />}
              className="w-full sm:w-auto"
              onClick={() => handleSend()}
              disabled={
                !payload.emailSubject || !payload.emailBody || isDisabled
              }
            >
              {isLoading ? 'Sending...' : 'Send Documents'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openSuccess}
        onOpenChange={() => {
          setOpenSuccess(false)
          window.history.back()
        }}
      >
        <DialogContent className="max-w-md">
          <div className="text-center space-y-4 p-4 mt-4">
            <div className="bg-green-100 rounded-full p-4 inline-block">
              <IoMdCheckmarkCircleOutline className="text-4xl text-green-600 mx-auto" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Documents Sent Successfully!
            </h2>
            <p className="text-gray-600 text-sm">
              {selectedStudents.length} documents have been sent to the selected
              students.
            </p>

            <div className="bg-gray-50 border border-background-layer-3 rounded-md inline-block text-left px-6 py-4 mt-2 w-full">
              <div className="flex justify-between text-sm py-1">
                <span className="text-gray-500 font-medium">Template:</span>
                <span className="text-gray-800 font-semibold">
                  {selectedDocument?.name || 'No template selected'}
                </span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-gray-500 font-medium">Recipients:</span>
                <span className="text-gray-800 font-semibold">
                  {selectedStudents.length} students
                </span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-gray-500 font-medium">Delivery:</span>
                <span className="text-green-600 font-semibold">
                  Email + PDF Attachment
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => {
                setOpenSuccess(false)
                window.history.back()
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ComposeEmail
