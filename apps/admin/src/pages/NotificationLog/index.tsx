import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { ColDef, ICellRendererParams, IRowNode } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { utcToZonedTime } from 'date-fns-tz'
import { AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { LuExternalLink } from 'react-icons/lu'
import { TbRefresh } from 'react-icons/tb'
import { MultiValue, StylesConfig } from 'react-select'
import { toast } from 'sonner'

import { NotificationRecordItem } from '@/api/recordLogs'
import LoadingButton from '@/components/Buttons/LoadingButton'
import MetricCard from '@/components/Cards/MetricCard'
import MetricCardContainer from '@/components/Cards/MetricCardContainer'
import SelectedActions from '@/components/Cards/SelectedActions'
import ChartDatePicker from '@/components/DatePickers/ChartDatePicker'
import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import { Spinner } from '@/components/Loaders/Spinner'
import LabelSelector, {
  LabelSelectorRef,
} from '@/components/Selector/LabelSelector'
import { SelectItemValuesProps } from '@/components/Selector/Select'
import QuickFilterTable from '@/components/Tables/QuickFilterTable'
import Heading from '@/components/Texts/Heading'
import { Badge } from '@/components/ui/Badge'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { INCOMPLETE_FEATURE_FLAG } from '@/constants/featureFlags'
import useCourseData from '@/hooks/useCourseData'
import useDynamicHeight from '@/hooks/useDynamicHeight'
import useNotificationLogData from '@/hooks/useNotificationLogData'
import useNotificationMetrics from '@/hooks/useNotificationMetrics'
import useSiteData from '@/hooks/useSiteData'
import ContentLayout from '@/layouts/ContentLayout'
import { ChartDate } from '@/types/chartDate.type'
import { NotificationStatus } from '@/types/notifications'
import { formatPhoneNumber } from '@/utils/misc'
import { filterNotifications } from '@/utils/notification-log.utils'
import { formatDuration } from '@/utils/timeFormat'

import { getInitialChartDateRange } from '../GoogleAnalytics/components/chartjsSetup'

import MessageSentCell from './NotificationTableCell/MessageSentCell'

const initialDate = getInitialChartDateRange({
  daysBeforeStart: 30,
  daysBeforeEnd: 0,
})

export type CourseClassIdListProps = {
  courseId: string
  classes: string[]
}

const NotificationLog = (): JSX.Element => {
  const { t } = useTranslation()

  const { currentSite } = useSiteData()
  const [params, setParams] = useSearchParams()
  const search = useMemo(() => params.get('search') || '', [params])

  const { setCurrentCourse } = useCourseData()
  const [selectedNotificationType, setSelectedNotificationType] = useState<
    MultiValue<SelectItemValuesProps>
  >([])
  const [selectedNotificationStatus, setSelectedNotificationStatus] = useState<
    MultiValue<SelectItemValuesProps>
  >([])

  const [selectedRows, setSelectedRows] = useState<
    IRowNode<NotificationRecordItem>[]
  >([])
  const [resendingId, setResendingId] = useState<number | null>(null)

  const startDate = params.get('startDate') || initialDate.startDate
  const endDate = params.get('endDate') || initialDate.endDate

  const [chartDate, setChartDate] = useState<ChartDate>({ startDate, endDate })

  const handleChangeChartDate = useCallback((date: ChartDate) => {
    setChartDate(date)
    setParams(prev => {
      const newParams = new URLSearchParams(prev)
      newParams.set('startDate', date.startDate)
      newParams.set('endDate', date.endDate)
      return newParams
    })
  }, [])

  const navigate = useNavigate()

  const gridRef = useRef<AgGridReact<NotificationRecordItem>>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const statusRef = useRef<LabelSelectorRef>(null)
  const typeRef = useRef<LabelSelectorRef>(null)

  const dynamicHeight = useDynamicHeight()
  const goToCourse = (courseId: number) => {
    setCurrentCourse(courseId)
    navigate('/teaching-service/edit-course')
  }
  const { useFetchNotificationLogs, useResendNotificationLogs } =
    useNotificationLogData()
  const {
    data: notificationsList,
    refetch,
    isLoading: isLoadingNotificationList,
  } = useFetchNotificationLogs({
    ...Object.fromEntries(params),
    startDate,
    endDate,
  })

  const { mutateAsync: resendNotifications, isLoading: isResending } =
    useResendNotificationLogs()

  const onSelectionChanged = useCallback(() => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes()
    setSelectedRows(selectedNodes || [])
  }, [])

  const handleClearSelection = useCallback(() => {
    gridRef.current?.api.deselectAll()
    setSelectedRows([])
  }, [])

  const getRowId = useCallback((params: any) => {
    if (!params.data?.id) return crypto.randomUUID()
    return params.data?.id.toString()
  }, [])

  const handleSingleResend = async (id: number) => {
    try {
      setResendingId(id)
      const res = await resendNotifications([id])
      if (res?.succeeded > 0) {
        toast.success(
          t('recordLogs:notificationLogs.resendSuccess', {
            defaultValue: 'Email resent successfully',
          })
        )
      } else {
        const errorMsg =
          res?.results?.[0]?.error || 'Failed to resend email'
        toast.error(errorMsg)
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resend email')
    } finally {
      setResendingId(null)
    }
  }

  const handleBulkResend = async () => {
    const failedIds = selectedRows
      .map(row => row.data)
      .filter(
        data =>
          data &&
          data.notificationStatus === 'FAILED' &&
          (data.channel === 'EMAIL' || !data.channel)
      )
      .map(data => data!.id)

    if (failedIds.length === 0) {
      toast.error(
        t('recordLogs:notificationLogs.noFailedEmailsSelected', {
          defaultValue: 'No failed email records selected',
        })
      )
      return
    }

    try {
      const res = await resendNotifications(failedIds)
      if (res?.succeeded > 0) {
        toast.success(
          t('recordLogs:notificationLogs.bulkResendSuccess', {
            defaultValue: `Successfully resent ${res.succeeded} email(s)${
              res.failed > 0 ? `, ${res.failed} failed` : ''
            }`,
            count: res.succeeded,
          })
        )
        handleClearSelection()
      } else {
        toast.error(
          t('recordLogs:notificationLogs.bulkResendFailed', {
            defaultValue: 'Failed to resend selected emails',
          })
        )
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resend emails')
    }
  }

  const variantStatus = (status?: NotificationStatus | string | null) => {
    switch (status) {
      case NotificationStatus.SENT:
      case NotificationStatus.SUCCESS:
      case NotificationStatus.DELIVERED:
      case NotificationStatus.OPENED:
        return 'success'
      case NotificationStatus.FAILED:
      case NotificationStatus.BOUNCED:
        return 'destructive'
      case NotificationStatus.QUEUED:
        return 'default'
      default:
        return 'secondary'
    }
  }

  const courseNotificationLogColumns: ColDef<NotificationRecordItem>[] = [
    {
      field: 'id',
      headerName: t('recordLogs:notificationLogs.tableHeaders.action', {
        defaultValue: 'Action',
      }) as string,
      filter: false,
      sortable: false,
      width: 105,
      cellRenderer: ({
        data,
      }: ICellRendererParams<NotificationRecordItem>) => {
        if (!data) return null
        const isFailed = data.notificationStatus === 'FAILED'
        const isEmail = data.channel === 'EMAIL' || !data.channel

        if (!isFailed || !isEmail) {
          return <span className="text-gray-400 text-sm pl-2">-</span>
        }

        const isThisResending = resendingId === data.id

        return (
          <Box align="center" className="h-full items-center">
            <Button
              variant="outline"
              size="sm"
              className="text-xs px-2.5 py-1 text-primary border-primary hover:bg-primary/10 flex items-center gap-1.5 h-8"
              disabled={isThisResending || isResending}
              onClick={() => handleSingleResend(data.id)}
            >
              {isThisResending ? (
                <Spinner size="small" />
              ) : (
                <TbRefresh className="w-3.5 h-3.5" />
              )}
              <span>
                {t('recordLogs:notificationLogs.action.resend', {
                  defaultValue: 'Resend',
                })}
              </span>
            </Button>
          </Box>
        )
      },
    },
    {
      headerName: t(
        'recordLogs:notificationLogs.tableHeaders.notificationType'
      ) as string,
      field: 'notificationType',
      filter: true,
      valueFormatter: value => {
        return value.data?.notificationType
          ? t(
              `recordLogs:notificationLogs.notificationTypes.${value.data?.notificationType}`
            )
          : '-'
      },
    },

    {
      headerName: t(
        'recordLogs:notificationLogs.tableHeaders.recipientUserEmail'
      ) as string,
      field: 'recipientUserEmail',
      filter: true,
      valueFormatter: value => {
        return value.value || '-'
      },
    },
    {
      headerName: t(
        'recordLogs:notificationLogs.tableHeaders.recipientUserPhone'
      ) as string,
      field: 'recipientUserPhone',
      filter: true,
      valueFormatter: value => {
        return value?.data?.recipientUserPhone
          ? formatPhoneNumber(value?.data?.recipientUserPhone)
          : '-'
      },
    },

    {
      headerName: t(
        'recordLogs:notificationLogs.tableHeaders.messageSent'
      ) as string,
      field: 'message',
      filter: true,
      cellRenderer: ({ data }: ICellRendererParams<NotificationRecordItem>) => {
        return data ? (
          <MessageSentCell
            message={data.message}
            subject={data.subject}
            status={data.notificationStatus}
          />
        ) : null
      },
    },
    {
      headerName: t(
        'recordLogs:notificationLogs.tableHeaders.status'
      ) as string,
      field: 'notificationStatus',
      filter: true,
      cellRenderer: ({ data }: ICellRendererParams<NotificationRecordItem>) => {
        const rawStatus = data?.notificationStatus
        const displayStatus = rawStatus || 'PENDING'
        return (
          <Badge variant={variantStatus(rawStatus)}>
            {t(
              `recordLogs:notificationLogs.notificationStatuses.${displayStatus}`,
              { defaultValue: displayStatus }
            )}
          </Badge>
        )
      },
    },
    {
      headerName: t(
        'recordLogs:notificationLogs.tableHeaders.sentAt'
      ) as string,
      field: 'createdAt',
      filter: true,
      valueFormatter: value => {
        const rawDate = value?.data?.sentAt || value?.data?.createdAt
        if (!rawDate) {
          return '-'
        }

        const timeZone = currentSite?.timeZone.id

        try {
          return timeZone
            ? utcToZonedTime(rawDate, timeZone).toLocaleString()
            : new Date(rawDate).toLocaleString()
        } catch {
          // If date-fns-tz fails, fall back to native Date
          return new Date(rawDate as any).toLocaleString()
        }
      },
    },

    {
      headerName: t(
        `recordLogs:notificationLogs.tableHeaders.associatedClass`
      ) as string,
      field: 'associatedClass',
      sortable: false,
      filter: true,
      cellRenderer: ({ data }: ICellRendererParams<NotificationRecordItem>) => {
        if (data?.associatedClass && data?.associatedClass.length > 0) {
          return (
            <>
              {data.associatedClass.map(d => {
                return (
                  <Button
                    key={`${data.id}-${d.id}-${d.courseId}`}
                    variant="link"
                    onClick={() => goToCourse(d.courseId)}
                  >
                    <span className="mr-1">{d.name}</span> <LuExternalLink />
                  </Button>
                )
              })}
            </>
          )
        }
        return '-'
      },
    },
    { headerName: 'ID', field: 'id', filter: true },
  ]
  const filteredList = useMemo(() => {
    if (!notificationsList) return []
    return filterNotifications(notificationsList, {
      selectedNotificationType,
      selectedNotificationStatus,
    })
  }, [
    notificationsList,
    selectedNotificationType,
    selectedNotificationStatus,
  ])
  const metrics = useNotificationMetrics(filteredList, chartDate)

  const typeOptions = useMemo(() => {
    const notificationTypes = new Set(
      (notificationsList || []).map(item => item.notificationType)
    )
    return Array.from(notificationTypes).map(notificationType => ({
      value: notificationType,
      label: t(
        `recordLogs:notificationLogs.notificationTypes.${notificationType}`
      ),
    }))
  }, [notificationsList, t])

  const statusOptions = useMemo(() => {
    const standardStatuses = [
      NotificationStatus.SENT,
      NotificationStatus.DELIVERED,
      NotificationStatus.OPENED,
      NotificationStatus.QUEUED,
      NotificationStatus.FAILED,
      NotificationStatus.BOUNCED,
    ]
    const rawStatuses = (notificationsList || [])
      .map(item => item.notificationStatus)
      .filter((s): s is NotificationStatus => Boolean(s))
    const uniqueStatuses = Array.from(
      new Set([...standardStatuses, ...rawStatuses])
    )
    return uniqueStatuses.map(notificationStatus => ({
      value: notificationStatus,
      label: t(
        `recordLogs:notificationLogs.notificationStatuses.${notificationStatus}`,
        { defaultValue: notificationStatus }
      ),
    }))
  }, [notificationsList, t])

  const handleTypeChange = (
    selectedOption: MultiValue<SelectItemValuesProps>
  ) => {
    if (selectedOption !== null) {
      setSelectedNotificationType(selectedOption)
    }
  }

  const handleStatusChange = (
    selectedOption: MultiValue<SelectItemValuesProps>
  ) => {
    if (selectedOption !== null) {
      setSelectedNotificationStatus(selectedOption)
    }
  }

  const handleReset = () => {
    setSelectedNotificationType([])
    setSelectedNotificationStatus([])
    setChartDate(initialDate)
    handleChangeChartDate(initialDate)
    gridRef?.current?.api.setFilterModel(null)
    if (inputRef.current) inputRef.current.value = ''
    if (statusRef.current) statusRef.current.clearValue()
    if (typeRef.current) typeRef.current.clearValue()
  }

  useEffect(() => {
    refetch()
  }, [search, startDate, endDate])

  return (
    <ContentLayout
      leftHeader={<Heading>{t('recordLogs:notificationLogs.title')}</Heading>}
      rightHeader={
        <ChartDatePicker
          chartDate={chartDate}
          handleChartDateChange={handleChangeChartDate}
        />
      }
    >
      <AnimatePresence>
        {selectedRows.length > 0 && (
          <div className="flex w-full flex-row items-center justify-center gap-2 px-4 mt-4">
            <SelectedActions
              countText={t('recordLogs:notificationLogs.selectedRecords', {
                defaultValue: 'selected records',
              })}
              onClearSelection={handleClearSelection}
              selectedCount={selectedRows.length}
              rightComponent={
                <div className="flex gap-2">
                  <LoadingButton
                    variant="default"
                    disabled={isResending}
                    isLoading={isResending}
                    onClick={handleBulkResend}
                  >
                    <TbRefresh className="w-4 h-4 mr-1.5" />
                    {t('recordLogs:notificationLogs.resendSelected', {
                      defaultValue: 'Resend Failed Emails',
                    })}
                  </LoadingButton>
                </div>
              }
            />
          </div>
        )}
      </AnimatePresence>

      {INCOMPLETE_FEATURE_FLAG.SHOW_STATS_IN_NOTIFICATION_LOG && (
        <MetricCardContainer
          isLoading={isLoadingNotificationList}
          className="pt-4"
        >
          <div className="box-row-full flex-col md:flex-row px-4">
            <MetricCard
              title={t('recordLogs:notificationLogs.bannerCards.sentOnEmail')}
              value={metrics?.EMAIL.current}
              growthRate={metrics?.EMAIL.growthRate}
              subtitle={
                t(
                  'recordLogs:notificationLogs.bannerCards.SinceLastMonth'
                ) as string
              }
            />
            <MetricCard
              title={t('recordLogs:notificationLogs.bannerCards.timeSaved')}
              value={formatDuration(metrics?.timeSaved.current)}
              growthRate={metrics?.timeSaved.growthRate}
              subtitle={
                t(
                  'recordLogs:notificationLogs.bannerCards.SinceLastMonth'
                ) as string
              }
            />
          </div>
        </MetricCardContainer>
      )}

      <Box direction="col" className="p-4">
        <Box direction="col" justify="start">
          {isLoadingNotificationList ? (
            <SkeletonLoader
              width="100%"
              height="60vh"
              boxCSS={{
                direction: 'column',
                align: 'flex-start',
                gap: 'medium',
                marginTop: '$1',
              }}
            />
          ) : (
            <QuickFilterTable
              rowData={filteredList}
              columns={courseNotificationLogColumns}
              gridRef={gridRef}
              inputRef={inputRef}
              height={dynamicHeight}
              isLoading={isLoadingNotificationList}
              handleReset={handleReset}
              hasCheckboxSelection
              onSelectionChanged={onSelectionChanged}
              getRowId={getRowId}
              hasFilterSelection
              filterSelector={
                <Box className="flex flex-col md:flex-row gap-2 w-full">
                  <LabelSelector
                    options={typeOptions ?? []}
                    onChange={(e: MultiValue<SelectItemValuesProps>) =>
                      handleTypeChange(e)
                    }
                    placeHolder={t(
                      'recordLogs:notificationLogs.selectLabels.selectNotificationType'
                    )}
                    selectStyles={selectorStyles()}
                    ref={typeRef}
                    isMulti
                  />
                  <LabelSelector
                    options={statusOptions ?? []}
                    onChange={(e: MultiValue<SelectItemValuesProps>) =>
                      handleStatusChange(e)
                    }
                    placeHolder={t(
                      'recordLogs:notificationLogs.selectLabels.selectNotificationStatus'
                    )}
                    selectStyles={selectorStyles()}
                    ref={statusRef}
                    isMulti
                  />

                  <Button
                    className="w-full md:w-[80px]"
                    variant="outline"
                    onClick={handleReset}
                  >
                    {t('recordLogs:notificationLogs.selectLabels.reset')}
                  </Button>
                </Box>
              }
            />
          )}
        </Box>
      </Box>
    </ContentLayout>
  )
}

const selectorStyles = (): StylesConfig => ({
  control: styles => ({
    ...styles,
    backgroundColor: 'white',
  }),
  container: styles => ({
    ...styles,
    flex: '1',
  }),
})

export default NotificationLog
