import type { NavigateFunction } from 'react-router-dom'

import { ColDef, ICellRendererParams } from 'ag-grid-community'
import { utcToZonedTime } from 'date-fns-tz'
import Cookies from 'js-cookie'
import { LuEye } from 'react-icons/lu'

import Box from '@/components/ui/Box'
import ActionButton from '@/pages/StudentCRM/components/ActionButton'
import BadgeParentStudent from '@/pages/StudentCRM/components/BadgeParentStudent'
import TeachingServiceEnrolledColumn from '@/pages/StudentCRM/components/TeachingServiceEnrolledRow'
import TeachingServiceNameColumn from '@/pages/StudentCRM/components/TeachingServiceNameColumn'
import { StudentEnrolmentRecord } from '@/types/student'
import { convertCustomFieldToValue } from '@/utils/convert'
import { generateDataTestId } from '@/utils/data-testid.utils'
import dayjs from '@/utils/dayjs'
import { formatPhoneNumber } from '@/utils/misc'
import { extractFieldId } from '@/utils/string'

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

type GetStudentTableColumnsOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, ...args: any[]) => string
  studentList?: StudentEnrolmentRecord[]
  customFieldColumns?: ColDef[]
  timeZone?: string
  selectedTab?: string
  refetchAllStudents?: () => void
  navigate?: NavigateFunction
  showActionColumn?: boolean
  showDateColumns?: boolean
  showCustomFields?: boolean
  useColumnOrder?: boolean
}

export const getStudentTableColumns = ({
  t,
  studentList = [],
  customFieldColumns = [],
  timeZone,
  selectedTab,
  refetchAllStudents,
  navigate,
  showActionColumn = true,
  showDateColumns = true,
  showCustomFields = true,
  useColumnOrder = true,
}: GetStudentTableColumnsOptions): ColDef[] => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseColumns: any[] = [
    {
      colId: '_clusterKey',
      headerName: '_clusterKey',
      hide: true,
      valueGetter: p => {
        if (p.data.isStudentParent) return p.data.id
        return p.data.childOfUserAliasId ?? Number.MAX_SAFE_INTEGER
      },
      sort: 'asc' as const,
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
      sort: 'asc' as const,
      sortIndex: 1,
    },
    ...(showActionColumn && navigate && selectedTab && refetchAllStudents
      ? [
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
                  <div
                    className="cursor-pointer"
                    data-testid="view-detail-button"
                  >
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
          } as ColDef,
        ]
      : []),
    {
      field: 'phone',
      filter: false,
      headerName: t('student:column.phone').toString(),
      width: 140,
      valueGetter: (params: any) => {
        const studentData: StudentEnrolmentRecord = params?.data
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
            <div className="text-center">{formatPhoneNumber(phoneNumber)}</div>
          </div>
        )
      },
      getQuickFilterText: (params: any) => {
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
    },
    {
      field: 'user.email',
      filter: false,
      headerName: t('student:column.email').toString(),
      width: 220,
      valueGetter: (params: ICellRendererParams) => {
        const studentData: StudentEnrolmentRecord = params?.data
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
      getQuickFilterText: (params: ICellRendererParams) => {
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
    ...(showDateColumns && timeZone
      ? [
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
          } as ColDef,
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
          } as ColDef,
        ]
      : []),
  ]

  const customFieldColumnsWithValue = showCustomFields
    ? customFieldColumns.map(col => {
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

            // Check if this is a student ID field (stored in localStorage)
            if (col.field === 'id' || col.field === 'studentId') {
              const localStorageKey = `student_id_${studentData.id}`
              const customId = localStorage.getItem(localStorageKey)
              const displayId = customId || studentData.id

              return (
                <div className="text-sm flex items-center px-2 py-4">
                  {displayId}
                </div>
              )
            }

            // Find the registrationForm for this fieldId
            const allStudentForms = studentData.studentForms

            const form = allStudentForms?.find(
              (f: { formFieldId: string | number }) =>
                extractFieldId(f.formFieldId) === fieldId?.toString()
            )

            const value = form
              ? convertCustomFieldToValue({
                  fieldValue: form.formFieldValue,
                  fieldType: form.formFieldType,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  t: t as any,
                })
              : '-'

            return (
              <div className="text-sm flex items-center px-2 py-4">{value}</div>
            )
          },
          getQuickFilterText: (params: ICellRendererParams) => {
            const data = params.data as StudentEnrolmentRecord

            // Check if this is a student ID field (stored in localStorage)
            if (col.field === 'id' || col.field === 'studentId') {
              const localStorageKey = `student_id_${data.id}`
              const customId = localStorage.getItem(localStorageKey)
              return customId || String(data.id)
            }

            const { isMerged, mergedStudents } =
              data as StudentEnrolmentRecord & {
                isMerged?: boolean
                mergedStudents?: StudentEnrolmentRecord[]
              }

            if (isMerged && mergedStudents) {
              // For merged rows, get all custom field values
              return mergedStudents
                .map((student: StudentEnrolmentRecord) => {
                  const form = student.studentForms?.find(
                    (f: { formFieldId: string | number }) =>
                      extractFieldId(f.formFieldId) === fieldId?.toString()
                  )
                  return form?.formFieldValue?.toString() ?? ''
                })
                .join(' ')
            }

            const form = data.studentForms?.find(
              (f: { formFieldId: string | number }) =>
                extractFieldId(f.formFieldId) === fieldId?.toString()
            )
            return form?.formFieldValue?.toString() ?? ''
          },
        }
      })
    : []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allColumns: any[] = [...baseColumns, ...customFieldColumnsWithValue]

  if (useColumnOrder) {
    const columnOrderCookie = Cookies.get(COLUMN_ORDER_COOKIE_KEY)
    if (columnOrderCookie) {
      try {
        const order: string[] = JSON.parse(columnOrderCookie)
        return rearrangeColumnsByOrder(allColumns, order)
      } catch {
        return allColumns
      }
    }
  }
  return allColumns as ColDef[]
}
