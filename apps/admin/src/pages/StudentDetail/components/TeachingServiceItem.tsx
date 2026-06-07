import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { t } from 'i18next'
import { LuCopy, LuExternalLink, LuPencil, LuTrash } from 'react-icons/lu'
import { useQueryClient } from 'react-query'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import IconButton from '@/components/Buttons/IconButton'
import DropdownMenu, {
  DropDownMenuItemType,
} from '@/components/DropDownMenus/DropDownMenu'
import StatusChangeTrigger from '@/components/DropDownMenus/StatusChangeTrigger'
import ImageAspect from '@/components/Images/ImageAspect'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import Text from '@/components/Texts/Text'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { AttendanceStatus } from '@/constants/course'
import { PaymentState } from '@/constants/payment'
import { QUERY_KEY } from '@/constants/queryKey'
import useEnrollCourseData from '@/hooks/useEnrollCourseData'
import useLessonDateTimeData from '@/hooks/useLessonDateTimeData'
import usePaymentEvidenceData from '@/hooks/usePaymentEvidenceData'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import useTeachingServiceData from '@/hooks/useTeachingServiceData'
import ApplicationFormFieldItem from '@/pages/PaymentProofTable/PaymentProofTableCells/ApplicationFormFieldItem'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { AddTeachingServiceMode, studentState } from '@/stores/studentData'
import { ClassTypeEnum } from '@/types/course'
import { EnrollConfirmState, StudentFormResponse } from '@/types/enrollCourse'
import {
  TypeTeachingServiceEnrollCourse,
  TypeTeachingServiceInvoiceGroup,
} from '@/types/student'
import { StudentDeleteTeachingServiceRequestDto } from '@/types/studentAddTeachingService'
import { StudentUser } from '@/types/user'
import { formatCurrency } from '@/utils/currency'
import dayjs from '@/utils/dayjs'
import { generatePaymentLink } from '@/utils/generate-link.utils'
import { getLessonDateTime } from '@/utils/timeFormat'

// import LessonChange from './LessonChange'

export const GetAttendanceStatusComponent = (
  status?: AttendanceStatus
): React.ReactElement => {
  switch (status) {
    case AttendanceStatus.ATTENDED:
      return (
        <Badge variant="success">
          {t('student:attendanceStatus.attended')}
        </Badge>
      )
    case AttendanceStatus.PENDING:
      return (
        <Badge variant="light">{t('student:attendanceStatus.pending')}</Badge>
      )
    case AttendanceStatus.POSTPONE:
      return (
        <Badge variant="warning">
          {t('student:attendanceStatus.postpone')}
        </Badge>
      )
    case AttendanceStatus.NOT_ATTENDED:
      return (
        <Badge variant="error">{t('student:attendanceStatus.absent')}</Badge>
      )
    case AttendanceStatus.CANCELLED:
      return (
        <Badge variant="dark">{t('student:attendanceStatus.cancelled')}</Badge>
      )
    default:
      return <></>
  }
}

type Props = {
  invoiceGroup: TypeTeachingServiceInvoiceGroup
  student: StudentUser
  institutionId: number
  siteId: number
  studentEnrollmentForm: StudentFormResponse[]
}

const TeachingServiceItem = ({
  invoiceGroup,
  student,
  institutionId,
  siteId,
  studentEnrollmentForm,
}: Props): React.ReactElement => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const wasDrawerOpen = useRef(false)

  // const [open, setOpen] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [serviceToBeDeleted, setServiceToBeDeleted] =
    useState<TypeTeachingServiceEnrollCourse | null>(null)
  const [studentLessonToBeDeleted, setStudentLessonToBeDeleted] = useState<
    number | null
  >(null)
  const { useDeleteStudentLesson } = useLessonDateTimeData()
  // const refLessonSelected = useRef<StudentLesson>()
  const [enrollStatuses, setEnrollStatuses] = useState<
    Map<number, EnrollConfirmState>
  >(new Map())

  const [studentData, setStudentData] = useRecoilState(studentState)

  useEffect(() => {
    const isOpen = !!studentData.tableDrawers?.isOpenAssignCourse
    if (wasDrawerOpen.current && !isOpen) {
      queryClient.invalidateQueries(QUERY_KEY.student.getStudentDetailKey)
      queryClient.invalidateQueries(
        QUERY_KEY.teachingService.getTeachingServiceKey
      )
    }
    wasDrawerOpen.current = isOpen
  }, [studentData.tableDrawers?.isOpenAssignCourse, queryClient])

  const { timeZone, getCurrentSiteTimeZoneDate, siteData } = useSiteData()
  const { schoolData } = useSchoolData()
  const { currentSchool } = schoolData
  const { currentSite } = siteData
  dayjs.tz.setDefault(timeZone)

  const { useFetchStudentSingleInvoice } = usePaymentEvidenceData()
  const { data: detailInvoice } = useFetchStudentSingleInvoice(
    invoiceGroup.invoiceId
  )

  const firstEnrollCourse = detailInvoice?.enrollCourses?.[0]
  const coursePath = firstEnrollCourse?.course?.path

  const paymentLink = useMemo(() => {
    if (!detailInvoice) return ''
    return generatePaymentLink(
      detailInvoice,
      coursePath ?? '',
      currentSchool ?? null,
      currentSite ?? null
    )
  }, [detailInvoice, coursePath, currentSchool, currentSite])

  const { useDeleteTeachingService } = useTeachingServiceData()
  const { useUpdateEnrollCourse, useUpdatePaymentInvoiceState } =
    useEnrollCourseData()

  const mutationDelete = useDeleteTeachingService()

  const mutationDeleteStudentLesson = useDeleteStudentLesson(async () => {
    await queryClient.invalidateQueries(
      QUERY_KEY.teachingService.getTeachingServiceKey
    ) // call API get list
  })

  const mutationChangeSttPaymentAndEnroll = useUpdateEnrollCourse(data => {
    if (data?.id) {
      setEnrollStatuses(prev => new Map(prev.set(data.id, data.confirmState)))
    }
  })

  const updateInvoicePaymentStateMutation = useUpdatePaymentInvoiceState()

  const renderMenuItem = (
    title: string,
    funcHandleEven: () => void
  ): DropDownMenuItemType => {
    return {
      type: 'item',
      disabled: false,
      content: <Text>{title}</Text>,
      onClick: () => funcHandleEven(),
    }
  }

  const handleUpdateEnrollCourse = (
    payment: string,
    confirm: string,
    enrollCourseId: number
  ) => {
    const params = {
      institutionId,
      siteId,
      enrollCourseId: Number(enrollCourseId),
      confirmState: confirm,
      paymentState: payment,
    }
    mutationChangeSttPaymentAndEnroll.mutate(params)
  }

  const handleEnrollStatus = (
    enrollCourseId: number,
    val: EnrollConfirmState
  ) => {
    if (
      val === EnrollConfirmState.PENDING ||
      val === EnrollConfirmState.ACCEPTED
    ) {
      const currentStatus =
        enrollStatuses.get(enrollCourseId) || EnrollConfirmState.PENDING
      handleUpdateEnrollCourse(currentStatus, val, enrollCourseId)
    }
  }

  const handlePaymentStatus = (invoiceId: number, val: PaymentState) => {
    const params = {
      institutionId,
      siteId,
      invoiceId,
      paymentState: val,
    }
    updateInvoicePaymentStateMutation.mutate(params)
  }

  const handleDeleteTeachingService = (
    service: TypeTeachingServiceEnrollCourse
  ) => {
    const params: StudentDeleteTeachingServiceRequestDto = {
      enrollCourseId: Number(service.enrollCourseId),
      classId: Number(service.classId),
      institutionId,
      siteId,
    }
    mutationDelete.mutate(params)

    setShowConfirmDelete(false)
  }

  const pauseStatusMapping = {
    active: {
      text: t('student:teachingService.statusActive'),
      color: 'text-success border-success',
    },
    paused: {
      text: t('student:teachingService.statusPaused'),
      color: 'text-warn border-warn',
    },
  }

  const getMenuPauseStatus = (
    enrollCourseId: number
  ): DropDownMenuItemType[] => [
    {
      ...renderMenuItem(pauseStatusMapping.active.text, () => {
        mutationChangeSttPaymentAndEnroll.mutate({
          institutionId,
          siteId,
          enrollCourseId,
          confirmState:
            enrollStatuses.get(enrollCourseId) || EnrollConfirmState.PENDING,
          isPaused: false,
        })
      }),
    },
    {
      ...renderMenuItem(pauseStatusMapping.paused.text, () => {
        mutationChangeSttPaymentAndEnroll.mutate({
          institutionId,
          siteId,
          enrollCourseId,
          confirmState:
            enrollStatuses.get(enrollCourseId) || EnrollConfirmState.PENDING,
          isPaused: true,
        })
      }),
    },
  ]

  const paymentStatusMapping = {
    [PaymentState.PAID]: {
      text: t('student:statusPaid'),
      color: 'text-success border-success',
    },
    [PaymentState.PARTIALLY_PAID]: {
      text: t('student:statusPartiallyPaid'),
      color: 'text-orange-500 border-orange-500',
    },
    [PaymentState.PENDING]: {
      text: t('student:statusUnPaid'),
      color: 'text-primary border-primary',
    },
    [PaymentState.REFUNDED]: {
      text: t('student:statusRefunded'),
      color: 'text-textDisabled border-textDisabled',
    },
    [PaymentState.CRITICAL]: {
      text: t('student:statusCritical'),
      color: 'text-warn border-warn',
    },
  }

  const enrollStatusMapping = {
    [EnrollConfirmState.ACCEPTED]: {
      text: t('student:statusEnrolled'),
      color: 'text-success border-success',
    },
    [EnrollConfirmState.PENDING]: {
      text: t('student:statusStopped'),
      color: 'text-textDisabled border-textDisabled',
    },
  }

  const getMenuEnrollStatus = (
    enrollCourseId: number
  ): DropDownMenuItemType[] => [
    {
      ...renderMenuItem(
        enrollStatusMapping[EnrollConfirmState.ACCEPTED].text,
        () => {
          handleEnrollStatus(enrollCourseId, EnrollConfirmState.ACCEPTED)
        }
      ),
    },
    {
      ...renderMenuItem(
        enrollStatusMapping[EnrollConfirmState.PENDING].text,
        () => {
          handleEnrollStatus(enrollCourseId, EnrollConfirmState.PENDING)
        }
      ),
    },
  ]

  const menuPaymentStatus = (invoice: {
    invoiceId: number
    paymentState: PaymentState
  }): DropDownMenuItemType[] => {
    return [
      {
        ...renderMenuItem(paymentStatusMapping[PaymentState.PAID].text, () => {
          handlePaymentStatus(invoice.invoiceId, PaymentState.PAID)
        }),
      },
      {
        ...renderMenuItem(
          paymentStatusMapping[PaymentState.PARTIALLY_PAID].text,
          () => {
            handlePaymentStatus(invoice.invoiceId, PaymentState.PARTIALLY_PAID)
          }
        ),
      },
      {
        ...renderMenuItem(
          paymentStatusMapping[PaymentState.PENDING].text,
          () => {
            handlePaymentStatus(invoice.invoiceId, PaymentState.PENDING)
          }
        ),
      },
      {
        ...renderMenuItem(
          paymentStatusMapping[PaymentState.CRITICAL].text,
          () => {
            handlePaymentStatus(invoice.invoiceId, PaymentState.CRITICAL)
          }
        ),
      },
    ]
  }

  const ViewRegistrationData = () => {
    const [isOpen, setIsOpen] = useState(false)
    if (!studentEnrollmentForm) return <></>
    return (
      <div>
        {studentEnrollmentForm.length > 0 ? (
          <>
            <div className="py-1">
              <Button variant="primary-outline" onClick={() => setIsOpen(true)}>
                <Text
                  css={{
                    display: 'block',
                  }}
                >
                  {t(`student:teachingService.viewRegistrationData`)}
                </Text>
              </Button>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogContent className="w-full p-8">
                <DialogTitle>
                  {t(`student:teachingService.viewRegistrationData`)}
                </DialogTitle>
                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    className="absolute top-4 right-4"
                    aria-label="Close"
                  >
                    ×
                  </Button>
                </DialogClose>
                <div>
                  {studentEnrollmentForm.map(field => (
                    <ApplicationFormFieldItem
                      key={field.id}
                      label={field.question}
                      value={field.value}
                    />
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <></>
        )}
      </div>
    )
  }

  const getSortedServiceLessons = (
    service: TypeTeachingServiceEnrollCourse
  ) => {
    if (!service?.lessons) return []
    return [...service.lessons].sort((a, b) => {
      return dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf()
    })
  }

  return (
    <div
      key={invoiceGroup.invoiceId}
      className="box-col-full py-4 border border-background-layer-4 rounded-xl px-4"
      data-testid={`invoice-item-${invoiceGroup.invoiceId}`}
    >
      {/* Invoice Header */}
      <div className="box-responsive-full justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <Button
              variant="link"
              className="pl-0"
              iconAfter={<LuExternalLink />}
              onClick={() => {
                const params = new URLSearchParams({
                  id: invoiceGroup.invoiceId.toString(),
                  institutionId: institutionId.toString(),
                })

                if (student.studentInfo?.userAlias?.id) {
                  params.set(
                    'userAlias',
                    student.studentInfo.userAlias.id.toString()
                  )
                }

                navigate(`/application/edit?${params.toString()}`)
              }}
            >
              {t('student:teachingService.invoiceId')} #{invoiceGroup.invoiceId}{' '}
              {`(${
                detailInvoice?.payAmount !== undefined &&
                detailInvoice?.payAmount !== null &&
                formatCurrency(detailInvoice.payAmount, detailInvoice.currency)
              })`}
            </Button>
          </div>

          <Button
            variant="link"
            className="pl-0"
            iconBefore={<LuCopy />}
            onClick={() => {
              if (paymentLink) {
                navigator.clipboard.writeText(paymentLink)
                toast.success(t('embed:code.linkCopied'))
              }
            }}
            disabled={!paymentLink}
          >
            {t('student:paymentProof.action.copyLink')}
          </Button>
        </div>
        <div className="box-row-full w-fit">
          <ViewRegistrationData />
          <DropdownMenu
            menuItems={menuPaymentStatus({
              invoiceId: invoiceGroup.invoiceId,
              paymentState: invoiceGroup.paymentState,
            })}
            trigger={
              <StatusChangeTrigger
                status={invoiceGroup.paymentState}
                statusMapping={paymentStatusMapping}
              />
            }
            contentProps={{ minWidth: '16rem', zIndex: 999 }}
          />
        </div>
      </div>

      {/* Enroll Courses for this invoice */}
      <div className="space-y-4 w-full">
        {invoiceGroup.enrollCourses.map(service => {
          const sortedServiceLessons = getSortedServiceLessons(service)
          const currentEnrollStatus =
            enrollStatuses.get(service.enrollCourseId) || service.confirmState

          return (
            <div
              key={service.enrollCourseId}
              className="border border-background-layer-4 rounded-lg p-4"
            >
              <div className="box-responsive-full justify-between">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-16 box-row-full">
                    <ImageAspect
                      s3="public"
                      ratio={16 / 9}
                      width="100%"
                      src={service.courseImg}
                      alt="Banner image"
                    />
                  </div>
                  <div>
                    <Text size="medium" data-testid="course-name">
                      {service.courseName}
                    </Text>
                    <Text size="medium" data-testid="class-name">
                      {service.className}
                    </Text>
                    <Text>
                      {t('student:teachingService.periodLoop')} #
                      <span data-testid="enroll-course-id">
                        {service.enrollCourseId}
                      </span>
                    </Text>
                  </div>
                </div>
                <div className="box-row-full w-fit" data-testid="enroll-status">
                  <DropdownMenu
                    menuItems={getMenuPauseStatus(service.enrollCourseId)}
                    trigger={
                      <StatusChangeTrigger
                        status={service.isPaused ? 'paused' : 'active'}
                        statusMapping={pauseStatusMapping}
                      />
                    }
                    contentProps={{ minWidth: '12rem', zIndex: 999 }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setServiceToBeDeleted(service)
                      setShowConfirmDelete(true)
                    }}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    {t('common:action.delete')}
                  </Button>
                </div>
              </div>

              {/* Lessons for this service */}
              {sortedServiceLessons?.length > 0 && (
                <div className="mt-2 w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10 text-center">#</TableHead>
                        <TableHead>
                          {t('student:teachingService.lesson')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedServiceLessons.map((item, idx) => {
                        const isChangeDate = !!item.changeStartTime

                        const startTime = getCurrentSiteTimeZoneDate(
                          item.startTime
                        )
                        const endTime = getCurrentSiteTimeZoneDate(item.endTime)
                        const changeStartTime = getCurrentSiteTimeZoneDate(
                          item.changeStartTime
                        )
                        const changeEndTime = getCurrentSiteTimeZoneDate(
                          item.changeEndTime
                        )

                        return (
                          <TableRow key={`${item.id}-${idx + 1}`}>
                            <TableCell className="w-10 text-center border-r border-gray-300 py-3 px-2">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="py-3 px-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="flex-2">
                                    <div
                                      className="text-sm"
                                      data-testid="lesson-time-slot"
                                    >
                                      {startTime &&
                                        endTime &&
                                        getLessonDateTime(
                                          startTime.toString(),
                                          endTime.toString(),
                                          t
                                        )}
                                    </div>
                                    {isChangeDate &&
                                      changeStartTime &&
                                      changeEndTime && (
                                        <div className="text-xs text-gray-400 line-through">
                                          {t('student:changedFrom')}{' '}
                                          {getLessonDateTime(
                                            changeStartTime.toString(),
                                            changeEndTime?.toString(),
                                            t
                                          )}
                                        </div>
                                      )}
                                  </div>
                                  <div className="flex-1">
                                    {GetAttendanceStatusComponent(
                                      item.attendance
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {sortedServiceLessons.length > 1 && (
                                    <IconButton
                                      icon={<LuTrash />}
                                      plain
                                      color="warn"
                                      onClick={() => {
                                        setStudentLessonToBeDeleted(
                                          Number(item.id)
                                        )
                                      }}
                                    />
                                  )}

                                  <Button
                                    variant="ghost"
                                    className="flex items-center gap-1 text-blue-500 hover:text-blue-600 p-0 h-auto"
                                    onClick={() => {
                                      setStudentData(prev => ({
                                        ...prev,
                                        currentEnrol: {
                                          ...service,
                                          invoices: [
                                            {
                                              invoiceId: invoiceGroup.invoiceId,
                                              paymentState:
                                                invoiceGroup.paymentState,
                                            },
                                          ],
                                        },
                                        currentStudent: student,
                                        tableDrawers: {
                                          ...prev.tableDrawers,
                                          isOpenAssignCourse: true,
                                          assignCourseMode:
                                            AddTeachingServiceMode.changeLesson,
                                        },
                                        currentStudentLesson: item,
                                      }))
                                    }}
                                    data-testid="changeLesson"
                                  >
                                    {isChangeDate ? (
                                      <div className="flex items-center gap-1">
                                        <div className="text-base font-normal">
                                          {t('student:editBtn')}
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <LuPencil className="w-4 h-4" />{' '}
                                        <div className="text-base font-normal">
                                          {t('student:changeBtn')}
                                        </div>
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Action buttons for this service */}
              <div className="flex gap-2 justify-end">
                {service?.classType !== ClassTypeEnum.subscription && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate(`?userId=${student.id}`)
                      setStudentData(prev => ({
                        ...prev,
                        currentStudent: student,
                        currentEnrol: {
                          ...service,
                          invoices: [
                            {
                              invoiceId: invoiceGroup.invoiceId,
                              paymentState: invoiceGroup.paymentState,
                            },
                          ],
                        },
                        currentStudentLesson: sortedServiceLessons?.[0],
                        tableDrawers: {
                          ...prev.tableDrawers,
                          assignCourseMode: AddTeachingServiceMode.addLesson,
                          isOpenAssignCourse: true,
                        },
                      }))
                    }}
                  >
                    {t('student:teachingService.addLesson')}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Delete confirmation dialogs */}
      <CustomedAlertDialog
        open={!!studentLessonToBeDeleted}
        setOpen={() => {
          setStudentLessonToBeDeleted(null)
        }}
        title={t('student:teachingService.deleteStudentLesson')}
        description={t('student:teachingService.deleteStudentLesson')}
        alertType={AlertTypes.WARN}
        cancelText={t('common:action.cancel') as string}
        actionText={t('common:action.confirm') as string}
        onActionClick={async () => {
          if (studentLessonToBeDeleted !== null) {
            await mutationDeleteStudentLesson.mutateAsync(
              studentLessonToBeDeleted
            )
          }
          setStudentLessonToBeDeleted(null)
        }}
      />
      <CustomedAlertDialog
        open={showConfirmDelete}
        setOpen={() => {
          setShowConfirmDelete(false)
          setServiceToBeDeleted(null)
        }}
        description={t(
          'student:teachingService.deteteTeachingServiceDescription'
        )}
        title={`${t('student:teachingService.deteteTeachingServiceTitle')}: ${
          serviceToBeDeleted?.courseName || ''
        }`}
        alertType={AlertTypes.WARN}
        cancelText={t('common:action.cancel') as string}
        actionText={t('common:action.confirm') as string}
        onActionClick={() => {
          if (serviceToBeDeleted) {
            handleDeleteTeachingService(serviceToBeDeleted)
          }
        }}
      />
    </div>
  )
}

export default TeachingServiceItem
