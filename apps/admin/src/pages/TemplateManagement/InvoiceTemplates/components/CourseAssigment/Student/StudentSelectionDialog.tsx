import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { ColDef, IRowNode } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import Cookies from 'js-cookie'
import { useTranslation } from 'react-i18next'
import { MultiValue, StylesConfig } from 'react-select'
import { useSetRecoilState } from 'recoil'

import CourseAndClassSelector from '@/components/Selector/CourseAndClassSelector'
import LabelSelector, {
  LabelSelectorRef,
} from '@/components/Selector/LabelSelector'
import { SelectItemValuesProps } from '@/components/Selector/Select'
import QuickFilterTable from '@/components/Tables/QuickFilterTable'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { defaultStudentInvoiceConfig } from '@/constants/invoiceCampaign.constant'
import { PaymentState } from '@/constants/payment'
import useCourseData from '@/hooks/useCourseData'
import useDynamicHeight from '@/hooks/useDynamicHeight'
import useEnrollmentFormData from '@/hooks/useEnrollmentFormData'
import useSiteData from '@/hooks/useSiteData'
import { getStudentTableColumns } from '@/pages/StudentCRM/utils/getStudentTableColumns'
import { currentActiveStudentState } from '@/stores/studentInvoice.store'
import { StudentEnrolmentRecord } from '@/types/student'
import { InvoiceStudent } from '@/types/studentInvoice.type'
import { getRowId } from '@/utils/misc'

const CUSTOM_COLUMN_COOKIE_KEY = 'student-crm-custom-columns'

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

interface Props {
  open: boolean
  studentList: StudentEnrolmentRecord[]
  onSelect: (selected: InvoiceStudent[]) => void
  onClose: () => void
}
const StudentSelectionDialog: React.FC<Props> = ({
  open,
  studentList,
  onSelect,
  onClose,
}): JSX.Element => {
  const { t } = useTranslation()
  const setCurrentActiveStudent = useSetRecoilState(currentActiveStudentState)
  const gridRef = useRef<AgGridReact<StudentEnrolmentRecord>>(null)
  const statusRef = useRef<LabelSelectorRef>(null)
  const classRef = useRef<LabelSelectorRef>(null)
  const dynamicHeight = useDynamicHeight()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedRows, setSelectedRows] = useState<
    IRowNode<StudentEnrolmentRecord>[]
  >([])
  const { courseData, getFilteredCourseOptions } = useCourseData()
  const { timeZone } = useSiteData()
  const { useFetchListEnrollmentFormFields } = useEnrollmentFormData()
  const { data: fieldsCustom } = useFetchListEnrollmentFormFields()

  const [customFieldColumns, setCustomFieldColumns] = useState<ColDef[]>([])

  const options = getFilteredCourseOptions()

  // Restore custom field columns from cookies (same logic as StudentCRM)
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

  // On fieldsCustom load, initialize customFieldColumns from cookie
  useEffect(() => {
    restoreCustomFieldColumnsAndOrder(fieldsCustom || [], setCustomFieldColumns)
  }, [fieldsCustom])

  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<MultiValue<SelectItemValuesProps> | null>(null)
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
  const [selectedCourse, setSelectedCourse] = useState<
    MultiValue<SelectItemValuesProps>
  >([])

  const [selectedClass, setSelectedClass] = useState<
    MultiValue<SelectItemValuesProps>
  >([])

  const tableColumns: ColDef[] = useMemo(
    () =>
      getStudentTableColumns({
        t,
        studentList,
        customFieldColumns,
        timeZone,
        showActionColumn: false,
        showDateColumns: false,
        showCustomFields: true,
        useColumnOrder: true,
      }),
    [t, studentList, timeZone, customFieldColumns]
  )

  const filteredList = useMemo(() => {
    return (
      studentList
        // .filter(item => !item.isStudentParent)
        .map((student: StudentEnrolmentRecord) => {
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
        .filter(({ enrollCourses }) => {
          const hasMatchingCourseId =
            (selectedCourse.length === 0 && selectedClass.length === 0) ||
            enrollCourses?.some(({ course, studentSchedule }) => {
              let isCourse = true
              if (selectedCourse.length) {
                isCourse = selectedCourse.some(co => {
                  return +co.value === course?.id
                })
              }

              let isClass = true

              const classes = studentSchedule?.map(s => s.class?.id)

              if (selectedClass.length) {
                isClass = selectedClass.some(co => {
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

          return hasPaymentStatusMatches && hasMatchingCourseId
        })
        .sort((a, b) => {
          const phoneA = a.phone || a.user?.phone || ''
          const phoneB = b.phone || b.user?.phone || ''
          return phoneA.localeCompare(phoneB)
        })
    )
  }, [selectedClass, selectedCourse, selectedPaymentStatus, studentList])

  const handleReset = () => {
    setSelectedCourse([])
    setSelectedClass([])
    setSelectedPaymentStatus(null)

    setSearchParams(
      new URLSearchParams({
        ...Object.fromEntries(searchParams),
        search: '',
      }).toString()
    )

    gridRef?.current?.api.setFilterModel(null)
    if (statusRef.current) statusRef.current.clearValue()
  }

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

  const handleSelectionChange = () => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes()
    setSelectedRows(selectedNodes || [])
  }

  const handlePaymentStatusChange = (
    selectedOption: MultiValue<SelectItemValuesProps> | null
  ) => {
    if (selectedOption !== null) {
      setSelectedPaymentStatus(selectedOption)
    }
  }

  const onCloseModal = () => {
    onClose()
    setSelectedRows([])
  }

  const onSaveSelection = () => {
    const data: InvoiceStudent[] = (selectedRows || [])
      .map(item => {
        if (item.data) {
          const {
            id,
            userId,
            name,
            email,
            user,
            isStudentParent,
            childOfUserAliasId,
          } = item.data

          let isSendToParent = false
          if (childOfUserAliasId) {
            isSendToParent = true
          }
          return {
            id,
            userId,
            name,
            email,
            phone: user?.phone ?? '',
            childOfUserAliasId: childOfUserAliasId ?? null,
            isStudentParent: isStudentParent ?? false,
            isSendToParent,
            isPayByCredit: true,
            usedBalance: 0,
            ...defaultStudentInvoiceConfig,
          }
        }
        return undefined
      })
      .filter(Boolean) as unknown as InvoiceStudent[]
    onSelect(data)
    const firstStudent = data.at(0)
    if (firstStudent) {
      setCurrentActiveStudent(firstStudent)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="w-full h-[90dvh] flex flex-col">
        <DialogHeader className="flex flex-col items-start justify-center p-4">
          <DialogTitle>
            {t('invoiceCampaign:editor.studentSelect.studentCentral')}
          </DialogTitle>
          <div className="absolute right-10 flex gap-2">
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => {
                // Select all filtered rows (not just visible ones)
                gridRef.current?.api.selectAll()
                handleSelectionChange()
              }}
            >
              {t('invoiceCampaign:editor.studentSelect.selectAllVisible')}
            </Button>
            {selectedRows.length > 0 && (
              <Button className="rounded-lg" onClick={() => onSaveSelection()}>
                {t('invoiceCampaign:editor.studentSelect.replaceAllStudent', {
                  count: selectedRows.length,
                })}
              </Button>
            )}
          </div>
        </DialogHeader>
        <DialogBody className="p-4">
          <QuickFilterTable
            onSelectionChanged={() => handleSelectionChange()}
            getRowId={row => getRowId('id', row)}
            hasCheckboxSelection
            rowData={filteredList}
            height={dynamicHeight}
            gridRef={gridRef}
            useUrlSearch
            columns={tableColumns}
            handleReset={handleReset}
            hasFilterSelection
            filterSelector={({ handleReset: reset }) => (
              <>
                <Box direction="col">
                  <Box className="box-row-full grid grid-cols-1 md:grid-cols-10 md:gap-2">
                    <div className="col-span-5">
                      <CourseAndClassSelector
                        width="100%"
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
                                option =>
                                  !option.label.includes('All Classes of')
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
                      />
                    </div>
                    <div className="col-span-4 w-full">
                      <LabelSelector
                        options={paymentStatusOptions}
                        onChange={(
                          e: MultiValue<SelectItemValuesProps> | null
                        ) => handlePaymentStatusChange(e)}
                        id="filter-payment-status-selector"
                        placeHolder={t('student:paymentProof.allStatus')}
                        selectStyles={selectorStyles()}
                        ref={statusRef}
                        isMulti
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={reset}
                      >
                        {t('recordLogs:notificationLogs.selectLabels.reset')}
                      </Button>
                    </div>
                  </Box>
                </Box>
              </>
            )}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

export default StudentSelectionDialog
