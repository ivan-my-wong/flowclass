import { useMemo, useRef, useState } from 'react'

import {
  CellClassParams,
  GridOptions,
  ICellRendererParams,
  IRowNode,
} from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { MultiValue, StylesConfig } from 'react-select'
import { useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import LabelSelector, {
  LabelSelectorRef,
} from '@/components/Selector/LabelSelector'
import { SelectItemValuesProps } from '@/components/Selector/Select'
import QuickFilterTable from '@/components/Tables/QuickFilterTable'
import Heading from '@/components/Texts/Heading'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { PaymentState } from '@/constants/payment'
import useCourseData from '@/hooks/useCourseData'
import useDynamicHeight from '@/hooks/useDynamicHeight'
import useGlobalConfirm from '@/hooks/useGlobalConfirm'
import {
  useChangeRescheduleApprovalStatus,
  useGetRescheduleApproval,
} from '@/hooks/useRescheduleApproval'
import ContentLayout from '@/layouts/ContentLayout'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { schoolState } from '@/stores/schoolData'
import {
  RequestTimeChange,
  RequestTimeChangeStatus,
} from '@/types/rescheduleApproval'
import { courseListToCourseOptions } from '@/utils/options'

import RecheckConflict from './components/RecheckConflict'
import RescheduleSettings from './components/RescheduleSettings'
import SelectionActionBulk from './components/SelectionActionBulk'

const RescheduleApprovalPage = () => {
  const { t } = useTranslation()
  const dynamicHeight = useDynamicHeight()

  const { currentSchool } = useRecoilValue(schoolState)
  const currentInstitutionId = currentSchool?.id || 0
  const { courseData } = useCourseData()

  const inputRef = useRef<HTMLInputElement>(null)
  const statusRef = useRef<LabelSelectorRef>(null)
  const courseRef = useRef<LabelSelectorRef>(null)
  const classRef = useRef<LabelSelectorRef>(null)
  const gridRef = useRef<AgGridReact<RequestTimeChange>>(null)

  const [selectedRows, setSelectedRows] = useState<
    IRowNode<RequestTimeChange>[]
  >([])
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<MultiValue<SelectItemValuesProps> | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<
    MultiValue<SelectItemValuesProps>
  >([])
  const [selectedClass, setSelectedClass] = useState<
    MultiValue<SelectItemValuesProps>
  >([])

  const onSelectionChanged = () => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes()
    setSelectedRows(selectedNodes || [])
  }

  const getRowId = (params: IRowNode<RequestTimeChange>) => {
    if (!params.data?.id) return crypto.randomUUID()
    return params.data?.id.toString()
  }

  const {
    data: rescheduleApprovalList = [],
    isLoading,
    refetch,
  } = useGetRescheduleApproval({
    institutionId: currentInstitutionId,
  })

  const filteredList = useMemo(() => {
    return rescheduleApprovalList.filter(({ studentLesson }) => {
      const { course, class: classes, studentSchedule } = studentLesson ?? {}
      const { invoice } = studentSchedule ?? {}

      let isCourse = true
      if (selectedCourse.length) {
        isCourse = selectedCourse.some(co => {
          return +co.value === course?.id
        })
      }

      let isClass = true
      if (selectedClass.length) {
        isClass = selectedClass.some(co => {
          return +co.value === classes?.id
        })
      }

      let isPaymentStatus = true
      if (selectedPaymentStatus?.length) {
        isPaymentStatus = selectedPaymentStatus.some(co => {
          return co.value === invoice?.paymentState
        })
      }

      return isCourse && isClass && isPaymentStatus
    })
  }, [
    rescheduleApprovalList,
    selectedCourse,
    selectedPaymentStatus,
    selectedClass,
  ])

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

  const handlePaymentStatusChange = (
    selectedOption: MultiValue<SelectItemValuesProps> | null
  ) => {
    if (selectedOption !== null) {
      setSelectedPaymentStatus(selectedOption)
    }
  }

  const courseOptions = useMemo(() => {
    return courseListToCourseOptions(courseData.courses ?? [], true)
  }, [courseData.courses])

  const classOptions = useMemo(() => {
    const options: SelectItemValuesProps[] = []
    courseData?.courses
      .filter(o => {
        if (selectedCourse.length) {
          return selectedCourse.map(p => +p.value).includes(o.id)
        }
        return o
      })
      .forEach(co => {
        if (co.classes?.length) {
          co.classes.forEach(cl => {
            options.push({ label: cl.name, value: cl.id })
          })
        }
      })

    return options
  }, [courseData.courses, selectedCourse])

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
      value: PaymentState.CRITICAL,
      label: t('teachingService:paymentStatus.critical'),
    },
  ]

  const handleReset = () => {
    gridRef?.current?.api.setFilterModel(null)
    if (inputRef.current) inputRef.current.value = ''
    if (courseRef.current) courseRef.current.clearValue()
    if (statusRef.current) statusRef.current.clearValue()
    if (classRef.current) classRef.current.clearValue()
    // refreshData()
    refetch()
  }

  const handleClearSelection = () => {
    gridRef.current?.api.deselectAll()
    setSelectedRows([])
  }

  const { mutateAsync: handleChangeStatus, isLoading: loadChangeStatus } =
    useChangeRescheduleApprovalStatus()

  const { confirmState, openConfirm, closeConfirm } = useGlobalConfirm(
    isLoading || loadChangeStatus
  )

  const submitChangeStatus = (status: RequestTimeChangeStatus, id?: number) => {
    let title = t('student:rescheduleApproval:rejectRequest')
    let description = t('student:rescheduleApproval:rejectRequestDesc')
    if (status === RequestTimeChangeStatus.APPROVED) {
      title = t('student:rescheduleApproval:approveRequest')
      description = t('student:rescheduleApproval:approveRequestDesc')
    } else if (status === RequestTimeChangeStatus.PENDING) {
      title = t('student:rescheduleApproval:resetRequest')
      description = t('student:rescheduleApproval:resetRequestDesc')
    }

    confirmState.content = {
      title: title || '',
      description: description || '',
      confirmText: t('common:action:confirm') || '',
      onConfirm: () => {
        confirmState.content.loading = true
        handleChangeStatus({
          institutionId: currentInstitutionId,
          status,
          ids: id ? [+id] : selectedRows.map(row => +(row?.data?.id ?? 0)),
        }).then(() => {
          refetch()
          closeConfirm()
          toast.success(t('student:rescheduleApproval:changeStatusSuccess'))
        })
      },
      cancelText: t('common:action.cancel') || '',
      alertType: AlertTypes.WARN,
    }
    openConfirm()
  }

  const rescheduleTable: GridOptions<
    RequestTimeChange & { checkbox: boolean }
  >['columnDefs'] = [
    {
      field: 'id',
      headerName: t('student:column.status') as string,
      filter: false,
      width: 200,
      cellRenderer: ({ data }: ICellRendererParams<RequestTimeChange>) => {
        if (!data) return null
        if (data?.status === RequestTimeChangeStatus.REJECTED) {
          return (
            <Box className="flex mt-1 gap-1" align="center">
              <div className="text-warn bg-red-100 px-2 rounded-md font-bold w-[90px] text-center">
                {t('student:paymentProof.rejected')}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-[90px] text-center"
                onClick={() =>
                  submitChangeStatus(RequestTimeChangeStatus.PENDING, data.id)
                }
              >
                {t('student:button.reset')}
              </Button>
            </Box>
          )
        }
        if (data?.status === RequestTimeChangeStatus.APPROVED) {
          return (
            <Box className="flex mt-1 gap-1" align="center">
              <div className="text-primary bg-blue-100 px-2 rounded-md font-bold w-[90px] text-center">
                {t('student:paymentProof.approved')}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  submitChangeStatus(RequestTimeChangeStatus.PENDING, data.id)
                }
                className="w-[90px] text-center"
              >
                {t('student:button.reset')}
              </Button>
            </Box>
          )
        }
        return (
          <Box className="flex mt-1 gap-1" align="center">
            <Button
              onClick={() =>
                submitChangeStatus(RequestTimeChangeStatus.APPROVED, data.id)
              }
              className="w-[90px] text-center"
              size="sm"
            >
              {t('student:button.approve')}
            </Button>
            <Button
              variant="primary-outline"
              className="w-[90px] text-center"
              size="sm"
              onClick={() =>
                submitChangeStatus(RequestTimeChangeStatus.REJECTED, data.id)
              }
            >
              {t('student:button.reject')}
            </Button>
          </Box>
        )
      },
      cellClass: ({
        data,
      }: CellClassParams<RequestTimeChange & { checkbox: boolean }>) => {
        if (data?.status !== RequestTimeChangeStatus.PENDING) {
          return 'bg-gray-100'
        }
        return ''
      },
    },
    {
      headerName: t('student:rescheduleApproval.availabilityStatus') as string,
      filter: false,
      width: 170,
      cellRenderer: ({ data }: ICellRendererParams<RequestTimeChange>) => {
        if (!data) return null
        return <RecheckConflict data={data} />
      },
      cellClass: ({
        data,
      }: CellClassParams<RequestTimeChange & { checkbox: boolean }>) => {
        if (data?.status !== RequestTimeChangeStatus.PENDING) {
          return 'bg-gray-100'
        }
        return ''
      },
    },
    {
      headerName: t('student:userName') as string,
      field: 'user.firstName',
      filter: false,
      width: 200,
      cellClass: ({
        data,
      }: CellClassParams<RequestTimeChange & { checkbox: boolean }>) => {
        if (data?.status !== RequestTimeChangeStatus.PENDING) {
          return 'bg-gray-100'
        }
        return ''
      },
    },
    {
      headerName: t('student:importCsv.fields.CourseName') as string,
      field: 'studentLesson.course.name',
      filter: false,
      width: 200,
      cellClass: ({
        data,
      }: CellClassParams<RequestTimeChange & { checkbox: boolean }>) => {
        if (data?.status !== RequestTimeChangeStatus.PENDING) {
          return 'bg-gray-100'
        }
        return ''
      },
    },
    {
      headerName: t('student:rescheduleApproval.numberOfHours') as string,
      field: 'studentLesson.startTime',
      filter: false,
      width: 200,
      cellRenderer: ({ data }: ICellRendererParams<RequestTimeChange>) => {
        const startTime = data?.studentLesson?.startTime
        if (!startTime) return 0

        const diffHours = dayjs(startTime).diff(dayjs(), 'minutes')
        return (diffHours / 60).toFixed(1)
      },
    },
    {
      headerName: t(`student:rescheduleApproval.currentClassTime`) as string,
      field: 'studentLesson.startTime',
      filter: false,
      autoHeight: true,
      cellRenderer: ({ data }: ICellRendererParams<RequestTimeChange>) => {
        if (!data?.studentLesson?.startTime) return ''
        const startTime = dayjs(data?.studentLesson?.startTime).format(
          'DD MMM YYYY HH:mm'
        )
        const endTime = dayjs(data?.studentLesson?.endTime).format(
          'DD MMM YYYY HH:mm'
        )
        return (
          <div className="leading-5 text-xs">
            <div>{startTime} -</div>
            <div>{endTime}</div>
          </div>
        )
      },
      cellClass: ({
        data,
      }: CellClassParams<RequestTimeChange & { checkbox: boolean }>) => {
        if (data?.status !== RequestTimeChangeStatus.PENDING) {
          return 'bg-gray-100'
        }
        return ''
      },
    },
    {
      headerName: t(`student:rescheduleApproval.requestedNewTime`) as string,
      field: 'requestStartTime',
      filter: false,
      autoHeight: true,
      cellRenderer: ({ data }: ICellRendererParams<RequestTimeChange>) => {
        const startTime = dayjs(data?.requestStartTime).format(
          'DD MMM YYYY HH:mm'
        )
        const endTime = dayjs(data?.requestEndTime).format('DD MMM YYYY HH:mm')
        return (
          <div className="leading-5 text-xs">
            <div>{startTime} -</div>
            <div>{endTime}</div>
          </div>
        )
      },
      cellClass: ({
        data,
      }: CellClassParams<RequestTimeChange & { checkbox: boolean }>) => {
        if (data?.status !== RequestTimeChangeStatus.PENDING) {
          return 'bg-gray-100'
        }
        return ''
      },
    },
    {
      headerName: t(`student:rescheduleApproval.reason`) as string,
      field: 'reason',
      filter: false,
      width: 300,
      cellClass: ({
        data,
      }: CellClassParams<RequestTimeChange & { checkbox: boolean }>) => {
        if (data?.status !== RequestTimeChangeStatus.PENDING) {
          return 'bg-gray-100'
        }
        return ''
      },
    },
    { headerName: 'ID', field: 'id', filter: false, hide: true },
  ]

  return (
    <ContentLayout
      leftHeader={<Heading>{t('student:rescheduleApproval.title')}</Heading>}
      rightHeader={<RescheduleSettings />}
    >
      <div className="p-4 box-col-full">
        <SelectionActionBulk
          selectedRows={selectedRows}
          handleClearSelection={handleClearSelection}
          submitChangeStatus={submitChangeStatus}
          isLoading={loadChangeStatus}
        />

        <div className="box-col-full">
          {isLoading ? (
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
              onSelectionChanged={onSelectionChanged}
              getRowId={getRowId}
              hasCheckboxSelection
              rowData={filteredList}
              useUrlSearch
              columns={rescheduleTable}
              gridRef={gridRef}
              inputRef={inputRef}
              height={dynamicHeight}
              handleReset={handleReset}
              hasFilterSelection
              filterSelector={({ handleReset: reset }) => (
                <Box direction="col">
                  <Box className="box-row-full">
                    <LabelSelector
                      options={courseOptions ?? []}
                      onChange={(e: MultiValue<SelectItemValuesProps>) =>
                        handleCourseChange(e)
                      }
                      placeHolder={t('student:paymentProof.allItem')}
                      selectStyles={selectorStyles()}
                      ref={courseRef}
                      id="filter-course-selector"
                      isMulti
                    />
                    <LabelSelector
                      options={classOptions ?? []}
                      onChange={(e: MultiValue<SelectItemValuesProps>) =>
                        handleClassChange(e)
                      }
                      placeHolder={t('student:paymentProof.allClasses')}
                      selectStyles={selectorStyles()}
                      id="filter-class-selector"
                      ref={classRef}
                      isMulti
                    />
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
                    <Button variant="outline" onClick={reset}>
                      {t('recordLogs:notificationLogs.selectLabels.reset')}
                    </Button>
                  </Box>
                </Box>
              )}
            />
          )}
        </div>
      </div>
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

export default RescheduleApprovalPage
