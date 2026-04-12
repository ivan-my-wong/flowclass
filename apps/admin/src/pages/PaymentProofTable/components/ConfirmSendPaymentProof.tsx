import { Fragment, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import * as _ from 'lodash'
import { useTranslation } from 'react-i18next'
import { LuInfo } from 'react-icons/lu'

import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'
import { Switch } from '@/components/ui/Switch'
import { MAX_LIMIT_REMIND_STUDENT } from '@/constants/payment'
import usePaymentEvidenceData from '@/hooks/usePaymentEvidenceData'
import useStudentInvoice from '@/hooks/useStudentInvoice'
import usePlanData from '@/hooks/useSubscriptionPlanData'
import { PaymentProofTableItem } from '@/types/enrollCourse'
// import { Course } from '@/types/course'
// import { EnrollCourseInstance } from '@/types/enrollCourse'
import {
  ResendPaymentProofReminderDto,
  SendPaymentActions,
} from '@/types/paymentProof'
import { StudentEnrolmentRecord } from '@/types/student'
import { cn } from '@/utils/cn'
import { formatPhoneNumber } from '@/utils/misc'

import SendingMethod from './SendingMethod'

export interface ResendRecipients {
  id: number
  userId: number
  institutionId: number
  refUserId: number
  name: string
  email: string
  isPrimary: boolean
  isStudentParent: boolean
  childOfUserAliasId: number | null
  invoiceId: number
  proofToken: string
  phone: string
  isSendToParent: boolean
  parentData: StudentEnrolmentRecord | null
}
// type LocationState = {
//   id: string
//   proofToken: string
//   sendWhatsapp: {
//     phone: string
//     email: string
//   }
//   userAlias: {
//     email: string
//     name: string
//   }
//   enrollCourse: EnrollCourseInstance
//   course: Course
// }

type ConfirmSendPaymentProofProps = {
  action?: SendPaymentActions
  selectedRows?: PaymentProofTableItem[]
  isOpen?: boolean
  onClose?: () => void
}

const ConfirmSendPaymentProof = ({
  action: propAction,
  selectedRows: propSelectedRows,
  isOpen: propIsOpen,
  onClose: propOnClose,
}: ConfirmSendPaymentProofProps = {}): JSX.Element => {
  const { useGetAllStudents } = useStudentInvoice()
  const { data: studentList, isLoading: isLoadingStudentList } =
    useGetAllStudents()
  const [recipientList, setRecipientList] = useState<ResendRecipients[]>([])
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { state } = useLocation()
  const { t } = useTranslation()

  // Support both modal mode (props) and route mode (URL params)
  const isModalMode = propAction !== undefined
  const action = propAction ?? (params.get('action') as SendPaymentActions)
  const selectedRows =
    propSelectedRows ?? (state as PaymentProofTableItem[] | undefined)
  const [isOpen, setIsOpen] = useState(propIsOpen ?? true)
  const [isResendEmail, setResendEmail] = useState(true)
  const [isResendWa, setResendWa] = useState(false)
  const { useSendReminderPayment } = usePaymentEvidenceData()
  const { mutateAsync, isLoading } = useSendReminderPayment()

  const { schoolSubscription } = usePlanData()
  const { planQuotas } = schoolSubscription

  const isWhatsappReminder = useMemo(() => {
    return (
      action === SendPaymentActions.SEND_WA_REMINDER ||
      action === SendPaymentActions.SEND_WA_SUCCESS_PAYMENT
    )
  }, [action])

  const selectedActions = useMemo(() => {
    const actions: SendPaymentActions[] = []
    if (action === SendPaymentActions.RESEND_PAYMENT_REMINDER) {
      if (isResendEmail) {
        actions.push(SendPaymentActions.SEND_MAIL_REMINDER)
      }
      if (isResendWa) {
        actions.push(SendPaymentActions.SEND_WA_REMINDER)
      }
    }
    if (action === SendPaymentActions.RESEND_SUCCESS_PAYMENT_REMINDER) {
      if (isResendEmail) {
        actions.push(SendPaymentActions.SEND_SUCCESS_PAYMENT)
      }
      if (isResendWa) {
        actions.push(SendPaymentActions.SEND_WA_SUCCESS_PAYMENT)
      }
    }

    return actions
  }, [action, isResendEmail, isResendWa])

  const handleSubmit = async () => {
    const invoicesTemp = recipientList.map(item => {
      return {
        invoiceId: item.invoiceId,
        proofToken: item.proofToken,
        isSendToParent: item.isSendToParent,
      }
    })

    const payload = {
      ids: invoicesTemp.map(item => item.invoiceId),
      invoices: invoicesTemp,
    } as unknown as ResendPaymentProofReminderDto

    for (let index = 0; index < selectedActions.length; index++) {
      payload.action = selectedActions[index]
      await mutateAsync(payload)
    }
    setIsOpen(false)
    onBack()
  }

  const onBack = () => {
    setIsOpen(false)
    setTimeout(() => {
      document.querySelector('body')?.setAttribute('style', '')
    }, 500)
    if (isModalMode && propOnClose) {
      propOnClose()
    } else {
      navigate(-1)
    }
  }

  const title = useMemo(() => {
    if (action === SendPaymentActions.RESEND_PAYMENT_REMINDER) {
      return t(
        'student:paymentProof.confirmReminder.resendPaymentRecordReminder'
      )
    }
    return t(
      'student:paymentProof.confirmReminder.resendPaymentSuccessReminder'
    )
  }, [action, t])

  const isReachLimit = useMemo(() => {
    return recipientList.length > MAX_LIMIT_REMIND_STUDENT
  }, [recipientList])

  const isReachNotifQuota = false

  const isRecipientListLoading = useMemo(() => {
    const hasSelectedRows =
      selectedRows && Array.isArray(selectedRows) && selectedRows.length > 0
    // Loading if:
    // 1. Student list is still being fetched
    // 2. We have selected rows but studentList is not available yet
    // 3. We have selected rows and studentList but recipientList is still empty (processing)
    return (
      isLoadingStudentList ||
      (hasSelectedRows && !studentList) ||
      (hasSelectedRows &&
        studentList !== undefined &&
        studentList.length > 0 &&
        recipientList.length === 0)
    )
  }, [isLoadingStudentList, selectedRows, recipientList.length, studentList])

  const isRecipientListReady = useMemo(() => {
    return recipientList.length > 0 && !isRecipientListLoading
  }, [recipientList.length, isRecipientListLoading])

  const onUpdateSendToParent = (
    recipient: ResendRecipients,
    event: boolean
  ) => {
    const newRecipient = { ...recipient, isSendToParent: event }

    setRecipientList(prev => {
      const updated = [...prev]
      const index = updated.findIndex(item => item.id === recipient.id)
      if (index !== -1) {
        updated[index] = newRecipient
      }
      return updated
    })
  }

  useEffect(() => {
    const rowsToProcess = selectedRows
    if (rowsToProcess && Array.isArray(rowsToProcess) && studentList) {
      const dataTemp = rowsToProcess.map(item => {
        const phone = item?.sendWhatsapp?.phone ?? ''
        // Find the student record to get childOfUserAliasId
        const studentRecord = studentList.find(s => s.id === item.userAlias.id)
        return {
          ...item.userAlias,
          invoiceId: item.id,
          proofToken: item.proofToken,
          phone,
          childOfUserAliasId: studentRecord?.childOfUserAliasId ?? null,
          institutionId: item.institutionId,
          refUserId: item.userId,
          isPrimary: true,
        }
      })
      const grouppedStudents = _.groupBy(dataTemp, 'email')
      const grouppedStudentArr = Object.keys(grouppedStudents).map(
        key => grouppedStudents[key][0]
      )

      const studentRecipients: ResendRecipients[] = grouppedStudentArr.map(
        item => {
          let parent: StudentEnrolmentRecord | null = null
          if (item.childOfUserAliasId) {
            const found =
              studentList.find(p => p.id === item.childOfUserAliasId) ?? null
            if (found) {
              parent = { ...found, phone: found.user?.phone ?? found.phone }
            }
          }
          return {
            ...item,
            isSendToParent: Boolean(item.childOfUserAliasId),
            parentData: parent,
          }
        }
      )

      setRecipientList(studentRecipients)
    } else if (
      rowsToProcess &&
      Array.isArray(rowsToProcess) &&
      rowsToProcess.length > 0
    ) {
      // Clear recipient list if we have rows but studentList is not ready
      setRecipientList([])
    }
  }, [selectedRows, studentList])

  // Update isOpen when prop changes (for modal mode)
  useEffect(() => {
    if (propIsOpen !== undefined) {
      setIsOpen(propIsOpen)
    }
  }, [propIsOpen])

  // const renderEmailSelector = (studentItem: {
  //   email: string
  //   userAliasEmail: string
  //   userAliasName: string
  //   name: string
  //   phone: string
  // }): string | JSX.Element => {
  //   if (studentItem.userAliasEmail === studentItem.email) {
  //     return studentItem.email
  //   }

  //   if (!studentItem.email) {
  //     return studentItem.userAliasEmail
  //   }

  //   if (!studentItem.userAliasEmail) {
  //     return studentItem.email
  //   }

  //   // TODO: Currently, we prioritize the user alias email to send the reminder because this can be changed
  //   return (
  //     <div>
  //       <p>
  //         {t('student:paymentProof.confirmReminder.userEmail')}:{' '}
  //         {studentItem.userAliasEmail}
  //       </p>
  //       <p className="text-sm text-gray-500">
  //         {t('student:paymentProof.confirmReminder.originalEmailInApplication')}
  //         : {studentItem.email}
  //       </p>
  //     </div>
  //   )
  // }

  // const invoices = useMemo(() => {
  //   if (!state) {
  //     try {
  //       const savedRows = sessionStorage.getItem('paymentProofSelectedRows')
  //       if (savedRows) {
  //         return JSON.parse(savedRows) as LocationState[]
  //       }
  //     } catch (error) {
  //       console.error('Error parsing saved selected rows:', error)
  //     }
  //     return []
  //   }
  //   return (state as LocationState[]).filter(d => d.course)
  // }, [state])

  // const listStudents = useMemo(() => {
  //   return invoices.map(d => ({
  //     ...d.sendWhatsapp,
  //     email: d?.enrollCourse?.email ?? '',
  //     userAliasEmail: d?.userAlias?.email ?? '',
  //     userAliasName: d?.userAlias?.name ?? '',
  //     name: d?.enrollCourse?.name ?? '',
  //   }))
  // }, [invoices])

  // const groupedListStudent = useMemo(() => {
  //   const groupedList = _.groupBy(
  //     listStudents,
  //     isWhatsappReminder ? 'phone' : 'email'
  //   )
  //   return Object.keys(groupedList).map(key => groupedList[key][0])
  // }, [listStudents, isWhatsappReminder])

  return (
    <ModalDialog
      open={isOpen}
      onOpenChange={onBack}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onBack}>
            {t('common:action.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isLoading || isRecipientListLoading}
            disabled={
              isLoading ||
              isRecipientListLoading ||
              !isRecipientListReady ||
              isReachLimit ||
              (!isResendEmail && !isResendWa)
            }
          >
            {t('common:action.send')}
          </Button>
        </>
      }
    >
      <SendingMethod
        isResendEmail={isResendEmail}
        isResendWa={isResendWa}
        setResendEmail={setResendEmail}
        setResendWa={setResendWa}
      />
      <div className="border rounded-lg pb-1 border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="py-4 bg-gray-50 rounded-tl-lg text-left pl-4">
                {t('student:paymentProof.tableRecipient.customer')}
              </th>
              <th className="py-4 bg-gray-50 text-left">
                {t('student:paymentProof.tableRecipient.email')}
              </th>
              <th className="py-4 bg-gray-50 rounded-tr-lg text-left">
                {t('student:paymentProof.tableRecipient.phone')}
              </th>
            </tr>
          </thead>
          <tbody>
            {isRecipientListLoading
              ? // Show skeleton loaders when loading
                Array.from({ length: 3 }, (_, index) => (
                  <tr
                    key={`recipient-skeleton-row-${index}`}
                    className="border-t border-gray-200"
                  >
                    <td className="py-3 pl-4">
                      <div className="flex items-center gap-3">
                        <SkeletonLoader height="20px" width="120px" />
                        <SkeletonLoader height="20px" width="60px" />
                      </div>
                    </td>
                    <td className="py-3">
                      <SkeletonLoader height="20px" width="180px" />
                    </td>
                    <td className="py-3">
                      <SkeletonLoader height="20px" width="100px" />
                    </td>
                  </tr>
                ))
              : recipientList.map(recipient => (
                  <Fragment key={recipient.email}>
                    <tr className="border-t border-gray-200">
                      <td className="py-3 pl-4 font-medium text-gray-800 flex items-center gap-3">
                        <div>{recipient.name}</div>
                        <Badge
                          variant="outline"
                          className={cn(
                            'bg-gray-50 border-gray-300 text-gray-600',
                            recipient.isStudentParent &&
                              'border-primary text-primary !bg-transparent'
                          )}
                        >
                          {t(
                            `student:paymentProof.tableRecipient.${
                              recipient.isStudentParent
                                ? 'parentBadge'
                                : 'studentBadge'
                            }`
                          )}
                        </Badge>
                      </td>
                      <td>{recipient.email}</td>
                      <td>{formatPhoneNumber(recipient.phone)}</td>
                    </tr>
                    {recipient.parentData && (
                      <tr key={`${recipient.id}-${recipient.parentData.id}`}>
                        <td colSpan={3} className="px-4 space-y-3 pb-4">
                          <div className="p-3 text-sm rounded-lg border border-blue-300 bg-blue-50 flex justify-between items-center">
                            <div>
                              {t(
                                'student:paymentProof.tableRecipient.sendToParent',
                                { parentName: recipient.parentData.name }
                              )}
                            </div>
                            <Switch
                              checked={recipient.isSendToParent}
                              onCheckedChange={e =>
                                onUpdateSendToParent(recipient, e)
                              }
                            />
                          </div>
                          <div className="rounded-lg border border-blue-300 pb-1">
                            <table className="text-sm w-full">
                              <thead>
                                <tr>
                                  <th className="py-4 bg-blue-100 rounded-tl-lg text-left pl-4">
                                    {t(
                                      'student:paymentProof.tableRecipient.parentName'
                                    )}
                                  </th>
                                  <th className="py-4 bg-blue-100 text-left">
                                    {t(
                                      'student:paymentProof.tableRecipient.email'
                                    )}
                                  </th>
                                  <th className="py-4 bg-blue-100 rounded-tr-lg text-left">
                                    {t(
                                      'student:paymentProof.tableRecipient.phone'
                                    )}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="py-4 pl-4 font-medium bg-blue-50 text-gray-800 flex items-center gap-3">
                                    <div>{recipient.parentData.name}</div>
                                    <Badge
                                      variant="outline"
                                      className="bg-blue-50 border-blue-400 text-blue-800"
                                    >
                                      {t(
                                        'student:paymentProof.tableRecipient.parentBadge'
                                      )}
                                    </Badge>
                                  </td>
                                  <td className="py-4 bg-blue-50 text-left">
                                    {recipient.parentData.email}
                                  </td>
                                  <td className="py-4 bg-blue-50 text-left">
                                    {formatPhoneNumber(
                                      recipient.parentData.phone
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
          </tbody>
        </table>
      </div>
      {isReachLimit && (
        <Alert variant="destructive">
          <LuInfo className="h-4 w-4" />
          <AlertTitle>
            {t('student:paymentProof.confirmReminder.exceedMaximumStudents')}
          </AlertTitle>
          <AlertDescription>
            {t(
              'student:paymentProof.confirmReminder.studentCountReachLimit'
            ).replace('{limit}', String(MAX_LIMIT_REMIND_STUDENT))}
          </AlertDescription>
        </Alert>
      )}
      {isReachNotifQuota && (
        <Alert variant="destructive">
          <LuInfo className="h-4 w-4" />
          <AlertTitle>
            {t('student:paymentProof.confirmReminder.exceedReminderQuota')}
          </AlertTitle>
          <AlertDescription>
            {t(
              'student:paymentProof.confirmReminder.studentCountReachQuotaLimit'
            ).replace('{limit}', '')}
          </AlertDescription>
        </Alert>
      )}
      <p className="text-sm font-normal text-gray-500">
        {t('student:paymentProof.confirmReminder.actionNotUndone')}
      </p>
    </ModalDialog>
  )
}

export default ConfirmSendPaymentProof
