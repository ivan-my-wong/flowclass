import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import { GridOptions, ICellRendererParams, IRowNode } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { utcToZonedTime } from 'date-fns-tz'
import dayjs from 'dayjs'
import { CSVLink } from 'react-csv'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from 'react-query'
import { MultiValue, StylesConfig } from 'react-select'
import { toast } from 'sonner'

import { getAllAdditionalFee } from '@/api/additionalFee'
import ChartDatePicker from '@/components/DatePickers/ChartDatePicker'
import CourseAndClassSelector from '@/components/Selector/CourseAndClassSelector'
import LabelSelector, {
  LabelSelectorRef,
} from '@/components/Selector/LabelSelector'
import { SelectItemValuesProps } from '@/components/Selector/Select'
import QuickFilterTable from '@/components/Tables/QuickFilterTable'
import Heading from '@/components/Texts/Heading'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import {
  PaymentEvidenceState,
  paymentProofCsvHeaders,
  PaymentState,
  paymentStatusOptions,
} from '@/constants/payment'
import { QUERY_KEY } from '@/constants/queryKey'
import useCourseData from '@/hooks/useCourseData'
import useDynamicHeight from '@/hooks/useDynamicHeight'
import usePaymentEvidenceData from '@/hooks/usePaymentEvidenceData'
import usePromotionData from '@/hooks/usePromotionData'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import ContentLayout from '@/layouts/ContentLayout'
import BulkActionComponent from '@/pages/PaymentProofTable/components/BulkActionComponent'
import { Site } from '@/stores/siteData'
import { ChartDate } from '@/types/chartDate.type'
import { Course } from '@/types/course'
import {
  EnrollIntoInfo,
  Invoice,
  PaymentProofTableEnrollCourse,
  PaymentProofTableItem,
} from '@/types/enrollCourse'
import { School } from '@/types/school'
import { generatePaymentLink } from '@/utils/generate-link.utils'
import { getRowId } from '@/utils/misc'
import {
  buildCustomFieldsHeader,
  filterPaymentProof,
} from '@/utils/paymentProof.utils'
import { formatDateRelativeToToday } from '@/utils/timeString'

import ActionButtonCell from './PaymentProofTableCells/ActionButtonCell'
import EnrollCourseScheduleCell from './PaymentProofTableCells/EnrollCourseScheduleCell'
import NameDropdownCell from './PaymentProofTableCells/NameDropdownCell'
import PaymentAmountCell from './PaymentProofTableCells/PaymentAmountCell'
import PaymentDateCell from './PaymentProofTableCells/PaymentDateCell'
import PaymentMethodCell from './PaymentProofTableCells/PaymentMethodCell'
import { PaymentReceiptStatusCell } from './PaymentProofTableCells/PaymentReceiptStatusCell'
import PaymentStatusCell from './PaymentProofTableCells/PaymentStatusCell'
import { PromotionCell } from './PaymentProofTableCells/PromotionCell'
import { RegistrationFormCell } from './PaymentProofTableCells/RegistrationFormCell'
import RemarksCell from './PaymentProofTableCells/RemarksCell'
import { formatCsvData } from './tableFormatter'

interface PromotionOption extends SelectItemValuesProps {
  source: 'coupon' | 'additionalFee'
  originalId: number
}

type FilterKeys =
  | 'classes'
  | 'courses'
  | 'paymentMethods'
  | 'paymentStatus'
  | 'promotions'
type FilterParamsType = Record<FilterKeys, SelectItemValuesProps[]>

const initialDate: ChartDate = {
  startDate: dayjs().subtract(2, 'month').startOf('month').format('YYYY-MM-DD'),
  endDate: dayjs().add(2, 'month').endOf('month').format('YYYY-MM-DD'),
}

const MAX_BULK_SELECTION = 50

const PaymentProofPage = (): JSX.Element => {
  const { t } = useTranslation()
  const { schoolData } = useSchoolData()
  const { courseData, getFilteredCourseOptions } = useCourseData()
  const { siteData } = useSiteData()
  const {
    promotionData: { coupons: listCoupons },
  } = usePromotionData()
  const { currentSchool } = schoolData
  const options = useMemo(() => {
    return getFilteredCourseOptions()
  }, [getFilteredCourseOptions])
  const dynamicHeight = useDynamicHeight()
  const { data: listAdditionalFee } = useQuery(
    [QUERY_KEY.promotion.getAllAdditionalFeeKey],
    async () => {
      try {
        return await getAllAdditionalFee(
          currentSchool?.siteId ?? 0,
          currentSchool?.id ?? 0
        )
      } catch (error) {
        console.error('Failed to fetch additional fees:', error)
        return []
      }
    }
  )

  const [filterParams, setFilterParams] = useState<FilterParamsType>({
    classes: [],
    courses: [],
    paymentMethods: [],
    paymentStatus: [],
    promotions: [],
  })

  const [params, setParams] = useSearchParams()

  const navigate = useNavigate()

  const onChangeFilterParams = useCallback(
    (key: FilterKeys, value: MultiValue<SelectItemValuesProps>) => {
      const valueArray = Array.isArray(value) ? value : [value]
      const valueString = valueArray.map(d => d.value).join(',')
      setFilterParams(prev => ({
        ...prev,
        [key]: valueArray,
      }))
      setParams(prev => {
        const newParams = new URLSearchParams(prev)
        if (valueString) {
          newParams.set(key, valueString)
        } else {
          newParams.delete(key)
        }
        return newParams
      })
    },
    []
  )

  const startDate = useMemo(
    () => params.get('startDate') || initialDate.startDate,
    [params]
  )
  const endDate = useMemo(
    () => params.get('endDate') || initialDate.endDate,
    [params]
  )

  const [chartDate, setChartDate] = useState<ChartDate>({ startDate, endDate })

  const handleChangeChartDate = (date: ChartDate) => {
    setChartDate(date)
    setParams(prev => {
      const newParams = new URLSearchParams(prev)
      newParams.set('startDate', date.startDate)
      newParams.set('endDate', date.endDate)
      return newParams
    })
  }
  const [isInitialRequest, setIsInitialRequest] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const paymentMethodRef = useRef<LabelSelectorRef>(null)
  const statusRef = useRef<LabelSelectorRef>(null)
  const courseRef = useRef<LabelSelectorRef>(null)
  const promotionRef = useRef<LabelSelectorRef>(null)
  const classRef = useRef<LabelSelectorRef>(null)
  const {
    useApprovePaymentProof,
    useRejectPaymentProof,
    useFetchStudentInvoices,
    useFetchPaymentEvidence,
  } = usePaymentEvidenceData()
  const search = useMemo(() => params.get('search') || '', [params])
  const [currentCourse] = useState<Course>()
  const [invoiceList, setInvoiceList] = useState<Invoice[]>([])

  const [filteredStudentList, setFilteredStudentList] = useState<Invoice[]>([])

  const queryClient = useQueryClient()

  const refreshData = (): void => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEY.paymentEvidence.checkPaymentEvidenceKey],
    })
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEY.course.classListCourseKey],
    })
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEY.course.studentListCourseKey],
    })
  }

  const { mutateAsync: mutateAsyncConfirm, isLoading: isLoadingConfirm } =
    useApprovePaymentProof(refreshData)

  const { mutateAsync: mutateAsyncReject, isLoading: isLoadingReject } =
    useRejectPaymentProof(refreshData)

  const gridRef = useRef<AgGridReact<PaymentProofTableItem>>(null)
  const [selectedRows, setSelectedRows] = useState<
    IRowNode<PaymentProofTableItem>[]
  >([])

  const selectedPaymentProofList = useMemo<PaymentProofTableItem[]>(() => {
    return selectedRows
      .map(d => d.data)
      .filter(d => d !== undefined) as PaymentProofTableItem[]
  }, [selectedRows])

  // Persist selected rows in sessionStorage to prevent reset on navigation
  useEffect(() => {
    const savedSelectedRows = sessionStorage.getItem('paymentProofSelectedRows')
    if (savedSelectedRows && selectedRows.length === 0) {
      try {
        const parsedRows = JSON.parse(savedSelectedRows)
        // Restore selection in the grid
        if (gridRef.current?.api && parsedRows.length > 0) {
          const rowIds = parsedRows.map((row: PaymentProofTableItem) => row.id)
          gridRef.current.api.forEachNode(node => {
            if (rowIds.includes(node.data?.id)) {
              node.setSelected(true)
            }
          })
          // Update the selectedRows state
          const selectedNodes = gridRef.current.api.getSelectedNodes()
          setSelectedRows(selectedNodes || [])
        }
      } catch (error) {
        console.error('Error parsing saved selected rows:', error)
        sessionStorage.removeItem('paymentProofSelectedRows')
      }
    }
  }, [filteredStudentList])

  // Save selected rows to sessionStorage whenever selection changes
  useEffect(() => {
    if (selectedPaymentProofList.length > 0) {
      sessionStorage.setItem(
        'paymentProofSelectedRows',
        JSON.stringify(selectedPaymentProofList)
      )
    } else {
      sessionStorage.removeItem('paymentProofSelectedRows')
    }
  }, [selectedPaymentProofList])

  const onSelectionChanged = () => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes() || []

    // Limit selection to MAX_BULK_SELECTION items
    if (selectedNodes.length > MAX_BULK_SELECTION) {
      // Keep only the first MAX_BULK_SELECTION items
      const limitedNodes = selectedNodes.slice(0, MAX_BULK_SELECTION)

      // Deselect all nodes first
      gridRef.current?.api.deselectAll()

      // Select only the limited nodes
      limitedNodes.forEach(node => {
        node.setSelected(true)
      })

      // Update state with limited selection
      setSelectedRows(limitedNodes)

      // Show warning toast
      toast.warning(
        t('student:paymentProof.maxSelectionReached', {
          max: MAX_BULK_SELECTION,
        }) as string
      )
    } else {
      setSelectedRows(selectedNodes)
    }
  }

  const handleApprove = () => {
    const ids = selectedRows
      .map(node => {
        const paymentEvidence = paymentEvidenceList.find(
          p => p.invoiceId === node.data?.id
        )
        return paymentEvidence?.status === PaymentEvidenceState.PROCESSING
          ? paymentEvidence.id
          : null
      })
      .filter((id): id is number => id !== null)
    if (ids.length > 0) {
      mutateAsyncConfirm(ids)
    }
  }

  const handleReject = () => {
    const ids = selectedRows
      .map(node => {
        const paymentEvidence = paymentEvidenceList.find(
          p => p.invoiceId === node.data?.id
        )
        return paymentEvidence?.status === PaymentEvidenceState.PROCESSING
          ? paymentEvidence.id
          : null
      })
      .filter((id): id is number => id !== null)
    if (ids.length > 0) {
      mutateAsyncReject(ids)
    }
  }

  const handleClearSelection = () => {
    gridRef.current?.api.deselectAll()
    setSelectedRows([])
    sessionStorage.removeItem('paymentProofSelectedRows')
  }
  const { data: paymentEvidences } = useFetchPaymentEvidence()
  const paymentEvidenceList = useMemo(
    () => paymentEvidences || [],
    [paymentEvidences]
  )

  const initializeDataStudentList = (result: Invoice[]) => {
    const resultWithPaymentLink = result.map((invoice: Invoice) => {
      const firstEnrollCourse = invoice.enrollCourses?.[0]
      if (!firstEnrollCourse) {
        return invoice
      }
      const { course } = firstEnrollCourse
      const coursePath = course?.path

      return {
        ...invoice,
        paymentLink: generatePaymentLink(
          invoice,
          coursePath ?? '',
          currentSchool as School,
          siteData.currentSite as Site
        ),
        sendWhatsapp: {
          phone: firstEnrollCourse?.phone || '',
          course: coursePath,
          enrolId: invoice.id.toString(),
          enrollIds: invoice.enrollCourses
            .map(ec => ec.id?.toString())
            .join(','),
          token: invoice.proofToken,
          name: firstEnrollCourse?.name || '',
        },
      }
    })

    if (resultWithPaymentLink.length > 0) {
      // Handle invalid dates
      const validDates = resultWithPaymentLink
        .map(student =>
          student.updatedAt ? new Date(student.updatedAt).getTime() : null
        )
        .filter((timestamp): timestamp is number => timestamp !== null)
      if (validDates.length > 0) {
        const earliestUpdatedAt = Math.min(...validDates)
        setChartDate({
          startDate: new Date(earliestUpdatedAt).toISOString().split('T')[0],
          endDate: formatDateRelativeToToday(0),
        })
      }
    }
    setInvoiceList(resultWithPaymentLink)
    setFilteredStudentList(resultWithPaymentLink)
  }

  const location = useLocation()

  const isModalOpen = useMemo(() => {
    return location.pathname !== '/application'
  }, [location.pathname])
  // Call both hooks unconditionally to comply with React's rules of hooks

  // Use the appropriate result based on user permission

  const {
    isLoading: isLoadingStudentList,
    isFetching: isFetchingStudentList,
    refetch,
  } = useFetchStudentInvoices(
    currentCourse ? currentCourse?.id : undefined,
    {
      isInitialRequest,
      search,
      ...(startDate && endDate
        ? {
            startDate: dayjs(startDate).startOf('day').toISOString(),
            endDate: dayjs(endDate).endOf('day').toISOString(),
          }
        : {}),
    },
    initializeDataStudentList,
    { enabled: !isModalOpen }
  )

  const courseStudentTable: GridOptions<
    PaymentProofTableItem & { checkbox: boolean }
  >['columnDefs'] = [
    {
      field: 'id',
      headerName: t('student:column.action') as string,
      filter: false,
      width: 100,
      cellRenderer: (data: ICellRendererParams) => {
        const studentData: PaymentProofTableItem = data?.data
        return (
          <ActionButtonCell
            studentInfo={studentData}
            paymentEvidenceList={paymentEvidenceList}
            onPaymentStateUpdate={() => {
              refreshData()
              refetch()
            }}
            navigate={navigate}
          />
        )
      },
      cellClass: '!flex !items-center !justify-center',
    },
    {
      headerName: t('student:userName') as string,
      valueGetter: params =>
        params.data?.enrollCourses?.[0]?.preferredName ||
        params.data?.enrollCourses?.[0]?.name ||
        params.data?.userAlias?.name ||
        '',
      filter: true,
      minWidth: 480,
      flex: 2,
      autoHeight: true,
      cellRenderer: (data: ICellRendererParams) => {
        if (!data || !data.data || !data.data.userAlias) return null

        const studentData: PaymentProofTableItem = data?.data
        const enrollCourses = studentData?.enrollCourses || []
        const studentSchedules = studentData?.studentSchedules || []

        // Group enrollCourses by userAlias.id — don't deduplicate across aliases
        type AliasGroup = {
          userAlias: PaymentProofTableEnrollCourse['userAlias']
          courses: Array<{
            enroll: EnrollIntoInfo
            enrollCourse: PaymentProofTableEnrollCourse
            schedules: typeof studentSchedules
          }>
        }
        const aliasMap = new Map<number, AliasGroup>()

        enrollCourses.forEach((enrollCourse: PaymentProofTableEnrollCourse) => {
          const aliasId = enrollCourse.userAlias?.id ?? studentData.userAlias.id
          if (!aliasMap.has(aliasId))
            aliasMap.set(aliasId, {
              userAlias: enrollCourse.userAlias ?? studentData.userAlias,
              courses: [],
            })
          const group = aliasMap.get(aliasId)!
          let enrollIntoArray: EnrollIntoInfo[] = []
          if (Array.isArray(enrollCourse.enrollInto)) {
            enrollIntoArray = enrollCourse.enrollInto
          } else if (enrollCourse.enrollInto) {
            enrollIntoArray = [enrollCourse.enrollInto]
          }
          enrollIntoArray.forEach(enroll => {
            const schedules = studentSchedules.filter(
              s => s.enrollCourseId === enrollCourse.id
            )
            group.courses.push({ enroll, enrollCourse, schedules })
          })
        })

        return (
          <div className="flex flex-col divide-y py-1 w-full overflow-hidden min-w-0">
            {Array.from(aliasMap.entries()).map(
              ([aliasId, { userAlias, courses }]) => {
                const filteredData: PaymentProofTableItem = {
                  ...studentData,
                  userAlias: userAlias ?? studentData.userAlias,
                  enrollCourses: enrollCourses.filter(
                    (ec: PaymentProofTableEnrollCourse) =>
                      (ec.userAlias?.id ?? studentData.userAlias.id) === aliasId
                  ),
                }
                return (
                  <div
                    key={aliasId}
                    className="flex flex-row items-center gap-3 py-1.5 overflow-hidden min-w-0"
                  >
                    <div className="shrink-0 w-[160px]">
                      <NameDropdownCell data={filteredData} />
                    </div>
                    {courses.length > 0 && (
                      <div className="flex flex-col gap-1 overflow-hidden min-w-0 flex-1">
                        {courses.map(
                          ({ enroll, enrollCourse, schedules }, i) => (
                            <EnrollCourseScheduleCell
                              key={`${aliasId}-${enroll.courseName}-${enroll.secondLevelName}-${i}`}
                              enrollCourse={enrollCourse}
                              enroll={enroll}
                              studentSchedules={schedules}
                            />
                          )
                        )}
                      </div>
                    )}
                  </div>
                )
              }
            )}
          </div>
        )
      },
      getQuickFilterText: params => {
        const { enrollCourses } = params.data
        const firstEnrollCourse = enrollCourses?.[0]
        if (!firstEnrollCourse) return ''
        const courseNames = (enrollCourses ?? [])
          .flatMap((ec: PaymentProofTableEnrollCourse) => {
            let arr: EnrollIntoInfo[] = []
            if (Array.isArray(ec.enrollInto)) {
              arr = ec.enrollInto
            } else if (ec.enrollInto) {
              arr = [ec.enrollInto]
            }
            return arr.map(e => `${e.courseName} ${e.secondLevelName}`)
          })
          .join(' ')
        return `${userAlias?.studentId ?? ''} ${
          firstEnrollCourse.preferredName || firstEnrollCourse.name || ''
        } ${
          firstEnrollCourse.preferredPhone || firstEnrollCourse.phone || ''
        } ${
          firstEnrollCourse.preferredEmail || firstEnrollCourse.email || ''
        } ${courseNames}`
      },
      cellClass: '!flex !items-start overflow-hidden',
    },
    {
      headerName: t('student:paymentAmount') as string,
      field: 'payAmount',
      width: 120,
      cellRenderer: (data: ICellRendererParams) => {
        const studentData: PaymentProofTableItem = data?.data
        return (
          <PaymentAmountCell
            data={studentData}
            filteredStudentList={filteredStudentList}
            setFilteredStudentList={setFilteredStudentList}
          />
        )
      },
      cellStyle: () => ({
        color: 'var(--color-text-subtle)',
      }),
    },
    {
      headerName: t('student:paymentStatus.status') as string,
      field: 'paymentState',
      filter: true,
      width: 120,
      // eslint-disable-next-line react/no-unused-prop-types
      cellRenderer: ({ value }: { value: string }) => {
        return <PaymentStatusCell value={value} />
      },
      cellClass: '!flex !items-center',
      cellStyle: ({ value }: { value: string }) => {
        let color = 'var(--color-text-subtle)'
        if (value === PaymentState.PENDING) {
          color = 'var(--color-warn)'
        } else if (value === PaymentState.CRITICAL) {
          color = 'var(--color-tertiary)'
        }
        return { color }
      },
    },
    {
      headerName: t('student:paymentMethod.method') as string,
      field: 'paymentMethod',
      filter: true,
      wrapText: true,
      autoHeight: true,
      width: 120,
      // eslint-disable-next-line react/no-unused-prop-types
      cellRenderer: ({ data }: ICellRendererParams<PaymentProofTableItem>) => {
        return data ? <PaymentMethodCell data={data} /> : null
      },

      cellClass: '!flex !items-center',
      cellStyle: ({ data }) => ({
        color: data?.payLaterMethod ? '' : 'var(--color-text-subtle)',
      }),
    },
    {
      headerName: t('student:receiptImage') as string,
      field: 'paymentEvidence',
      cellRenderer: (value: ICellRendererParams<PaymentProofTableItem>) => {
        return value.data ? (
          <PaymentReceiptStatusCell
            params={value.data}
            paymentEvidenceList={paymentEvidenceList}
            onPaymentStateUpdate={() => {
              refreshData()
              refetch()
            }}
            refetch={refetch}
          />
        ) : null
      },
      cellClass: '!flex !items-center',
    },

    {
      headerName: t('student:registrationForm.title') as string,
      // field: 'enrollCourses.0.registrationForm',
      cellRenderer: ({ data }: ICellRendererParams<PaymentProofTableItem>) => {
        return (
          <RegistrationFormCell
            value={data?.enrollCourses?.at(0)?.registrationForm || []}
          />
        )
      },
      cellClass: '!flex !items-center',
      getQuickFilterText: params => {
        const { enrollCourses } = params.data
        const firstEnrollCourse = enrollCourses?.[0]
        if (!firstEnrollCourse || !firstEnrollCourse.registrationForm) return ''
        return firstEnrollCourse.registrationForm
          .map(field => `${field.question} ${field.value}`)
          .join(',')
      },
    },
    {
      headerName: t('student:promotionUsed') as string,
      cellRenderer: ({ data }: ICellRendererParams<PaymentProofTableItem>) => {
        const currency = siteData.currentSite?.currency ?? ''
        return <PromotionCell currency={currency} data={data} t={t} />
      },
      width: 120,
      cellClass: '!flex !items-center',
    },
    {
      headerName: t(`setting:webpageSetting.currency`) as string,
      field: 'currency',
      filter: true,
      hide: true,
    },
    {
      headerName: t(`student:column.remarks`) as string,
      field: 'remark',
      filter: true,
      cellRenderer: (data: ICellRendererParams) => {
        const studentData: PaymentProofTableItem = data?.data
        return (
          <RemarksCell
            data={studentData}
            filteredStudentList={filteredStudentList}
            setFilteredStudentList={setFilteredStudentList}
          />
        )
      },
      cellClass: '!flex !items-center',
    },
    {
      headerName: t('student:paymentProof.paymentDate') as string,
      field: 'paymentDate',
      width: 150,
      cellRenderer: (data: ICellRendererParams) => {
        const studentData: PaymentProofTableItem = data?.data
        return (
          <PaymentDateCell
            data={studentData}
            filteredStudentList={filteredStudentList}
            setFilteredStudentList={setFilteredStudentList}
          />
        )
      },
      cellStyle: () => ({
        color: 'var(--color-text-subtle)',
      }),
    },
    {
      headerName: t(`student:column.lastUpdated`) as string,
      field: 'updatedAt',
      filter: true,
      cellRenderer: (data: ICellRendererParams<PaymentProofTableItem>) => {
        if (!data?.value) return <div />

        const updatedAt = utcToZonedTime(
          data?.value ?? '',
          siteData.currentSite?.timeZone.id || 'Asia/Hong_Kong'
        )

        return (
          <Box padding="sm" align="center">
            {dayjs(updatedAt).format('D MMM YYYY HH:mm')}
          </Box>
        )
      },
      cellClass: '!flex !items-center',
    },
    {
      headerName: t(`student:column.createdDate`) as string,
      field: 'createdAt',
      filter: true,
      cellRenderer: (data: ICellRendererParams<PaymentProofTableItem>) => {
        if (!data?.value) return <div />

        const createdAt = utcToZonedTime(
          data?.value ?? '',
          siteData.currentSite?.timeZone.id || 'Asia/Hong_Kong'
        )

        return (
          <Box padding="sm" align="center">
            {dayjs(createdAt).format('D MMM YYYY HH:mm')}
          </Box>
        )
      },
      cellClass: '!flex !items-center',
    },
    { headerName: 'ID', field: 'id', filter: true, hide: true },
  ]

  const filteredList = useMemo(() => {
    return filterPaymentProof(invoiceList || [], {
      selectedPaymentMethod: filterParams.paymentMethods,
      selectedCourse: filterParams.courses,
      selectedClass: filterParams.classes,
      selectedPaymentStatus: filterParams.paymentStatus,
      selectedPromotion: filterParams.promotions,
    })
  }, [
    invoiceList,
    filterParams.paymentMethods,
    filterParams.courses,
    filterParams.classes,
    filterParams.paymentStatus,
    filterParams.promotions,
  ])

  useEffect(() => {
    setFilteredStudentList(filteredList)
  }, [chartDate, filteredList])

  const todayISO = new Date().toISOString()

  const fieldsHeaders = useMemo(() => {
    return buildCustomFieldsHeader(
      currentCourse?.id as number,
      filterParams.courses,
      courseData?.courses || [],
      filteredStudentList,
      t
    )
  }, [
    currentCourse?.id,
    filterParams.courses,
    courseData?.courses,
    filteredStudentList,
    t,
  ])

  const csvHeaders = paymentProofCsvHeaders.map(d => ({
    ...d,
    label: d.key === 'id' ? d.label : t(d.label),
  }))

  const goToAutomationPage = useCallback(() => {
    navigate('/application/automation')
  }, [navigate])

  const RightHeaderContent = () => {
    return (
      <div className="flex items-center gap-2">
        <CSVLink
          headers={[...csvHeaders, ...fieldsHeaders]}
          data={formatCsvData(
            filteredStudentList.filter(list => !!list.enrollCourses?.at(0)),
            paymentEvidenceList,
            fieldsHeaders,
            siteData.currentSite?.timeZone.id
          )}
          filename={`${
            currentCourse?.name ??
            (t(`teachingService:allCourses`) as string) ??
            ''
          }_export_${todayISO}.csv`}
          target="_blank"
          style={{
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <Button className="self-end" variant="primary-outline">
            {t('student:exportCSV.title')}
          </Button>
        </CSVLink>
        <ChartDatePicker
          chartDate={chartDate}
          handleChartDateChange={handleChangeChartDate}
        />
      </div>
    )
  }

  const promotionOptions = useMemo(() => {
    const result: PromotionOption[] = []
    const couponLabel = t('promotion:titles.coupon')
    listCoupons.forEach(o => {
      result.push({
        label: `${couponLabel}: ${o.code}`,
        value: `${o.id}`,
        source: 'coupon',
        originalId: o.id ?? 0,
      })
    })

    const additionalFeeLabel = t('setting:additionalFee.title')
    listAdditionalFee?.forEach(o => {
      result.push({
        label: `${additionalFeeLabel}: ${o.name}`,
        value: `${o.id}`,
        source: 'additionalFee',
        originalId: o.id,
      })
    })
    return result
  }, [listCoupons, listAdditionalFee])

  const handleReset = () => {
    setFilterParams({
      classes: [],
      courses: [],
      paymentMethods: [],
      paymentStatus: [],
      promotions: [],
    })
    setChartDate(initialDate)
    setParams(prev => {
      prev.delete('search')
      return prev
    })
    gridRef?.current?.api.setFilterModel(null)
    if (inputRef.current) inputRef.current.value = ''
    if (courseRef.current) courseRef.current.clearValue()
    if (statusRef.current) statusRef.current.clearValue()
    if (paymentMethodRef.current) paymentMethodRef.current.clearValue()
    if (promotionRef.current) promotionRef.current.clearValue()
    if (classRef.current) classRef.current.clearValue()
    refreshData()
    refetch()
  }

  const isDateRangeChanges = useMemo(() => {
    return (
      startDate &&
      endDate &&
      startDate !== initialDate.startDate &&
      endDate !== initialDate.endDate
    )
  }, [startDate, endDate])

  useEffect(() => {
    if (isDateRangeChanges) {
      setIsInitialRequest(false)
      setTimeout(() => {
        refetch()
      }, 1000)
    }
  }, [isDateRangeChanges])

  return (
    <ContentLayout
      rightHeader={<RightHeaderContent />}
      leftHeader={<Heading>{t('student:paymentRecord')}</Heading>}
    >
      <div className="px-4 pt-2 box-col-full">
        <BulkActionComponent
          selectedRows={selectedPaymentProofList}
          selectedCount={selectedPaymentProofList.length}
          countText={t('student:paymentProof.selectedRecords')}
          onClearSelection={handleClearSelection}
          isLoadingApprove={isLoadingConfirm}
          isLoadingReject={isLoadingReject}
          handleApprove={handleApprove}
          handleReject={handleReject}
          paymentEvidenceList={paymentEvidenceList}
        />

        <div className="box-col-full">
          <QuickFilterTable
            onSelectionChanged={onSelectionChanged}
            getRowId={row => getRowId('id', row)}
            hasCheckboxSelection
            rowData={filteredStudentList}
            useUrlSearch
            columns={courseStudentTable ?? []}
            isLoading={isLoadingStudentList || isFetchingStudentList}
            gridRef={gridRef}
            inputRef={inputRef}
            height={dynamicHeight}
            handleReset={handleReset}
            hasFilterSelection
            filterSelector={({ handleReset: reset }) => (
              <div className="box-responsive-full">
                <div className="md:flex w-full flex-row items-center justify-center gap-2 p-0 space-y-1">
                  <CourseAndClassSelector
                    options={options}
                    value={[
                      ...filterParams.courses.map(course => ({
                        value: parseInt(course.value.toString(), 10),
                        label: String(course.label),
                        course: String(course.label),
                        courseId: parseInt(course.value.toString(), 10),
                        previewImageUrl: null,
                      })),
                      ...filterParams.classes.map(cls => {
                        const course = courseData.courses?.find(c =>
                          c.classes?.some(
                            classItem =>
                              classItem.id ===
                              parseInt(cls.value.toString(), 10)
                          )
                        )
                        return {
                          value: parseInt(cls.value.toString(), 10),
                          label: String(cls.label),
                          course: course?.name || 'Unknown Course',
                          courseId: course?.id || 0,
                          previewImageUrl: null,
                        }
                      }),
                    ]}
                    onChange={selected => {
                      if (selected) {
                        // Distinguish courses from classes: if value === courseId, it's a course selection
                        // Otherwise, it's a class selection
                        const courses = selected
                          .filter(option => option.value === option.courseId)
                          .map(option => ({
                            value: option.value.toString(),
                            label: option.course || option.label,
                          }))

                        const classes = selected
                          .filter(option => option.value !== option.courseId)
                          .map(option => ({
                            value: option.value.toString(),
                            label: option.label,
                          }))

                        onChangeFilterParams('courses', courses)
                        onChangeFilterParams('classes', classes)
                      } else {
                        onChangeFilterParams('courses', [])
                        onChangeFilterParams('classes', [])
                      }
                    }}
                    width="100%"
                  />
                </div>
                <div className="md:flex w-full flex-row items-center justify-center gap-2 p-0 space-y-1">
                  <LabelSelector
                    options={paymentStatusOptions.map(option => ({
                      ...option,
                      label: t(option.label).toString(),
                    }))}
                    onChange={e => onChangeFilterParams('paymentStatus', e)}
                    selectOption={filterParams.paymentStatus}
                    placeHolder={t('student:paymentProof.allStatus')}
                    selectStyles={selectCustomStyles()}
                    ref={statusRef}
                    isMulti
                  />
                  {/* <LabelSelector
                      options={paymentMethodOptions ?? []}
                      onChange={e => onChangeFilterParams('paymentMethods', e)}
                      selectOption={filterParams.paymentMethods}
                      placeHolder={t('student:paymentProof.allPaymentMethod')}
                      selectStyles={selectCustomStyles()}
                      ref={paymentMethodRef}
                      isMulti
                    /> */}
                  <LabelSelector
                    options={promotionOptions ?? []}
                    onChange={e => onChangeFilterParams('promotions', e)}
                    selectOption={filterParams.promotions}
                    placeHolder={t('student:paymentProof.promotionFeeUsed')}
                    selectStyles={selectCustomStyles()}
                    ref={promotionRef}
                    isMulti
                  />

                  <Button className="w-full md:w-[80px]" onClick={reset}>
                    {t('recordLogs:notificationLogs.selectLabels.reset')}
                  </Button>
                </div>
              </div>
            )}
          />
        </div>
      </div>
      <Outlet />
    </ContentLayout>
  )
}
const selectCustomStyles = (): StylesConfig => ({
  control: styles => ({
    ...styles,
    backgroundColor: 'white',
  }),
})

export default PaymentProofPage
