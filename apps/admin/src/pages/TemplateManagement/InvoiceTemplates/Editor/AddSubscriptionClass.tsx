import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useRecoilState, useRecoilValue } from 'recoil'

import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import { Button } from '@/components/ui/Button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import { Label } from '@/components/ui/Label'
import ModalDialog from '@/components/ui/ModalDialog'
import { Switch } from '@/components/ui/Switch'
import { INCOMPLETE_FEATURE_FLAG } from '@/constants/featureFlags'
import useClassData from '@/hooks/useClassData'
import useSiteData from '@/hooks/useSiteData'
import {
  currentActiveStudentState,
  invoiceClassesState,
  invoiceSessionState,
  invoiceStudentState,
} from '@/stores/studentInvoice.store'
import type { RepeatFormats } from '@/types/classes'
import { ClassTypeEnum } from '@/types/course'
import type { FormInvoiceSubscriptionClass } from '@/types/invoice-campaign'
import type {
  InvoiceClassType,
  InvoiceSessionType,
  InvoiceStudent,
} from '@/types/studentInvoice.type'
import { formatCurrency } from '@/utils/currency'
import dayjs from '@/utils/dayjs'
import { createSessionId } from '@/utils/invoice-campaign.utils'

const AddSubscriptionClass = (): JSX.Element => {
  const { t } = useTranslation(['invoiceCampaign', 'common'])
  const [isOpen, setIsOpen] = useState(true)
  const [searchParams] = useSearchParams()
  const { classId } = useParams<{ classId: string }>()
  const classIdNum = Number(classId)
  const documentId = searchParams.get('documentId') ?? ''
  const [allClasses, setAllClasses] = useRecoilState(invoiceClassesState)
  const [allSession, setAllSessions] = useRecoilState(invoiceSessionState)
  const selectedStudents = useRecoilValue(invoiceStudentState)
  const currentActiveStudent = useRecoilValue(currentActiveStudentState)
  const { useFetchDetailClass } = useClassData()
  const { data: currentClass, isLoading: isClassLoading } =
    useFetchDetailClass(classIdNum)
  const form = useForm<FormInvoiceSubscriptionClass>({
    defaultValues: {
      isRecurring: false,
      billingStartDate: dayjs().format('YYYY-MM-DD'),
      billingEndDate: dayjs().add(1, 'month').format('YYYY-MM-DD'),
    },
  })
  const { currency } = useSiteData()
  const price = useMemo(() => {
    return currentClass?.priceOptions?.at(0)
  }, [currentClass?.priceOptions])
  const calculateBillingNextDate = (
    startDate: Date,
    repeatType: RepeatFormats
  ) => {
    const thisStartDate = dayjs(startDate) // Today's date

    const billingCycleDuration = repeatType.every

    const validUnits = [
      'day',
      'week',
      'month',
      'year',
      'months',
      'weeks',
      'days',
      'years',
    ]
    const unit = repeatType.unit as dayjs.ManipulateType

    if (!validUnits.includes(unit)) {
      console.error(`Invalid repeat unit: ${unit}`)
      return startDate
    }

    const nextDate = thisStartDate.add(billingCycleDuration, unit)

    return nextDate.toDate()
  }

  useEffect(() => {
    if (currentClass?.recurringFormat) {
      const nextBillingDate = calculateBillingNextDate(
        new Date(),
        currentClass.recurringFormat
      )
      const formData = {
        billingStartDate: dayjs().format('YYYY-MM-DD'),
        billingEndDate: dayjs(nextBillingDate).format('YYYY-MM-DD'),
      }
      form.reset(formData)
    }
  }, [currentClass?.recurringFormat, form])

  const navigate = useNavigate()
  useEffect(() => {
    if (!isOpen)
      navigate(
        `/invoice-templates/editor${
          documentId ? `?documentId=${documentId}` : ''
        }`
      )
  }, [isOpen, navigate, documentId])

  const createPayloads = (
    data: FormInvoiceSubscriptionClass,
    studentItem: InvoiceStudent
  ): {
    payloadSession: InvoiceSessionType
    payloadClass: InvoiceClassType
  } | null => {
    if (!currentClass || !price) return null
    const payloadClass: InvoiceClassType = {
      type: currentClass.type || ClassTypeEnum.subscription,
      studentItem,
      courseId: currentClass.courseId,
      classId: currentClass.id,
      courseName: currentClass.name,
      priceType: price?.priceType,
      price: price?.amount,
      recurringFormat: currentClass.recurringFormat,
      priceOption: price,
      sessionLength: 1,
      dropIn: currentClass.dropIn,
    }
    const payloadSession: InvoiceSessionType = {
      classItem: payloadClass,
      date: data.billingStartDate as string,
      startTime: data.billingStartDate as string,
      endTime: data.billingEndDate as string,
      id: createSessionId(data, studentItem.userId),
      lessonNumber: 1,
      studentItem,
      isBlocked: false,
      isOverride: false,
    }

    return {
      payloadSession,
      payloadClass,
    }
  }

  const handleSubmit: SubmitHandler<FormInvoiceSubscriptionClass> = data => {
    if (!currentActiveStudent) return
    const payloads = createPayloads(data, currentActiveStudent)
    if (!payloads) return
    setAllClasses([...allClasses, payloads.payloadClass])
    setAllSessions([...allSession, payloads.payloadSession])
    setIsOpen(false)
  }
  const handleApplyForAllStudent = () => {
    const data = form.getValues()
    selectedStudents.forEach(studentItem => {
      const payloads = createPayloads(data, studentItem)
      if (!payloads) return
      setAllClasses(prev => {
        const findIndex = prev.findIndex(
          classItem =>
            classItem.classId === payloads.payloadClass.classId &&
            classItem.studentItem.id === studentItem.id
        )
        if (findIndex > -1 && prev[findIndex]) {
          const newState = [...prev]
          newState[findIndex] = payloads.payloadClass
          return newState
        }
        return [...prev, payloads.payloadClass]
      })
      setAllSessions(prev => {
        const findIndex = prev.findIndex(
          session => session.id === createSessionId(data, studentItem.userId)
        )
        if (findIndex > -1 && prev[findIndex]) {
          const newState = [...prev]
          newState[findIndex] = payloads.payloadSession
          return newState
        }
        return [...prev, payloads.payloadSession]
      })
    })
    setIsOpen(false)
  }

  return (
    <ModalDialog
      title={t('editor.addMembershipToStudent')}
      open={isOpen}
      onOpenChange={setIsOpen}
      formData={form}
      onSubmit={form.handleSubmit(handleSubmit)}
      className="max-w-xl max-h-[90vh] overflow-hidden gap-0"
      // classBody="max-h-[100vh] overflow-y-auto px-0 py-0"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            {t('common:action.cancel')}
          </Button>
          <Button
            type="button"
            variant="primary-outline"
            onClick={handleApplyForAllStudent}
            disabled={isClassLoading}
          >
            {t('editor.addToAllStudentCount', {
              count: selectedStudents.length,
            })}
          </Button>
          <Button type="submit" disabled={isClassLoading}>
            {t('editor.addToStudent')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-8 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="font-semibold">{t('editor.className')}</h1>
          {isClassLoading ? (
            <SkeletonLoader height="3vh" />
          ) : (
            <h3>{currentClass?.name}</h3>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="font-semibold">{t('editor.invoicePreview.price')}</h1>
          {isClassLoading ? (
            <SkeletonLoader height="3vh" />
          ) : (
            <h3>{formatCurrency(+(price?.amount ?? 0), currency)}</h3>
          )}
        </div>

        {INCOMPLETE_FEATURE_FLAG.INVOICE_CAMPAIGN_ALLOW_RECURRING_SUBSCRIPTION && (
          <div className="flex flex-col gap-4">
            <h1 className="font-semibold">{t('editor.isRecurringPayment')}</h1>
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-x-4">
                      <Switch
                        id="is-recurring"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />

                      <Label htmlFor="is-recurring">
                        {field.value
                          ? t('editor.recurringPayment')
                          : t('editor.oneTimePayment')}
                      </Label>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}
        {form.getValues('isRecurring') && (
          <div className="flex flex-col gap-4">
            <h1>{t('editor.billingInterval')}</h1>
            <div className="flex items-center w-full gap-x-2">
              <FormField
                control={form.control}
                name="billingStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('editor.billingStartDate.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        placeholder={
                          t('editor.billingStartDate.placeholder') as string
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billingEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('editor.billingEndDate.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        placeholder={
                          t('editor.billingEndDate.placeholder') as string
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
      </div>
    </ModalDialog>
  )
}

export default AddSubscriptionClass
