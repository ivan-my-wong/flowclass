import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { ColDef, ICellRendererParams } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { utcToZonedTime } from 'date-fns-tz'
import { useTranslation } from 'react-i18next'
import { GiHamburgerMenu } from 'react-icons/gi'
import { LuExternalLink } from 'react-icons/lu'
import { MultiValue, StylesConfig } from 'react-select'

// import { result } from "lodash-es";
import { NotificationRecordItem } from '@/api/recordLogs'
import MetricCard from '@/components/Cards/MetricCard'
import MetricCardContainer from '@/components/Cards/MetricCardContainer'
import ChartDatePicker from '@/components/DatePickers/ChartDatePicker'
import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
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
import { NotificationChannel, NotificationStatus } from '@/types/notifications'
import { getInitialChartDateRange } from '@/utils/chartjsSetup'
import { formatPhoneNumber } from '@/utils/misc'
import { filterNotifications } from '@/utils/notification-log.utils'
import { formatDuration } from '@/utils/timeFormat'

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
  const [
    selectedNotificationWhatsappTemplate,
    setSelectedNotificationWhatsappTemplate,
  ] = useState<MultiValue<SelectItemValuesProps>>([])
  const [selectedNotificationType, setSelectedNotificationType] = useState<
    MultiValue<SelectItemValuesProps>
  >([])
  const [selectedNotificationStatus, setSelectedNotificationStatus] = useState<
    MultiValue<SelectItemValuesProps>
  >([])

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
  const automationFlowRef = useRef<LabelSelectorRef>(null)
  const whatsappTemplateRef = useRef<LabelSelectorRef>(null)
  const statusRef = useRef<LabelSelectorRef>(null)
  const typeRef = useRef<LabelSelectorRef>(null)

  const dynamicHeight = useDynamicHeight()
  const goToCourse = (courseId: number) => {
    setCurrentCourse(courseId)
    navigate('/teaching-service/edit-course')
  }
  const { useFetchNotificationLogs } = useNotificationLogData()
  const {
    data: notificationsList,
    refetch,
    isLoading: isLoadingNotificationList,
  } = useFetchNotificationLogs({
    ...Object.fromEntries(params),
    startDate,
    endDate,
  })

  const courseNotificationLogColumns: ColDef<NotificationRecordItem>[] = [
    {
      field: 'id',
      headerName: t(
        'recordLogs:notificationLogs.tableHeaders.action'
      ) as string,
      filter: false,
      hide: true,
      width: 80,
      cellRenderer: () => {
        return (
          <Box className="pt-4" align="center">
            <GiHamburgerMenu />
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
        let message = data?.message || ''
        if (data?.channel === NotificationChannel.EMAIL) {
          message = data?.subject
        }
        return data ? <MessageSentCell message={message} /> : null
      },
    },
    {
      headerName: t(
        'recordLogs:notificationLogs.tableHeaders.status'
      ) as string,
      field: 'notificationStatus',
      filter: true,
      cellRenderer: ({ data }: ICellRendererParams<NotificationRecordItem>) => {
        if (!data?.notificationStatus) return ''
        return (
          <Badge variant={variantStatus(data.notificationStatus)}>
            {t(
              `recordLogs:notificationLogs.notificationStatuses.${data?.notificationStatus}`
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
        `recordLogs:notificationLogs.tableHeaders.whatsappTemplate`
      ) as string,
      field: 'whatsappTemplate',
      sortable: false,
      filter: true,
      valueGetter: data => {
        return data?.data?.whatsappTemplate?.name || ''
      },
      cellRenderer: ({ data }: ICellRendererParams<NotificationRecordItem>) => {
        if (data?.whatsappTemplate) {
          return (
            <Link
              to={`/whatsapp-templates/edit?id=${data.whatsappTemplate.id}`}
              className="capitalize text-link"
            >
              {data.whatsappTemplate.name.replaceAll('_', ' ')}
            </Link>
          )
        }
        return '-'
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
  const variantStatus = (status: NotificationStatus) => {
    switch (status) {
      case NotificationStatus.SENT:
        return 'success'
      case NotificationStatus.FAILED:
        return 'destructive'
      case NotificationStatus.QUEUED:
        return 'default'
      default:
        return 'outline'
    }
  }
  const filteredList = useMemo(() => {
    if (!notificationsList) return []
    return filterNotifications(notificationsList, {
      selectedNotificationWhatsappTemplate,
      selectedNotificationType,
      selectedNotificationStatus,
    })
  }, [
    notificationsList,
    selectedNotificationWhatsappTemplate,
    selectedNotificationType,
    selectedNotificationStatus,
  ])
  const metrics = useNotificationMetrics(filteredList, chartDate)

  const whatsappTemplateOptions = useMemo(() => {
    const whatsappTemplates = (notificationsList || [])
      .filter(d => !!d.whatsappTemplate)
      .map(item => ({
        value: item?.whatsappTemplate?.id as number,
        label: item?.whatsappTemplate?.name as string,
      }))
    return Array.from(new Set(whatsappTemplates.map(obj => obj.value))).map(
      id => whatsappTemplates.find(obj => obj.value === id)
    ) as SelectItemValuesProps[]
  }, [notificationsList])

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
    const notificationStatuses = new Set(
      (notificationsList || [])
        .map(item => item.notificationStatus)
        .filter(status => status !== null)
    )
    return Array.from(notificationStatuses).map(notificationStatus => ({
      value: notificationStatus,
      label: t(
        `recordLogs:notificationLogs.notificationStatuses.${notificationStatus}`
      ),
    }))
  }, [notificationsList, t])

  const handleWhatsappTemplateChange = (
    selectedOption: MultiValue<SelectItemValuesProps>
  ) => {
    if (selectedOption !== null) {
      setSelectedNotificationWhatsappTemplate(selectedOption)
    }
  }
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
    if (whatsappTemplateRef.current) whatsappTemplateRef.current.clearValue()
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
              title={t(
                'recordLogs:notificationLogs.bannerCards.sentOnWhatsApp'
              )}
              value={metrics?.WHATSAPP.current}
              growthRate={metrics?.WHATSAPP.growthRate}
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
              hasFilterSelection
              filterSelector={({ handleReset: reset }) => (
                <>
                  <Box className="flex flex-col md:flex-row gap-2">
                    {/* <LabelSelector
                      options={automationFlowOptions ?? []}
                      width="100%"
                      onChange={(e: MultiValue<SelectItemValuesProps>) =>
                        handleAutomationFlowChange(e)
                      }
                      placeHolder={t(
                        'recordLogs:notificationLogs.selectLabels.selectAutomationFlowOptions'
                      )}
                      selectStyles={selectCustomStyles()}
                      ref={automationFlowRef}
                      isMulti
                    /> */}
                    <LabelSelector
                      options={whatsappTemplateOptions ?? []}
                      onChange={(e: MultiValue<SelectItemValuesProps>) =>
                        handleWhatsappTemplateChange(e)
                      }
                      placeHolder={t(
                        'recordLogs:notificationLogs.selectLabels.selectWhatsappTemplateOptions'
                      )}
                      selectStyles={selectCustomStyles()}
                      ref={whatsappTemplateRef}
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
                      selectStyles={selectCustomStyles()}
                      ref={statusRef}
                      isMulti
                    />
                  </Box>
                  <Box className="flex flex-col md:flex-row gap-2">
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

                    <Button
                      className="w-full md:w-[80px]"
                      variant="outline"
                      onClick={reset}
                    >
                      {t('recordLogs:notificationLogs.selectLabels.reset')}
                    </Button>
                  </Box>
                </>
              )}
            />
          )}
        </Box>
      </Box>
    </ContentLayout>
  )
}

const selectCustomStyles = (): StylesConfig => ({
  control: styles => ({
    ...styles,
    backgroundColor: 'white',
  }),
})
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
