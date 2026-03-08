import { Fragment, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuBell, LuDollarSign, LuMessageCircle } from 'react-icons/lu'

import { Badge } from '@/components/ui/Badge'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import Text from '@/components/ui/Text'
import { PaymentState } from '@/constants/payment'
import useNotificationLogData from '@/hooks/useNotificationLogData'
import usePaymentEvidenceData from '@/hooks/usePaymentEvidenceData'
import { EnrollConfirmState, Invoice } from '@/types/enrollCourse'
import { formatCurrency } from '@/utils/currency'
import { formatDateRelativeToToday } from '@/utils/timeString'

interface NotificationItem {
  id: string
  type: 'notification' | 'application' | 'payment'
  title: string
  description: string
  timestamp: Date
  icon: React.ReactNode
  onAction: () => void
}

const NotificationItemComponent = ({ item }: { item: NotificationItem }) => {
  const { i18n } = useTranslation()
  return (
    <div className="w-full flex flex-row justify-between items-center py-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-3 flex-1 p-2">
        <div className="flex-shrink-0 mt-1">{item.icon}</div>
        <div className="flex flex-col flex-1 min-w-0 items-start">
          <Text
            variant="disabled"
            className="text-sm font-medium text-left text-gray-900"
          >
            {item.title}
          </Text>
          <Text variant="disabled" className="text-xs text-gray-500 mt-1">
            {item.description}
          </Text>
          <Text variant="disabled" className="text-xs text-gray-400 mt-1">
            {item.timestamp.toLocaleString(i18n.language)}
          </Text>
        </div>
      </div>
    </div>
  )
}

const Divider = () => {
  return <div className="w-full h-px bg-gray-200" />
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  t,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  t: (key: string) => string
}) => {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {t('onboarding:notifications.previous')}
      </Button>
      <span className="text-sm text-gray-600">
        {t('onboarding:notifications.page')} {currentPage}{' '}
        {t('onboarding:notifications.of')} {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        {t('onboarding:notifications.next')}
      </Button>
    </div>
  )
}

export const Notifications = (): JSX.Element => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Use existing hooks
  const { useFetchNotificationLogs } = useNotificationLogData()
  const { useFetchStudentInvoiceStatistics } = usePaymentEvidenceData()

  // Fetch notification logs
  const { data: notificationLogs = [] } = useFetchNotificationLogs({
    search: '',
    startDate: formatDateRelativeToToday(30), // Last 30 days
    endDate: formatDateRelativeToToday(0),
  })

  // Fetch payment data
  const { data: allInvoiceData = [] } = useFetchStudentInvoiceStatistics({
    startDate: formatDateRelativeToToday(30),
    endDate: formatDateRelativeToToday(0),
  })

  // Process and combine all notification data
  const allNotifications = useMemo(() => {
    const notifications: NotificationItem[] = []

    // Add notification logs
    notificationLogs.forEach(log => {
      notifications.push({
        id: `notification-${log.id}`,
        type: 'notification',
        title: log.subject || t('onboarding:notifications.notificationSent'),
        description:
          log.message ||
          `${t('onboarding:notifications.sentTo')} ${log.recipientUserEmail}`,
        timestamp: new Date(log.createdAt),
        icon: <LuMessageCircle className="w-4 h-4 text-blue-500" />,
        onAction: () => {
          // Navigate to notification logs or specific notification
          navigate('/settings/notifications')
        },
      })
    })

    // Add payment notifications (approved payments)
    const approvedPayments = allInvoiceData.filter(
      (invoice: Invoice) =>
        invoice.paymentState === PaymentState.PAID && !invoice.invoiceParentId
    )

    approvedPayments.forEach((invoice: Invoice) => {
      notifications.push({
        id: `payment-${invoice.id}`,
        type: 'payment',
        title: t('onboarding:notifications.paymentApproved'),
        description: `${invoice.payBy} - ${formatCurrency(
          invoice.payAmount,
          invoice.currency
        )}`,
        timestamp: new Date(invoice.updatedAt || invoice.createdAt),
        icon: <LuDollarSign className="w-4 h-4 text-green-500" />,
        onAction: () => {
          navigate(`/application?paymentStatus=paid&search=${invoice.payBy}`)
        },
      })
    })

    // Add application notifications (new applications)
    const newApplications = allInvoiceData.filter((invoice: Invoice) =>
      invoice.enrollCourses.some(
        enrollCourse =>
          enrollCourse.confirmState === EnrollConfirmState.PENDING &&
          !invoice.invoiceParentId
      )
    )

    newApplications.forEach((invoice: Invoice) => {
      notifications.push({
        id: `application-${invoice.id}`,
        type: 'application',
        title: t('onboarding:notifications.newApplication'),
        description: `${invoice.payBy} ${t(
          'onboarding:notifications.appliedForCourse'
        )}`,
        timestamp: new Date(invoice.createdAt),
        icon: <LuBell className="w-4 h-4 text-orange-500" />,
        onAction: () => {
          navigate(
            `/application?paymentStatus=awaitingReviewProof%2CawaitingReviewWithoutProof&search=${invoice.payBy}`
          )
        },
      })
    })

    // Sort by timestamp (newest first)
    return [...notifications].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )
  }, [notificationLogs, allInvoiceData, navigate, t])

  // Pagination logic
  const totalPages = Math.ceil(allNotifications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentNotifications = allNotifications.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <Box className="flex flex-col rounded-md">
      <div className="flex flex-row justify-between items-center w-full mb-4">
        <div className="flex flex-row items-center gap-2">
          <Text variant="disabled" className="text-lg font-semibold">
            {t('onboarding:notifications.title')}
          </Text>
          <Badge variant="default">{allNotifications.length}</Badge>
        </div>
      </div>
      <Divider />
      <div className="flex flex-col w-full max-h-[60dvh] overflow-y-auto">
        {currentNotifications.length > 0 ? (
          currentNotifications.map((notification, index) => (
            <Fragment key={notification.id}>
              <NotificationItemComponent item={notification} />
              {index !== currentNotifications.length - 1 && <Divider />}
            </Fragment>
          ))
        ) : (
          <div className="flex flex-col w-full py-8 text-center">
            <LuBell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <Text variant="disabled" className="text-sm text-gray-500">
              {t('onboarding:notifications.noNotifications')}
            </Text>
          </div>
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        t={t}
      />
    </Box>
  )
}
