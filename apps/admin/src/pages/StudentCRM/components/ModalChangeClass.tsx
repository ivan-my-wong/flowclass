import { useState } from 'react'

import { UseFormHandleSubmit } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FaCopy } from 'react-icons/fa'
import { useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import WaitingButton from '@/components/Buttons/WaitingButton'
import PhoneNumberInput from '@/components/Inputs/PhoneInput'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { studentState } from '@/stores/studentData'

import WhatsappButton from './WhatsappButton'

type IProps = {
  open: boolean
  setOpen: (value: boolean) => void
  dataInput: {
    skipLink: string
    selectedCourseName: any
    selectedClassName: any
    displayPhone: string
  }
  handleSubmit: UseFormHandleSubmit<any>
  handleSendEmailClick: any
}

const ModalChangeClass = (params: IProps) => {
  const { open, setOpen, dataInput, handleSubmit, handleSendEmailClick } =
    params

  const { skipLink, selectedCourseName, selectedClassName, displayPhone } =
    dataInput

  const { t } = useTranslation()

  const { currentStudent } = useRecoilValue(studentState)

  const [isCoppied, setIsCoppied] = useState(false)

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogContent className="md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-left">
            {t('student:changeClass:title')}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div>
            <div className="bg-[#e6e6e6] p-3 rounded-lg">
              <div className="max-w-[80vw] md:max-w-[500px]">
                <a
                  href={skipLink}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="cursor-pointer break-words text-blue-500"
                >
                  {skipLink}
                </a>
              </div>
              <div className="flex gap-4 mt-4">
                <Button
                  onClick={e => {
                    try {
                      e.preventDefault()
                      navigator.clipboard.writeText(skipLink)
                      setIsCoppied(true)
                      setTimeout(() => setIsCoppied(false), 5000) // Reset isCoppied status after 5 seconds
                      toast.success(t('embed:code.linkCopied'))
                    } catch (err) {
                      toast.error('Failed to copy link')
                    }
                  }}
                  className="sm:mr-auto sm:mt-2"
                >
                  {isCoppied ? (
                    t('embed:code.copied')
                  ) : (
                    <div className="flex gap-1 items-center">
                      <FaCopy />
                      {t('embed:code.copy')}
                    </div>
                  )}
                </Button>
              </div>
            </div>
            <div className="w-full space-y-2 my-6">
              <div className="flex justify-between items-center gap-4">
                <div className="border border-gray-300 rounded-lg px-3 py-4 w-full">
                  {currentStudent?.email}
                </div>
                <WaitingButton
                  variants="outlined"
                  btnText={t('teachingService:sendEmail')}
                  onClick={handleSubmit(handleSendEmailClick)}
                  className="py-3 min-w-[110px] px-0"
                />
              </div>
              {currentStudent?.phone && (
                <div className="flex justify-between items-center gap-4">
                  <PhoneNumberInput
                    disabled
                    onChange={() => {}}
                    fullWidth
                    value={currentStudent.phone}
                    country="hk"
                  />
                  <div className="border-2 border-green-500 rounded-lg px-3 py-1 min-w-[110px] text-center">
                    <WhatsappButton
                      type="apply"
                      params={{
                        link: skipLink,
                        course: selectedCourseName as string,
                        class: selectedClassName as string,
                        studentName: currentStudent.fullName,
                      }}
                      phone={displayPhone ?? ''}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

export default ModalChangeClass
