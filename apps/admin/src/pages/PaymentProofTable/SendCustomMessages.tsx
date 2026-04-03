import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import ModalDialog from '@/components/ui/ModalDialog'
import TextArea from '@/components/ui/TextArea'
import usePaymentEvidenceData from '@/hooks/usePaymentEvidenceData'
import {
  PaymentProofTableItem,
  SendCustomMessage,
  StudentWithEnrollInfo,
} from '@/types/enrollCourse'
import { CustomMessageType } from '@/types/whatsappTemplate'

import ListStudentWithCourse from './components/ListStudentWithCourse'

type SendCustomMessagesProps = {
  selectedRows?: PaymentProofTableItem[]
  isOpen?: boolean
  onClose?: () => void
}

const SendCustomMessages = ({
  selectedRows: propSelectedRows,
  isOpen: propIsOpen,
  onClose: propOnClose,
}: SendCustomMessagesProps = {}) => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Support both modal mode (props) and route mode (location state)
  const isModalMode = propSelectedRows !== undefined
  const [isOpen, setIsOpen] = useState(propIsOpen ?? true)
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const { useSendInvoiceCustomMessage } = usePaymentEvidenceData()
  const {
    mutateAsync: sendInvoiceCustomMessage,
    isLoading,
    isSuccess,
  } = useSendInvoiceCustomMessage()

  const formData = useForm<SendCustomMessage>({
    defaultValues: {
      invoiceIds: [],
      message: '',
      variables: {},
    },
  })

  const variablesOptions = [
    {
      name: 'Student Phone',
      value: '[studentPhone]',
    },
    {
      name: 'Student Name',
      value: '[studentName]',
    },
    {
      name: 'Course Name',
      value: '[courseName]',
    },
    {
      name: 'Class Name',
      value: '[className]',
    },
    {
      name: 'Payment Amount',
      value: '[paymentAmount]',
    },
  ]

  const selectedRows = useMemo(() => {
    // In modal mode, use propSelectedRows
    if (isModalMode && propSelectedRows) {
      return propSelectedRows
    }

    // In route mode, try to get from navigation state
    const stateRows = (state as PaymentProofTableItem[]) || []

    // If no rows in state, try to get from sessionStorage
    if (stateRows.length === 0) {
      try {
        const savedRows = sessionStorage.getItem('paymentProofSelectedRows')
        if (savedRows) {
          return JSON.parse(savedRows) as PaymentProofTableItem[]
        }
      } catch (error) {
        console.error('Error parsing saved selected rows:', error)
        sessionStorage.removeItem('paymentProofSelectedRows')
      }
    }

    return stateRows
  }, [state, isModalMode, propSelectedRows])

  const users: StudentWithEnrollInfo[] = useMemo(
    () =>
      selectedRows
        .filter(d => !!d.userAlias)
        .map(row => ({
          ...row.userAlias,
          enrollInfo: row.enrollCourses.flatMap(
            enrollCourse => enrollCourse.enrollInto || []
          ),
          payAmount: Number(row.payAmount),
        })),
    [selectedRows]
  )

  const invoiceIds = useMemo(() => {
    return selectedRows.map(row => row.id)
  }, [selectedRows])

  useEffect(() => {
    formData.setValue('invoiceIds', invoiceIds)
  }, [invoiceIds, formData])

  const onSelectMessage = (messageItem: CustomMessageType) => {
    const content = formData.getValues('message') || ''
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
      formData.setValue('message', newValue)

      // Move the cursor after the inserted character
      setTimeout(() => {
        textarea.setSelectionRange(
          startPos + char.length,
          startPos + char.length
        )
      }, 0)
    }
  }
  const handleCancel = useCallback(() => {
    setIsOpen(false)
    // Clear the saved selected rows when canceling (only in route mode)
    if (!isModalMode) {
      sessionStorage.removeItem('paymentProofSelectedRows')
    }
    // Call onClose callback if in modal mode
    if (isModalMode && propOnClose) {
      propOnClose()
    }
  }, [setIsOpen, isModalMode, propOnClose])

  const handleSave: SubmitHandler<SendCustomMessage> = data => {
    sendInvoiceCustomMessage(data)
  }
  useEffect(() => {
    if (selectedRows.length === 0) {
      // Clear the saved selected rows when no rows are selected (only in route mode)
      if (!isModalMode) {
        sessionStorage.removeItem('paymentProofSelectedRows')
      }
      handleCancel()
    }
  }, [selectedRows.length, handleCancel, isModalMode])

  useEffect(() => {
    // Only navigate in route mode
    if (!isOpen && !isModalMode) {
      navigate('/application')
    }
  }, [isOpen, navigate, isModalMode])

  useEffect(() => {
    if (isSuccess) {
      // Clear the saved selected rows when successfully sending messages (only in route mode)
      if (!isModalMode) {
        sessionStorage.removeItem('paymentProofSelectedRows')
      }
      handleCancel()
    }
  }, [isSuccess, handleCancel, isModalMode])

  // Update isOpen when prop changes (for modal mode)
  useEffect(() => {
    if (propIsOpen !== undefined) {
      setIsOpen(propIsOpen)
    }
  }, [propIsOpen])

  return (
    <ModalDialog
      title={t('student:paymentProof.sendCustomMessages').toString()}
      open={isOpen}
      onOpenChange={setIsOpen}
      formData={formData}
      onSubmit={formData.handleSubmit(handleSave)}
      className="max-w-screen md:!max-w-2xl"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            {t('common:action.cancel')}
          </Button>
          <Button
            variant="default"
            type="submit"
            disabled={isLoading || !formData.formState.isValid}
            loading={isLoading}
          >
            {t('common:action.send')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-2 mt-4">
        <h3 className="text-sm text-gray-500 h-fit font-bold">List student</h3>
        <ListStudentWithCourse students={users} />
        <FormField
          control={formData.control}
          rules={{
            required: t('customMessage:form.contentRequired') as string,
          }}
          name="message"
          render={({ field }) => (
            <FormItem className="pt-0">
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
                  rows={7}
                />
              </FormControl>
              <FormMessage className="text-warn" />
            </FormItem>
          )}
        />
      </div>
    </ModalDialog>
  )
}

export default SendCustomMessages
