import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import {
  ColDef,
  ColumnMovedEvent,
  GetQuickFilterTextParams,
  ICellRendererParams,
  IRowNode,
  ValueGetterParams,
} from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { utcToZonedTime } from 'date-fns-tz'
import Cookies from 'js-cookie'
import { useTranslation } from 'react-i18next'
import { LuEye, LuFilter } from 'react-icons/lu'
import { useQuery } from 'react-query'
import { MultiValue, StylesConfig } from 'react-select'
import { useRecoilState, useRecoilValue } from 'recoil'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { getAllStudentsOfInstitutionNew } from '@/api/student'
import ChartDatePicker from '@/components/DatePickers/ChartDatePicker'
import DropdownMenu, {
  DropDownMenuItemType,
} from '@/components/DropDownMenus/DropDownMenu'
import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import CourseAndClassSelector from '@/components/Selector/CourseAndClassSelector'
import LabelSelector, {
  LabelSelectorRef,
} from '@/components/Selector/LabelSelector'
import { SelectItemValuesProps } from '@/components/Selector/Select'
import QuickFilterTable from '@/components/Tables/QuickFilterTable'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { Badge } from '@/components/ui/Badge'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/HoverCard'
import { STALE_TIME } from '@/constants/common'
import { PaymentState } from '@/constants/payment'
import { QUERY_KEY } from '@/constants/queryKey'
import useCheckPermissionAndQuota from '@/hooks/useCheckPermissionAndQuota'
import useCourseData from '@/hooks/useCourseData'
import useDynamicHeight from '@/hooks/useDynamicHeight'
import useEnrollmentFormData from '@/hooks/useEnrollmentFormData'
import { useResponsive } from '@/hooks/useResponsive'
import useSiteData from '@/hooks/useSiteData'
import useStudentData from '@/hooks/useStudentData'
import ContentLayout from '@/layouts/ContentLayout'
import CustomFormFieldFilter, {
  CustomFieldFilterOption,
} from '@/pages/StudentCRM/components/CustomFormFieldFilter'
import ImportCSVModal, {
  ImportCSVModalHandle,
} from '@/pages/StudentCRM/CSV/ImportCSVModal'
import ProtectedComponent from '@/routes/ProtectedComponent'
import { schoolState } from '@/stores/schoolData'
import { AddTeachingServiceMode, studentState } from '@/stores/studentData'
import { userState } from '@/stores/userData'
import {
  AboveInstructorRoles,
  userPermissionState,
  UserRole,
} from '@/stores/userPermissionData'
import { ChartDate } from '@/types/chartDate.type'
import { FilterMatchMode } from '@/types/options'
import { StudentEnrolmentRecord } from '@/types/student'
import { getInitialChartDateRange } from '@/utils/chartjsSetup'
import { convertCustomFieldToValue } from '@/utils/convert'
import { generateDataTestId } from '@/utils/data-testid.utils'
import dayjs from '@/utils/dayjs'
import { formatPhoneNumber, getRowId } from '@/utils/misc'
import { extractFieldId } from '@/utils/string'
import { formatDateRelativeToToday } from '@/utils/timeString'

import CreateCouponCode from '../Promotion/Coupons/CreateCouponCode'
import CreateTeachingService from '../StudentDetail/components/createTeachingService'

import ActionButton from './components/ActionButton'
import BadgeParentStudent from './components/BadgeParentStudent'
import SelectionActionBulk from './components/SelectionActionBulk'
import TeachingServiceEnrolledColumn from './components/TeachingServiceEnrolledRow'
import TeachingServiceNameColumn from './components/TeachingServiceNameColumn'
import ExportCSV from './CSV/ExportCSV'

export type FilterParams = {
  selectedCourse: MultiValue<SelectItemValuesProps>
  selectedPaymentStatus: MultiValue<SelectItemValuesProps> | null
  startDate: string
  endDate: string
  selectedClass: MultiValue<SelectItemValuesProps>
  search?: string | null
}

const selectorStyles = (): StylesConfig => ({
  control: styles => ({
    ...styles,
    backgroundColor: 'white',
  }),
  valueContainer: styles => ({
    ...styles,
    width: '100%',
  }),
  container: styles => ({
    ...styles,
    flex: '1',
  }),
})

const CUSTOM_COLUMN_COOKIE_KEY = 'student-crm-custom-columns'
const COLUMN_ORDER_COOKIE_KEY = 'student-crm-table-column-order'

// Helper to rearrange columns based on a saved order
const rearrangeColumnsByOrder = (
  columns: ColDef[],
  order: string[]
): ColDef[] => {
  const colMap = new Map(columns.map(col => [col.field, col]))

  const orderWithoutDuplicates = Array.from(order)

  // Add any columns not in the cookie (e.g., new columns)
  const remaining = columns.filter(
    col => !orderWithoutDuplicates.includes(col.field as string)
  )
  const allColumns = [
    ...(orderWithoutDuplicates
      .map(field => colMap.get(field))
      .filter(Boolean) as ColDef[]),
    ...remaining,
  ]

  // Remove duplicates by 'field' key, keep first occurrence
  const seen = new Set()
  const uniqueColumns = allColumns.filter(col => {
    if (seen.has(col.field)) return false
    seen.add(col.field)
    return true
  })

  return uniqueColumns
}

const StudentDatabase = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const gridRef = useRef<AgGridReact<StudentEnrolmentRecord>>(null)

  const [schoolData] = useRecoilState(schoolState)
  const currentSchoolId = schoolData.currentSchool?.id || 0

  const userPermission = useRecoilValue(userPermissionState)
  const currentUser = useRecoilValue(userState)

  const { siteData, timeZone } = useSiteData()
  const currentSiteId = siteData.currentSite?.id || 0

  const { isMobile } = useResponsive()
  const { useFetchCustomFieldFilterStudentData } = useStudentData()

  const [selectedTab] = useState<string>('ALL')
  const { courseData, getFilteredCourseOptions } = useCourseData()
  const [studentData, setStudentData] = useRecoilState(studentState)
  const {
    tableDrawers: {
      isOpenCreateCoupon,
      isOpenAssignCourse,
      isOpenCustomFieldFilter,
    },
  } = studentData

  const options = getFilteredCourseOptions()

  const [hasCustomDataField, setHasCustomDataField] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()
  const startDate = useMemo(() => {
    return searchParams.get('startDate') || ''
  }, [searchParams])

  const endDate = useMemo(() => {
    return searchParams.get('endDate') || ''
  }, [searchParams])

  const [chartDate, setChartDate] = useState<ChartDate>({
    startDate: startDate || formatDateRelativeToToday(7),
    endDate: endDate || formatDateRelativeToToday(0),
  })
  const [paymentViewChartDate, setPaymentViewChartDate] = useState<ChartDate>({
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
  })
  const handlePaymentViewMonthChange = (date: ChartDate) => {
    setPaymentViewChartDate(date)
  }
  const [filteredStudentList, setFilteredStudentList] = useState<
    StudentEnrolmentRecord[]
  >([])

  const importCSVModalHandle = useRef<ImportCSVModalHandle>(null)
  const handlePrev = () => {
    importCSVModalHandle.current?.handleOpenChange?.()
  }
  const statusRef = useRef<LabelSelectorRef>(null)
  const classRef = useRef<LabelSelectorRef>(null)

  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<MultiValue<SelectItemValuesProps> | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<
    MultiValue<SelectItemValuesProps>
  >([])
  const [selectedClass, setSelectedClass] = useState<
    MultiValue<SelectItemValuesProps>
  >([])
  const [customFieldFilterList, setCustomFieldFilterList] = useState<
    CustomFieldFilterOption[]
  >([])

  const [selectedMatchMode, setSelectedMatchMode] = useState<FilterMatchMode>(
    FilterMatchMode.Any
  )
  const [resetSearchTrigger, setResetSearchTrigger] = useState(0)

  const { isLoadingPermissionAndQuota } = useCheckPermissionAndQuota()

  const { useFetchListEnrollmentFormFields } = useEnrollmentFormData()
  const { data: fieldsCustom } = useFetchListEnrollmentFormFields()

  const [customFieldColumns, setCustomFieldColumns] = useState<ColDef[]>([])

  // Helper to persist custom field column IDs to cookie
  const persistCustomFieldColumnIds = (columns: ColDef[]) => {
    if (!columns || columns.length === 0) {
      Cookies.remove(CUSTOM_COLUMN_COOKIE_KEY)
      return
    }
    // Extract field IDs from column field names like 'custom_123'
    const fieldIds = columns
      .map(col => {
        if (typeof col.field === 'string' && col.field.startsWith('custom_')) {
          const id = Number(col.field.replace('custom_', ''))
          return Number.isNaN(id) ? null : id
        }
        return null
      })
      .filter((id): id is number => id !== null)

    Cookies.set(
      CUSTOM_COLUMN_COOKIE_KEY,
      JSON.stringify([...new Set(fieldIds)]),
      {
        expires: 365,
      }
    )
  }

  // Restore custom field columns and column order from cookies
  const restoreCustomFieldColumnsAndOrder = (
    fieldsCustom: any[],
    setCustomFieldColumns: (cols: ColDef[]) => void
  ) => {
    if (!fieldsCustom) return
    const cookie = Cookies.get(CUSTOM_COLUMN_COOKIE_KEY)
    const columns: ColDef[] = []

    // Check if student ID column should be included (from localStorage)
    const showStudentIdColumn =
      localStorage.getItem('showStudentIdColumn') === 'true'
    if (showStudentIdColumn) {
      columns.push({
        field: 'id',
        headerName: 'ID',
        filter: false,
        sortable: true,
        width: 100,
      })
    }

    if (cookie) {
      try {
        const fieldIds: number[] = JSON.parse(cookie)
        const customColumns = fieldIds
          .map(fieldId => {
            const field = fieldsCustom.find(f => f.id === fieldId)
            if (!field) return null
            return {
              field: `custom_${fieldId}`,
              headerName: String(field.question || ''),
              filter: false,
              sortable: true,
            }
          })
          .filter(Boolean)
        columns.push(...(customColumns as ColDef[]))
        setCustomFieldColumns(columns)
      } catch {
        setCustomFieldColumns(columns)
      }
    } else {
      setCustomFieldColumns(columns)
    }
  }

  const setCustomFieldColumnsAndPersist = (val: ColDef[]) => {
    setCustomFieldColumns(val)
    persistCustomFieldColumnIds(val)
    // When custom columns change, also persist the new order
    // We'll persist the order of the current table columns (base + custom)
  }

  // On fieldsCustom load, initialize customFieldColumns from cookie
  useEffect(() => {
    restoreCustomFieldColumnsAndOrder(fieldsCustom || [], setCustomFieldColumns)
  }, [fieldsCustom])

  // Read column order from cookie
  const columnOrderCookie = Cookies.get(COLUMN_ORDER_COOKIE_KEY)

  const getCustomFieldFilterStudentData = useFetchCustomFieldFilterStudentData(
    async (data: any) => {
      setStudentData(prev => ({
        ...prev,
        tableDrawers: {
          ...prev.tableDrawers,
          isOpenCustomFieldFilter: false,
        },
      }))

      await refetchAllStudents()
      setFilteredStudentList(data)
    }
  )

  const search = searchParams.get('search')
  const payload = useMemo(() => {
    return {
      search,
      startDate: chartDate.startDate,
      endDate: chartDate.endDate,
    }
  }, [search, chartDate])

  const {
    isLoading,
    isFetching,
    data: studentList,
    refetch: refetchAllStudents,
  } = useQuery(
    [QUERY_KEY.student.studentListNewKey, currentSchoolId],
    () =>
      getAllStudentsOfInstitutionNew({
        id: currentSchoolId,
        siteId: +currentSiteId,
        userRoleId:
          currentUser.isLogin &&
          (AboveInstructorRoles.includes(userPermission) ||
            userPermission === UserRole.Guest)
            ? undefined
            : currentUser.id,
        type: 'ALL',
        payload,
      }),
    {
      onSuccess: (data: StudentEnrolmentRecord[]) => {
        const processedData = data.map((student: StudentEnrolmentRecord) => {
          let currentEmail = student.email
          let currentPhone = student.phone
          const currentName = student.name

          if (student.user) {
            if (!currentEmail) {
              currentEmail = student.user.email
            }
            if (!currentPhone) {
              currentPhone = student.user.phone
            }
          }

          return {
            ...student,
            name: currentName,
            email: currentEmail,
            phone: currentPhone,
          }
        })

        // Sort by phone number to group students with the same phone together for spanRows
        const sortedData = [...processedData].sort((a, b) => {
          const phoneA = a.phone || a.user?.phone || ''
          const phoneB = b.phone || b.user?.phone || ''
          return phoneA.localeCompare(phoneB)
        })

        setFilteredStudentList(sortedData)
        return sortedData
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
      enabled: !!currentSchoolId,
      staleTime: STALE_TIME,
    }
  )

  useEffect(() => {
    setHasCustomDataField(
      Array.isArray(fieldsCustom) && fieldsCustom.length > 0
    )
  }, [fieldsCustom])

  const handleCourseChange = (
    selectedOption: MultiValue<SelectItemValuesProps>
  ) => {
    if (selectedOption !== null) {
      setSelectedCourse(selectedOption)
      setSelectedClass([])
      classRef.current?.clearValue()
    }
  }
  const handleClassChange = (
    selectedOption: MultiValue<SelectItemValuesProps>
  ) => {
    if (selectedOption !== null) {
      setSelectedClass(selectedOption)
    }
  }
  const handleImportCSV = () => {
    setStudentData({
      ...studentData,
      tableDrawers: { ...studentData.tableDrawers, isOpenImportCsv: true },
    })
    importCSVModalHandle.current?.handleOpenChange?.()
  }

  const tableColumns: ColDef[] = useMemo(() => {
    const baseColumns = [
      {
        colId: '_clusterKey',
        headerName: '_clusterKey',
        hide: true,
        valueGetter: p => {
          if (p.data.isStudentParent) return p.data.id
          return p.data.childOfUserAliasId ?? Number.MAX_SAFE_INTEGER
        },
        sort: 'asc' as any,
        sortIndex: 0,
      },
      {
        colId: '_clusterRank',
        headerName: '_clusterRank',
        hide: true,
        valueGetter: p => {
          if (p.data.isStudentParent) return 0
          return p.data.childOfUserAliasId ? 1 : 2
        },
        sort: 'asc' as any,
        sortIndex: 1,
      },
      {
        field: 'Action',
        headerName: '',
        filter: false,
        sortable: false,
        lockPosition: true,
        width: 80,

        cellRenderer: (data: ICellRendererParams) => {
          const studentData: StudentEnrolmentRecord = data?.data

          return (
            <div className="flex items-center gap-2 min-h-[60px] justify-center">
              <Box align="center">
                <ActionButton
                  selectedTab={selectedTab}
                  studentInfo={studentData}
                  refetchAllStudents={refetchAllStudents}
                />
              </Box>
              <div className="cursor-pointer" data-testid="view-detail-button">
                <LuEye
                  size={20}
                  data-testid={generateDataTestId(
                    'view-detail-button',
                    studentData.name
                  )}
                  className="text-primary"
                  onClick={e => {
                    e.stopPropagation()
                    navigate(
                      `/student-record/${studentData.id}?userId=${studentData.userId}`
                    )
                  }}
                />
              </div>
            </div>
          )
        },
      },
      {
        field: 'phone',
        filter: false,
        headerName: t('student:column.phone').toString(),
        width: 140,
        valueGetter: (params: ValueGetterParams) => {
          const studentData: StudentEnrolmentRecord = params.data
          return studentData.phone || studentData.user?.phone
        },

        spanRows: ({ valueA, valueB }) => {
          // Only span if both phones exist and are the same (avoid spanning empty phones)
          return valueA && valueB && valueA.trim() !== '' && valueA === valueB
        },
        cellRenderer: (data: ICellRendererParams) => {
          const studentData: StudentEnrolmentRecord = data?.data
          const phoneNumber = studentData.phone || studentData.user?.phone

          return (
            <div className="flex items-center justify-center min-h-[60px]">
              <div className="text-center">
                {formatPhoneNumber(phoneNumber)}
              </div>
            </div>
          )
        },
        getQuickFilterText: (params: GetQuickFilterTextParams) => {
          const data = params.data as StudentEnrolmentRecord
          return data.phone || data.user?.phone || ''
        },
      },
      {
        field: 'name',
        filter: false,
        headerName: t('student:column.name').toString(),
        width: 200,
        cellRenderer: (data: ICellRendererParams) => {
          const studentData: StudentEnrolmentRecord = data?.data

          return (
            <div className="min-h-[60px] flex items-center px-2 gap-2">
              <BadgeParentStudent
                studentData={studentData}
                studentList={studentList}
              />
              <TeachingServiceNameColumn
                data={studentData}
                value={studentData.name}
              />
            </div>
          )
        },
        cellClass: '!flex !items-center',
      },
      {
        colId: 'email',
        headerName: (t('student:column.email') as string) || '',
        width: 200,
        minWidth: 180,
        filter: false,
        valueGetter: (params: ValueGetterParams) =>
          (params.data as StudentEnrolmentRecord).id,
        spanRows: true,
        getQuickFilterText: (params: GetQuickFilterTextParams) => {
          const row = params.data as StudentEnrolmentRecord
          return [row.email || row.user?.email || '', row.secondaryEmail || '']
            .filter(Boolean)
            .join(' ')
        },
        cellRenderer: (params: ICellRendererParams) => {
          const row = params.data as StudentEnrolmentRecord
          const primary = row.email || row.user?.email || '-'
          const secondary = row.secondaryEmail
          return (
            <div className="flex flex-col gap-0.5">
              <span>{primary}</span>
              {secondary && (
                <span className="text-[11px] text-gray-400">{secondary}</span>
              )}
            </div>
          )
        },
        cellClass: '!flex !items-center',
      },
      {
        colId: 'createdByEmail',
        headerName:
          (t('student:column.createdByEmail') as string) || 'Created By',
        width: 200,
        minWidth: 160,
        filter: false,
        valueGetter: (params: ValueGetterParams) =>
          (params.data as StudentEnrolmentRecord).id,
        spanRows: true,
        cellRenderer: (params: ICellRendererParams) => {
          const row = params.data as StudentEnrolmentRecord
          const emails = new Set<string>()
          ;(row.enrollCourses ?? []).forEach(ec => {
            const inv = ec.invoice ?? ec.invoices?.[0]
            if (inv?.createdByUser?.email) emails.add(inv.createdByUser.email)
          })
          const label = emails.size > 0 ? [...emails].join(', ') : '—'
          return <span className="text-sm">{label}</span>
        },
        cellClass: '!flex !items-center',
      },
      {
        colId: 'numClasses',
        headerName:
          (t('student:column.numClasses') as string) || 'No. of classes',
        width: 90,
        minWidth: 80,
        filter: false,
        valueGetter: (params: ValueGetterParams) =>
          (params.data as StudentEnrolmentRecord).id,
        spanRows: true,
        cellClass: '!flex !items-center',
        cellRenderer: (params: ICellRendererParams) => {
          const row = params.data as StudentEnrolmentRecord
          const currentMonth = dayjs().format('YYYY-MM')
          const count =
            row.enrollCourses?.filter(
              o =>
                o.course &&
                o.studentSchedule?.some(schedule =>
                  schedule.studentLessons?.some(
                    lesson =>
                      lesson.endTime &&
                      dayjs(lesson.endTime).format('YYYY-MM') === currentMonth
                  )
                )
            ).length ?? 0
          return <span className="tabular-nums">{count}</span>
        },
      },
      {
        colId: 'classLabel',
        headerName: t('student:column.teachingServiceEnrolled') as string,
        width: 220,
        valueGetter: (params: ValueGetterParams) => {
          const studentData: StudentEnrolmentRecord = params.data
          return studentData.email || studentData.user?.email
        },

        cellRenderer: (data: ICellRendererParams) => {
          const studentData: StudentEnrolmentRecord = data?.data

          return (
            <div className="text-sm min-h-[60px] flex items-center px-2">
              {studentData.email || studentData.user?.email || ''}
            </div>
          )
        },
      },
      {
        field: 'class',
        width: 400,
        autoHeight: true,
        headerName: t('student:column.teachingServiceEnrolled').toString(),
        filter: false,
        sortable: false,
        getQuickFilterText: (params: GetQuickFilterTextParams) => {
          const data = params.data as StudentEnrolmentRecord

          const enrollCourses = (data?.enrollCourses || [])?.filter(o => {
            return o.course && o.studentSchedule
          })
          return (enrollCourses ?? [])
            .reduce<string[]>((acc, course) => {
              const classNames =
                course.studentSchedule
                  ?.map(schedule => schedule.class?.name)
                  .filter((name): name is string => Boolean(name)) ?? []
              return course.course?.name
                ? [...acc, ...classNames, course.course.name]
                : [...acc, ...classNames]
            }, [])
            .join(' ')
        },
        cellRenderer: (props: ICellRendererParams) => {
          const studentData: StudentEnrolmentRecord = props?.data

          return (
            <div className="min-h-[60px] flex items-start px-2 py-2">
              <TeachingServiceEnrolledColumn enrolledStudent={studentData} />
            </div>
          )
        },
      },
      {
        field: 'user.updatedAt',
        filter: false,
        headerName: t('student:column.lastUpdated').toString(),
        width: 220,
        cellRenderer: (data: ICellRendererParams) => {
          const studentData: StudentEnrolmentRecord = data?.data

          const updatedAt = utcToZonedTime(
            studentData?.user?.updatedAt ?? '',
            timeZone ?? ''
          )
          return (
            <div className="text-center min-h-[60px] flex items-center justify-center px-2">
              {dayjs(updatedAt).format('YYYY-MM-DD hh:mm a')}
            </div>
          )
        },
      },
      {
        field: 'user.createdAt',
        filter: false,
        headerName: t('student:column.createdAt').toString(),
        width: 220,
        cellRenderer: (data: ICellRendererParams) => {
          const studentData: StudentEnrolmentRecord = data?.data

          const createdAt = utcToZonedTime(
            studentData?.user?.createdAt ?? '',
            timeZone ?? ''
          )
          return (
            <div className="text-center flex items-center justify-center p-2">
              {studentData?.user?.createdAt
                ? dayjs(createdAt).format('YYYY-MM-DD hh:mm a')
                : '-'}
            </div>
          )
        },
      },
    ]

    const customFieldColumnsWithValue = customFieldColumns.map(col => {
      // Extract fieldId from col.field (e.g., 'custom_123')
      let fieldId: number | null = null
      if (typeof col.field === 'string' && col.field.startsWith('custom_')) {
        const maybeId = Number(col.field.replace('custom_', ''))
        fieldId = Number.isNaN(maybeId) ? null : maybeId
      }
      return {
        ...col,
        value: col.field,
        cellRenderer: (data: ICellRendererParams) => {
          const studentData: StudentEnrolmentRecord = data?.data

          // Find the registrationForm for this fieldId
          const allStudentForms = studentData.studentForms

          const form = allStudentForms?.find(
            (f: any) => extractFieldId(f.formFieldId) === fieldId?.toString()
          )

          const value = form
            ? convertCustomFieldToValue({
                fieldValue: form.formFieldValue,
                fieldType: form.formFieldType,
                t,
              })
            : '-'

          return (
            <div className="text-sm flex items-center px-2 py-4">{value}</div>
          )
        },
        getQuickFilterText: (params: GetQuickFilterTextParams) => {
          const data = params.data as StudentEnrolmentRecord
          const { isMerged } = data as any
          const { mergedStudents } = data as any

          if (isMerged && mergedStudents) {
            // For merged rows, get all custom field values
            return mergedStudents
              .map((student: StudentEnrolmentRecord) => {
                const form = student.studentForms?.find(
                  (f: any) =>
                    extractFieldId(f.formFieldId) === fieldId?.toString()
                )
                return form?.formFieldValue?.toString() ?? ''
              })
              .join(' ')
          }

          const form = data.studentForms?.find(
            (f: any) => extractFieldId(f.formFieldId) === fieldId?.toString()
          )
          return form?.formFieldValue?.toString() ?? ''
        },
      }
    })

    const allColumns = [...baseColumns, ...customFieldColumnsWithValue]

    if (columnOrderCookie) {
      try {
        const order: string[] = JSON.parse(columnOrderCookie)

        return rearrangeColumnsByOrder(allColumns, order)
      } catch {
        return allColumns
      }
    }
    return allColumns
  }, [t, filteredStudentList, customFieldColumns, columnOrderCookie])

  // Handler for column moved event
  const onColumnMoved = useCallback(
    ({ columns, toIndex: movedToIndex }: ColumnMovedEvent) => {
      if (
        !columns ||
        columns.length === 0 ||
        typeof movedToIndex !== 'number'
      ) {
        return
      }
      const movedField = columns[0].getColId()
      const currentOrder = tableColumns.map(col => col.field)

      const fromIndex = currentOrder.indexOf(movedField)

      const realMoveToIndex = movedToIndex - 1

      if (fromIndex === -1 || realMoveToIndex === -1) {
        return
      }

      const newOrder = [...currentOrder]
      newOrder.splice(realMoveToIndex, 0, movedField)
      // newOrder.splice(fromIndex, 1)

      const filteredNewOrder = Array.from(new Set(newOrder))

      Cookies.set(COLUMN_ORDER_COOKIE_KEY, JSON.stringify(filteredNewOrder), {
        expires: 365,
      })
    },
    [tableColumns]
  )

  const mobileMenuItems: DropDownMenuItemType[] = [
    {
      type: 'separator',
    },
    {
      type: 'item',
      disabled: isLoadingPermissionAndQuota,
      content: (
        <>
          <Text>{t('student:importCsv.title')}</Text>
        </>
      ),
      onClick: () => handleImportCSV(),
    },
    {
      type: 'separator',
    },
    {
      type: 'item',
      disabled: isLoadingPermissionAndQuota,
      content: <Text>{t('student:createStudent')}</Text>,
      onClick: () => {
        setStudentData(prev => ({
          ...prev,
          tableDrawers: {
            ...prev.tableDrawers,
            isOpenAssignCourse: true,
            assignCourseMode: AddTeachingServiceMode.addStudentOnly,
          },
        }))
      },
    },
  ]

  const rightHeaderContent = (
    <Box>
      {isMobile ? (
        <Box align="center">
          <DropdownMenu
            menuItems={mobileMenuItems}
            contentProps={{ minWidth: '16rem', zIndex: 999 }}
          />
        </Box>
      ) : (
        <>
          <span className="text-sm font-medium text-gray-500">
            {dayjs().format('MMMM YYYY')}
          </span>
          <ChartDatePicker
            mode="month"
            chartDate={paymentViewChartDate}
            handleChartDateChange={handlePaymentViewMonthChange}
            includeFuture
          />
          <ExportCSV data={filteredStudentList} timeZoneId={timeZone} />

          <ProtectedComponent
            roleAllowed={[UserRole.SiteAdmin, UserRole.SchoolAdmin]}
          >
            <>
              <Button
                disabled={isLoadingPermissionAndQuota}
                onClick={() => handleImportCSV()}
                variant="primary-outline"
                // disabled
              >
                {t('student:importCsv.title')}
              </Button>
              <Button
                data-testid="create-student-btn"
                onClick={() => {
                  setStudentData(prev => ({
                    ...prev,
                    tableDrawers: {
                      ...prev.tableDrawers,
                      isOpenAssignCourse: true,
                      assignCourseMode: AddTeachingServiceMode.addStudentOnly,
                    },
                  }))
                }}
              >
                {t('student:createStudent')}
              </Button>
            </>
          </ProtectedComponent>
        </>
      )}
    </Box>
  )
  const dynamicHeight = useDynamicHeight()

  const paymentStatusOptions = [
    {
      value: PaymentState.PAID,
      label: t('teachingService:paymentStatus.paid'),
    },
    {
      value: PaymentState.PENDING,
      label: t('teachingService:paymentStatus.pending'),
    },
    {
      value: PaymentState.SUBMITTED,
      label: t('teachingService:paymentStatus.submitted'),
    },
    {
      value: PaymentState.PENDING,
      label: t('teachingService:paymentStatus.unpaid'),
    },
  ]

  const filterStudentData = useCallback(
    (
      studentData: StudentEnrolmentRecord[],
      filters: FilterParams
    ): StudentEnrolmentRecord[] => {
      let result = studentData

      if (filters.search && filters.search.trim()) {
        const searchLower = filters.search.trim().toLowerCase()
        const searchDigitsOnly = searchLower.replace(/\D/g, '')
        result = result.filter(student => {
          const name = student.name || ''
          const email = student.email || student.user?.email || ''
          const phone = student.phone || student.user?.phone || ''
          const phoneDigitsOnly = phone.replace(/\D/g, '')
          const studentId = student.studentId ?? ''
          const id = String(student.id ?? '')
          return (
            name.toLowerCase().includes(searchLower) ||
            email.toLowerCase().includes(searchLower) ||
            phone.toLowerCase().includes(searchLower) ||
            formatPhoneNumber(phone).toLowerCase().includes(searchLower) ||
            (searchDigitsOnly.length > 0 && phoneDigitsOnly.includes(searchDigitsOnly)) ||
            studentId.toLowerCase().includes(searchLower) ||
            id.includes(searchLower)
          )
        })
      }

      const filteredList = result.filter(({ enrollCourses, user }) => {
        const hasMatchingCourseId =
          (filters.selectedCourse.length === 0 &&
            filters.selectedClass.length === 0) ||
          enrollCourses?.some(({ course, studentSchedule }) => {
            let isCourse = true
            if (filters.selectedCourse.length) {
              isCourse = filters.selectedCourse.some(co => {
                return +co.value === course?.id
              })
            }

            let isClass = true

            const classes = studentSchedule?.map(s => s.class?.id)

            if (filters.selectedClass.length) {
              isClass = filters.selectedClass.some(co => {
                return +co.value === classes?.find(id => id === +co.value)
              })
            }

            return isCourse && isClass
          })

        const paymentStatusValues = selectedPaymentStatus?.map(
          item => item.value
        )
        const hasPaymentStatusMatches =
          !selectedPaymentStatus ||
          selectedPaymentStatus.length === 0 ||
          enrollCourses?.some(({ invoice, invoices }) => {
            // Support both invoice (new) and invoices (old) for backward compatibility
            const invoiceList = invoice ? [invoice] : invoices || []
            if (invoiceList.length > 0) {
              return invoiceList.some(({ paymentState }) => {
                if (!paymentState) return false
                return paymentStatusValues?.includes(paymentState)
              })
            }
            return false
          })

        // Return only students that match all conditions
        // return hasMatchingCourseId
        const isWithinDateRange = dayjs(user?.createdAt).isBetween(
          startDate,
          endDate,
          'day',
          '[]'
        )
        return (
          hasMatchingCourseId && hasPaymentStatusMatches && isWithinDateRange
        )
      })

      return filteredList
    },
    [selectedPaymentStatus]
  )

  const filteredList = useMemo(() => {
    const filtered = filterStudentData(studentList || [], {
      selectedCourse,
      selectedClass,
      selectedPaymentStatus,
      startDate,
      endDate,
    })

    // Sort by phone number to group students with the same phone together for spanRows
    return filtered.sort((a, b) => {
      const phoneA = a.phone || a.user?.phone || ''
      const phoneB = b.phone || b.user?.phone || ''
      return phoneA.localeCompare(phoneB)
    })
  }, [
    filterStudentData,
    studentList,
    selectedCourse,
    selectedPaymentStatus,
    startDate,
    endDate,
    selectedClass,
  ])

  const handlePaymentStatusChange = (
    selectedOption: MultiValue<SelectItemValuesProps> | null
  ) => {
    if (selectedOption !== null) {
      setSelectedPaymentStatus(selectedOption)
    }
  }

  const handleReset = () => {
    setSelectedCourse([])
    setSelectedClass([])
    setSelectedPaymentStatus(null)
    setChartDate(
      getInitialChartDateRange({
        daysBeforeStart: 7,
        daysBeforeEnd: 0,
      })
    )
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.delete('search')
      next.delete('startDate')
      next.delete('endDate')
      return next
    })
    setResetSearchTrigger(prev => prev + 1)

    gridRef?.current?.api.setFilterModel(null)
    setCustomFieldFilterList([])

    // if (statusRef.current) statusRef.current.clearValue()

    handleProcessData(studentList)
  }

  const findByFilterRules = () => {
    getCustomFieldFilterStudentData.mutate({
      id: currentSchoolId,
      siteId: currentSiteId,
      type: 'ALL',
      matchMode: selectedMatchMode,
      customFieldFilterList,
    })
  }

  useEffect(() => {
    if (JSON.stringify(filteredList) !== JSON.stringify(filteredStudentList)) {
      setFilteredStudentList(filteredList)
    }
  }, [chartDate, filteredList])

  const handleProcessData = (data?: StudentEnrolmentRecord[]) => {
    const processedData =
      data?.map((student: StudentEnrolmentRecord) => {
        let currentEmail = student.email
        const currentPhone = student.phone || student.user?.phone
        const currentName = student.name
        if (student.user && !currentName) {
          currentEmail = student.user.email
        }
        return {
          ...student,
          name: currentName,
          email: currentEmail,
          phone: currentPhone,
          updatedAt: new Date(student?.user?.updatedAt ?? new Date()),
          createdAt: new Date(student?.user?.createdAt ?? new Date()),
        }
      }) ?? []

    // Sort by phone number to group students with the same phone together for spanRows
    const sortedData = [...processedData].sort((a, b) => {
      const phoneA = a.phone || a.user?.phone || ''
      const phoneB = b.phone || b.user?.phone || ''
      return phoneA.localeCompare(phoneB)
    })

    setFilteredStudentList(sortedData)
  }

  useEffect(() => {
    handleProcessData(studentList)
  }, [studentList])

  const [selectedRows, setSelectedRows] = useState<
    IRowNode<StudentEnrolmentRecord>[]
  >([])

  const onSelectionChanged = () => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes()
    setSelectedRows(selectedNodes || [])
  }
  const handleClearSelection = () => {
    gridRef.current?.api.deselectAll()
    setSelectedRows([])
  }

  const FilterCustomField = () => {
    return (
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setStudentData(prev => ({
            ...prev,
            tableDrawers: {
              ...prev.tableDrawers,
              isOpenCustomFieldFilter: true,
            },
          }))
        }}
        iconBefore={<LuFilter />}
        iconAfter={
          customFieldFilterList.length > 0 && (
            <Badge>{customFieldFilterList.length}</Badge>
          )
        }
        data-testid="filter-custom-field-btn"
      >
        {t('student:customFieldFilter.filter')}
      </Button>
    )
  }

  const contentToRender = useCallback(() => {
    if (isLoading || isFetching) {
      return <SkeletonLoader height="60vh" />
    }
    return (
      <>
        <QuickFilterTable
          alwaysMultiSort
          onSelectionChanged={onSelectionChanged}
          getRowId={row => getRowId('id', row)}
          hasCheckboxSelection
          rowData={filteredStudentList}
          height={dynamicHeight}
          gridRef={gridRef}
          useUrlSearch
          columns={tableColumns}
          handleReset={handleReset}
          hasFilterSelection
          filterSelector={
            <>
              <Box direction="col">
                <Box className="box-row-full grid grid-cols-1 md:grid-cols-10 md:gap-2">
                  <div className="col-span-5">
                    <CourseAndClassSelector
                      id="filter-class-selector"
                      options={options}
                      value={[
                        ...selectedCourse.map(course => ({
                          value: parseInt(course.value.toString(), 10),
                          label: String(course.label),
                          course: String(course.label),
                          courseId: parseInt(course.value.toString(), 10),
                          previewImageUrl: null,
                        })),
                        ...selectedClass.map(cls => {
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
                          const courses = selected
                            .filter(option =>
                              option.label.includes('All Classes of')
                            )
                            .map(option => ({
                              value: option.value.toString(),
                              label: option.course,
                            }))

                          const classes = selected
                            .filter(
                              option => !option.label.includes('All Classes of')
                            )
                            .map(option => ({
                              value: option.value.toString(),
                              label: option.label,
                            }))

                          handleCourseChange(courses)
                          handleClassChange(classes)
                        } else {
                          handleCourseChange([])
                          handleClassChange([])
                        }
                      }}
                      width="100%"
                    />
                  </div>
                  <div className="col-span-2">
                    <LabelSelector
                      options={paymentStatusOptions}
                      onChange={(e: MultiValue<SelectItemValuesProps> | null) =>
                        handlePaymentStatusChange(e)
                      }
                      id="filter-payment-status-selector"
                      placeHolder={t('student:paymentProof.allStatus')}
                      selectStyles={selectorStyles()}
                      ref={statusRef}
                      isMulti
                    />
                  </div>
                  <div className="col-span-2">
                    {hasCustomDataField ? (
                      <FilterCustomField />
                    ) : (
                      <HoverCard>
                        <HoverCardTrigger className="w-full">
                          <FilterCustomField />
                        </HoverCardTrigger>
                        <HoverCardContent>
                          {t('student:notHaveCustomField')}
                        </HoverCardContent>
                      </HoverCard>
                    )}
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleReset}
                    >
                      {t('recordLogs:notificationLogs.selectLabels.reset')}
                    </Button>
                  </div>
                </Box>
              </Box>
            </>
          }
          onColumnMoved={onColumnMoved}
        />
      </>
    )
  }, [
    isLoading,
    isFetching,
    filteredStudentList,
    dynamicHeight,
    onSelectionChanged,
    getRowId,
    handleReset,
    tableColumns,
    t,
    customFieldColumns,
    onColumnMoved,
  ])

  return (
    <ContentLayout
      leftHeader={<Heading>{t('student:studentTable')}</Heading>}
      rightHeader={rightHeaderContent}
    >
      <SelectionActionBulk
        studentData={studentData}
        setStudentData={setStudentData}
        selectedRows={selectedRows}
        handleClearSelection={handleClearSelection}
      />

      <div className="box-col p-4">{contentToRender()}</div>
      {/* <CreateStudent open={open} handleClose={handleClose} /> */}

      <ImportCSVModal
        ref={importCSVModalHandle}
        institutionId={currentSchoolId}
        siteId={+currentSiteId}
        hidden
        handlePrev={handlePrev}
      />

      <CreateCouponCode
        open={isOpenCreateCoupon}
        handleClose={() => {
          setStudentData(prev => ({
            ...prev,
            tableDrawers: {
              ...studentData.tableDrawers,
              isOpenCreateCoupon: false,
            },
          }))
        }}
      />

      <CustomFormFieldFilter
        open={isOpenCustomFieldFilter}
        handleClose={() => {
          setStudentData(prev => ({
            ...prev,
            tableDrawers: {
              ...studentData.tableDrawers,
              isOpenCustomFieldFilter: false,
            },
          }))
        }}
        fieldsCustom={fieldsCustom || []}
        customFieldFilterList={customFieldFilterList}
        setCustomFieldFilterList={setCustomFieldFilterList}
        customFieldColumns={customFieldColumns}
        setCustomFieldColumns={setCustomFieldColumnsAndPersist}
        findByFilterRules={findByFilterRules}
        selectedMatchMode={selectedMatchMode}
        setSelectedMatchMode={setSelectedMatchMode}
        submitLoading={getCustomFieldFilterStudentData.isLoading}
      />

      <CreateTeachingService
        open={isOpenAssignCourse}
        handleClose={() => {
          setStudentData(prev => ({
            ...prev,
            tableDrawers: {
              ...studentData.tableDrawers,
              isOpenAssignCourse: false,
              bulkAssignCourse: [],
            },
          }))
          handleClearSelection()
        }}
      />
    </ContentLayout>
  )
}

export default StudentDatabase
