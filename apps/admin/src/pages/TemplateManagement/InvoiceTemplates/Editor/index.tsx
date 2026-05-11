import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { AiOutlineSave } from 'react-icons/ai'
import { LuEye, LuSend } from 'react-icons/lu'
import {
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from 'recoil'

import { Button } from '@/components/ui/Button'
import SegmentedSwitch from '@/components/ui/SegmentedSwitch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { defaultStudentInvoiceConfig } from '@/constants/invoiceCampaign.constant'
import { DEFAULT_CURRENCY } from '@/constants/invoices'
import useClassData from '@/hooks/useClassData'
import useInvoiceCampaignData from '@/hooks/useInvoiceCampaignData'
import { useRecalculateAllPromotions } from '@/hooks/useRecalculateAllPromotions'
import { useSendingCampaign } from '@/hooks/useSendingCampaign'
import useStudentInvoice from '@/hooks/useStudentInvoice'
import ContentLayout from '@/layouts/ContentLayout'
import ConfirmSendPaymentProof from '@/pages/PaymentProofTable/components/ConfirmSendPaymentProof'
import { schoolState } from '@/stores/schoolData'
import { siteState } from '@/stores/siteData'
import {
  appliedPromotionsState,
  classesState,
  currentActiveParentState,
  currentActiveStudentState,
  invoiceCampaignState,
  invoiceClassesState,
  invoiceSessionState,
  invoiceStudentState,
  studentListState,
} from '@/stores/studentInvoice.store'
import { BundleDiscount } from '@/types/bundleDiscounts'
import type { Classes } from '@/types/classes'
import { ClassTypeEnum, PriceType } from '@/types/course'
import { PaymentProofTableItem } from '@/types/enrollCourse'
import { SendPaymentActions } from '@/types/paymentProof'
import { StudentEnrolmentRecord } from '@/types/student'
import {
  type InvoiceCampaignDetailDto,
  InvoiceCampaignDto,
  type InvoiceClassType,
  type InvoiceSessionType,
  InvoiceSplitType,
  type InvoiceStudent,
} from '@/types/studentInvoice.type'
import {
  BulkSendDocumentStatus,
  type InvoiceCampaign,
} from '@/types/templateManagement'
import dayjs from '@/utils/dayjs'
import {
  buildInvoiceCampaignData,
  createSessionId,
  getEarliestSessionDate,
} from '@/utils/invoice-campaign.utils'

import CourseAssignment from './CourseAssignment'
import { InvoiceEditorProvider } from './InvoiceEditorContext'
import LessonDataLoader from './LessonDataLoader'
import PackageDiscountAutoApplyAll from './PackageDiscountAutoApplyAll'

const InvoiceEditor = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const documentId = searchParams.get('documentId') || undefined
  const studentIdsToAssign = searchParams.get('studentIds') || undefined
  const isEditMode = useMemo(() => documentId !== undefined, [documentId])
  const { useFetchAllClasses } = useClassData()
  const { data: classes } = useFetchAllClasses()
  const {
    useCreateInvoiceCampaign,
    useUpdateInvoiceCampaign,
    useFetchDetailInvoiceCampaign,
  } = useInvoiceCampaignData()

  const { useGetAllPromotions } = useStudentInvoice()
  const { data: allPromotions } = useGetAllPromotions()
  const { mutateAsync: createCampaign, isLoading: isCreating } =
    useCreateInvoiceCampaign(document => {
      navigate(`/invoice-templates/editor?documentId=${document.id}`)
    })
  const [existingInvoiceCampaign, setInvoiceCampaign] =
    useRecoilState(invoiceCampaignState)
  const { startEvent } = useSendingCampaign()
  const setListClasses = useSetRecoilState(classesState)
  const { mutateAsync: updateCampaign, isLoading: isUpdating } =
    useUpdateInvoiceCampaign(documentId)
  const { data: invoiceCampaign } = useFetchDetailInvoiceCampaign(documentId, {
    enabled: (classes ?? [])?.length > 0,
  })
  const { currentSchool } = useRecoilValue(schoolState)
  const { currentSite } = useRecoilValue(siteState)
  const studentList = useRecoilValue(studentListState)
  const setCurrentActiveParent = useSetRecoilState(currentActiveParentState)
  const [allStudents, setAllStudents] = useRecoilState(invoiceStudentState)
  const [allClasses, setAllClasses] = useRecoilState(invoiceClassesState)
  const [allSessions, setAllSessions] = useRecoilState(invoiceSessionState)
  const setCurrentActiveStudent = useSetRecoilState(currentActiveStudentState)
  const setAppliedPromotions = useSetRecoilState(appliedPromotionsState)
  const { recalculateAll } = useRecalculateAllPromotions()

  const resetAllStudents = useResetRecoilState(invoiceStudentState)
  const resetAllClasses = useResetRecoilState(invoiceClassesState)
  const resetAllSessions = useResetRecoilState(invoiceSessionState)
  const resetCurrentActiveStudent = useResetRecoilState(
    currentActiveStudentState
  )
  const resetInvoiceCampaign = useResetRecoilState(invoiceCampaignState)

  // Snapshot of loaded state — used to detect which student invoices were actually edited
  type StudentSnap = {
    classIds: number[]
    sessionCount: number
    paymentDate: Date | null
    invoiceRemark: string
  }
  const snapshotRef = useRef<Map<number, StudentSnap> | null>(null)

  const determineClassPrice = (cls?: Classes) => {
    const amount = cls?.tuition != null ? Number(cls.tuition) : 0
    return Number.isFinite(amount) ? amount : 0
  }

  const initializeCampaignData = useCallback(
    (invoiceCampaign: InvoiceCampaign, classes: Classes[]) => {
      setInvoiceCampaign({
        id: invoiceCampaign.id,
        title: invoiceCampaign.title,
        isCombined: invoiceCampaign.isCombined,
        isDraft: invoiceCampaign.isDraft,
        status: invoiceCampaign.status,
        sendViaEmail: invoiceCampaign.sendViaEmail,
        emailSubject: invoiceCampaign.emailSubject,
        emailBody: invoiceCampaign.emailBody,
        sendViaWhatsapp: invoiceCampaign.sendViaWhatsapp,
        whatsappContent: invoiceCampaign.whatsappContent,
        invoices: [],
        invoiceIds: invoiceCampaign.invoiceIds,
        jobId: invoiceCampaign.jobId || '',
      })
      if (invoiceCampaign.jobId) {
        startEvent(invoiceCampaign)
      }
      if (invoiceCampaign.metadata) {
        const { invoices } = invoiceCampaign.metadata
        const actualInvoices = invoiceCampaign.invoices ?? []
        const students = (invoices ?? []).map(invoice => {
          const matchedActualInvoice = actualInvoices.find(
            ai => ai.userAlias?.id === invoice.userAliasId
          )
          const formatApliedPromotions = (invoice?.discounts ?? []).map(
            appliedItem => {
              const promotionData = allPromotions?.find(
                x => x.id === appliedItem.id
              )
              const appliedPromotionItem = { ...appliedItem }
              if (promotionData) {
                const now = dayjs()
                if ('code' in promotionData) {
                  appliedPromotionItem.isApplicable =
                    promotionData.status === 'ACTIVE' &&
                    !dayjs(promotionData.expireDate).endOf('day').isBefore(now)
                }
                if ('name' in promotionData) {
                  const bundleDiscount = promotionData as BundleDiscount
                  appliedPromotionItem.isApplicable =
                    bundleDiscount.isActive &&
                    !dayjs(bundleDiscount.endDate).endOf('day').isBefore(now)
                }
              }
              return {
                ...appliedPromotionItem,
              }
            }
          )
          const studentData = studentList.find(
            item => item.id === invoice.userAliasId
          )

          let isSendToParent: boolean = invoice?.isSendToParent
          if (
            invoice.isSendToParent === null ||
            invoice.isSendToParent === undefined
          ) {
            if (invoice.childOfUserAliasId) {
              isSendToParent = true
            } else {
              isSendToParent = false
            }
          }
          return {
            name: invoice.name,
            email: invoice.email,
            phone: invoice.phone,
            userId: invoice.userId,
            id: invoice.userAliasId,
            appliedPromotions: formatApliedPromotions ?? [],
            invoiceRemark: invoice.invoiceRemark ?? '',
            invoiceSplitType: invoice.splitType ?? InvoiceSplitType.SINGLE,
            invoiceSplitItems: invoice.splitItems ?? [],
            isPayByCredit: invoice?.isPayByCredit ?? true,
            usedBalance: invoice?.usedBalance ?? 0,
            childOfUserAliasId: invoice?.childOfUserAliasId ?? null,
            isStudentParent: studentData?.isStudentParent ?? false,
            isSendToParent,
            total: 0,
            paymentDate: invoice.paymentDate
              ? new Date(invoice.paymentDate)
              : null,
            invoicePromotionsUsed:
              matchedActualInvoice?.invoicePromotionsUsed ?? [],
            subTotal: matchedActualInvoice
              ? Number(matchedActualInvoice.payAmount || 0) +
                Number(matchedActualInvoice.usedBalance || 0) +
                Number(matchedActualInvoice.discountAmount || 0) -
                Number(matchedActualInvoice.additionalFee || 0)
              : Number(invoice.total || 0),
            discountAmount: matchedActualInvoice
              ? Number(matchedActualInvoice.discountAmount || 0)
              : undefined,
            additionalFee: matchedActualInvoice
              ? Number(matchedActualInvoice.additionalFee || 0)
              : undefined,
          } as InvoiceStudent
        })
        setAllStudents(students)
        const computedClasses: InvoiceClassType[] = (invoices ?? []).flatMap(
          invoice =>
            (invoice.classes ?? []).map(cl => {
              const cls = classes.find(item => item.id === cl.classId)
              const priceOption = cls?.priceOptions?.find(
                d => d.priceType === cls.priceType && d.id === cl.priceOptionId
              )
              const lessonLength =
                (cl.individualPickedLessonsString ?? [])?.length > 0
                  ? (cl.individualPickedLessonsString ?? []).length
                  : (cl.pickedLessons ?? []).length

              const classPrice = determineClassPrice(priceOption)
              return {
                type: cls?.type as ClassTypeEnum,
                courseName: cls?.name,
                classId: cl.classId,
                courseId: cl.courseId,
                price: classPrice,
                priceType: priceOption?.priceType ?? PriceType.PER_LESSON,
                priceOption,
                remark: cl.remark ?? '',
                sessionLength: lessonLength || 1,
                studentItem: students.find(d => d.id === invoice.userAliasId),
              } as InvoiceClassType
            })
        )
        setAllClasses(computedClasses)
        const sessions = (invoices ?? []).flatMap(
          inv =>
            inv.classes
              .flatMap(cls => {
                const classItem = classes.find(d => d.id === cls.classId)
                const studentItem = students.find(d => d.id === inv.userAliasId)
                if (!classItem?.type || !studentItem) return null
                if (classItem?.type === ClassTypeEnum.regularV2) {
                  return cls.selectedRegularSchedulePreviewV2
                    ?.flatMap(l => l.lessons)
                    .map(l => {
                      return {
                        ...l,
                        courseName: classItem.name,
                        studentItem,
                        classItem: {
                          ...classItem,
                          name: classItem.name,
                          classId: cls.classId,
                        },
                      } as unknown as InvoiceSessionType
                    })
                }
                if (
                  [ClassTypeEnum.appointment, ClassTypeEnum.recurring].includes(
                    classItem?.type
                  )
                ) {
                  return (cls.pickedLessons ?? [])?.map(
                    lesson =>
                      ({
                        id: lesson.id,
                        startTime: lesson.startTime,
                        endTime: lesson.endTime,
                        date: dayjs(lesson.startTime).format('YYYY-MM-DD'),
                        courseName: classItem.name,
                        studentItem,
                        classItem: {
                          ...classItem,
                          name: classItem.name,
                          classId: cls.classId,
                        },
                        period: lesson.periodId,
                        lessonNumber: 1,
                      } as unknown as InvoiceSessionType)
                  )
                }
                if (classItem.type === ClassTypeEnum.workshop) {
                  return cls.pickedLessons?.map(lesson => {
                    return {
                      id: lesson.id,
                      startTime: lesson.startTime,
                      endTime: lesson.endTime,
                      date: dayjs(lesson.startTime).format('YYYY-MM-DD'),
                      courseName: classItem.name,
                      studentItem,
                      classItem: {
                        ...classItem,
                        name: classItem.name,
                        classId: cls.classId,
                      },
                      period: lesson.periodId,
                      lessonNumber: 1,
                    } as unknown as InvoiceSessionType
                  })
                }
                return {
                  id: createSessionId(
                    {
                      billingStartDate:
                        cls.billingStartDate ?? new Date().toISOString(),
                      billingEndDate:
                        cls.billingEndDate ?? new Date().toISOString(),
                    },
                    studentItem.userId
                  ),
                  lessonNumber: 1,
                  studentItem,
                  startTime: cls.billingStartDate as string,
                  endTime: cls.billingEndDate as string,
                  date: cls.billingStartDate as string,
                  courseName: classItem.name,
                  classItem: {
                    ...classItem,
                    name: classItem.name,
                    classId: cls.classId,
                  },
                } as unknown as InvoiceSessionType
              })
              .filter(Boolean) as InvoiceSessionType[]
        )
        setAllSessions(sessions)

        // For combined campaigns, the parent's userAlias lives on the actual DB invoice,
        // not in the metadata — populate currentActiveParent directly from it.
        if (invoiceCampaign.isCombined && actualInvoices.length > 0) {
          const parentAlias = actualInvoices[0].userAlias
          if (parentAlias) {
            setCurrentActiveParent({
              id: parentAlias.id,
              userId: parentAlias.userId,
              name: parentAlias.name,
              email: parentAlias.email,
              phone: parentAlias.user?.phone ?? '',
              user: {
                id: parentAlias.userId,
                phone: parentAlias.user?.phone ?? '',
              },
              isStudentParent: parentAlias.isStudentParent,
              childOfUserAliasId: parentAlias.childOfUserAliasId ?? null,
              usedBalance: 0,
            } as unknown as StudentEnrolmentRecord)
          }
        }

        // Record the loaded state so saveCampaign can detect which students changed
        const snap = new Map<number, StudentSnap>()
        students.forEach(student => {
          snap.set(student.id, {
            classIds: computedClasses
              .filter(c => c.studentItem?.id === student.id)
              .map(c => c.classId)
              .sort((a, b) => a - b),
            sessionCount: sessions.filter(s => s.studentItem?.id === student.id)
              .length,
            paymentDate: student.paymentDate ?? null,
            invoiceRemark: student.invoiceRemark ?? '',
          })
        })
        snapshotRef.current = snap
      }
    },
    [
      allPromotions,
      setAllClasses,
      setAllSessions,
      setAllStudents,
      setInvoiceCampaign,
      startEvent,
      studentList,
    ]
  )
  const getDirtyStudentIds = (): Set<number> => {
    const snapshot = snapshotRef.current
    if (!snapshot) return new Set(allStudents.map(s => s.id))

    const dirtyIds = allStudents
      .filter(student => {
        const snap = snapshot.get(student.id)
        if (!snap) return true

        const currentClassIds = allClasses
          .filter(c => c.studentItem?.id === student.id)
          .map(c => c.classId)
          .sort((a, b) => a - b)
        if (
          currentClassIds.length !== snap.classIds.length ||
          currentClassIds.some((id, i) => id !== snap.classIds[i])
        )
          return true

        const currentSessionCount = allSessions.filter(
          s => s.studentItem?.id === student.id
        ).length
        if (currentSessionCount !== snap.sessionCount) return true

        if (student.paymentDate?.getTime() !== snap.paymentDate?.getTime())
          return true

        if ((student.invoiceRemark ?? '') !== snap.invoiceRemark) return true

        return false
      })
      .map(s => s.id)

    return new Set(dirtyIds)
  }

  const saveCampaign = async () => {
    let studentsToSave = allStudents

    if (isEditMode && snapshotRef.current) {
      const dirtyIds = getDirtyStudentIds()
      studentsToSave = allStudents.filter(s => dirtyIds.has(s.id))
      if (studentsToSave.length === 0) return
    }

    const invoiceCampaigns: InvoiceCampaignDetailDto[] =
      buildInvoiceCampaignData(
        currentSchool?.id ?? 0,
        currentSite?.id ?? 0,
        currentSite?.currency || DEFAULT_CURRENCY,
        studentsToSave,
        allClasses,
        allSessions
      )
    if (isEditMode && existingInvoiceCampaign?.id) {
      await updateCampaign({
        ...(existingInvoiceCampaign as unknown as InvoiceCampaignDto),
        invoices: invoiceCampaigns,
      })
    } else if (existingInvoiceCampaign) {
      await createCampaign({
        ...existingInvoiceCampaign,
        invoices: invoiceCampaigns,
      })
    }
  }

  useEffect(() => {
    if (!isEditMode && !invoiceCampaign) {
      setInvoiceCampaign({
        isCombined: false,
        title: t('invoiceCampaign:invoiceItem.title'),
        isDraft: true,
        invoices: [],
        sendViaEmail: false,
        emailSubject: '',
        emailBody: '',
        sendViaWhatsapp: false,
        whatsappContent: '',
        splitItems: [],
        invoiceIds: [],
        splitType: InvoiceSplitType.SINGLE,
        jobId: null,
      })
    } else if (isEditMode && invoiceCampaign && classes) {
      initializeCampaignData(invoiceCampaign, classes)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isEditMode,
    classes,
    invoiceCampaign,
    setInvoiceCampaign,
    // initializeCampaignData,
  ])
  useEffect(() => {
    if (classes) {
      setListClasses(classes)
    }
  }, [classes, setListClasses])

  useEffect(() => {
    if (studentIdsToAssign && studentList) {
      const studentIdArr = studentIdsToAssign.split(',').map(Number)
      const studentsToAssign: InvoiceStudent[] = studentList
        .filter(item => studentIdArr.includes(item.id))
        .map(studentItem => {
          let isSendToParent: boolean = false
          if (studentItem.childOfUserAliasId) {
            isSendToParent = true
          }
          const newInvoiceStudentItem: InvoiceStudent = {
            id: studentItem.id,
            userId: studentItem.userId,
            name: studentItem.name,
            email: studentItem.email,
            phone: studentItem.user.phone,
            isStudentParent: studentItem?.isStudentParent ?? false,
            childOfUserAliasId: studentItem.childOfUserAliasId ?? null,
            isPayByCredit: true,
            usedBalance: studentItem.usedBalance ?? 0,
            isSendToParent,
            total: 0,
            paymentDate: null,
            ...defaultStudentInvoiceConfig,
          }
          return newInvoiceStudentItem
        })
      setAllStudents(studentsToAssign)
      if (studentsToAssign.length > 0) {
        setCurrentActiveStudent(studentsToAssign[0])
        // Auto-set title to first student's name if title is still default
        const defaultTitle = t('invoiceCampaign:invoiceItem.title')
        setInvoiceCampaign(prev => {
          if (!prev) return prev
          if (prev.title && prev.title !== defaultTitle) return prev
          return { ...prev, title: studentsToAssign[0].name }
        })
      }
    }
  }, [
    setAllStudents,
    setCurrentActiveStudent,
    studentIdsToAssign,
    studentList,
    t,
    setInvoiceCampaign,
  ])

  const isCompleted =
    invoiceCampaign?.status === BulkSendDocumentStatus.COMPLETED

  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false)

  const whatsappRows = useMemo<PaymentProofTableItem[]>(() => {
    if (!isCompleted || !invoiceCampaign?.invoices) return []
    return invoiceCampaign.invoices
      .filter(inv => inv.proofToken)
      .map(inv => {
        const firstEnroll = inv.enrollCourses?.[0]
        return {
          id: inv.id,
          proofToken: inv.proofToken,
          institutionId: inv.institutionId ?? 0,
          userId: inv.userId ?? 0,
          userAlias: {
            id: inv.userAlias?.id ?? 0,
            name: firstEnroll?.name ?? '',
            email: firstEnroll?.email ?? '',
            userId: inv.userId ?? 0,
          },
          sendWhatsapp: {
            phone: firstEnroll?.phone ?? '',
            email: firstEnroll?.email ?? '',
            name: firstEnroll?.name ?? '',
          },
        } as unknown as PaymentProofTableItem
      })
  }, [isCompleted, invoiceCampaign?.invoices])

  const isDisabledActions = useMemo(() => {
    return isCreating || isUpdating
  }, [isCreating, isUpdating])

  const handleSendInvoices = () => {
    recalculateAll()
    let endPath = 'send-multiple'
    if (existingInvoiceCampaign?.isCombined) {
      endPath = 'send'
    }
    if (invoiceCampaign?.jobId && !isCompleted) {
      endPath = 'sending-progress'
    }
    navigate(
      `/invoice-templates/editor/${endPath}` +
        `?documentId=${searchParams.get('documentId') || ''}`
    )
  }

  const parentIds = useMemo(() => {
    // This should add the user's itself ID too
    return allStudents.flatMap(d => d.childOfUserAliasId).filter(Boolean)
  }, [allStudents])

  const isOneSingleParent = useMemo(() => {
    // It might work if two students are from different parents, but we don't want to allow that
    return Array.from(new Set(parentIds)).length === 1 && allStudents.length > 1
    // return allStudents.length > 1
  }, [parentIds, allStudents])

  const parent = useMemo(() => {
    const parentId = parentIds.at(0)
    if (!parentId) return null
    return studentList.find(d => d.id === parentId)
  }, [studentList, parentIds])

  useEffect(() => {
    if (parent) {
      setCurrentActiveParent({
        ...parent,
        phone: parent.user?.phone ?? parent.phone,
      })
    }
  }, [parent, setCurrentActiveParent])

  useEffect(() => {
    // In edit mode, isCombined is set from the DB in initializeCampaignData.
    // Only auto-set it in create mode; otherwise the user's saved setting is overridden.
    if (isEditMode) return
    setInvoiceCampaign(prev => {
      if (!prev) return null
      if (prev.isCombined === isOneSingleParent) return prev
      return {
        ...prev,
        isCombined: isOneSingleParent,
      }
    })
  }, [isOneSingleParent, isEditMode, setInvoiceCampaign])

  useEffect(() => {
    if (allStudents.length === 0 || allSessions.length === 0) return

    const updated = allStudents.map(student => {
      // Only auto-set if no paymentDate exists yet; respect manually-set dates
      if (student.paymentDate) return student
      const earliest = getEarliestSessionDate(student.id, allSessions)
      if (!earliest) return student
      return { ...student, paymentDate: earliest }
    })

    const hasChanges = updated.some((s, i) => {
      return (
        s.paymentDate?.toString() !== allStudents[i].paymentDate?.toString()
      )
    })
    if (hasChanges) {
      setAllStudents(updated)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSessions])

  const onChangeMode = (value: boolean) => {
    setAppliedPromotions([])
    setInvoiceCampaign(prev => {
      if (!prev) return null
      return {
        ...prev,
        isCombined: value,
      }
    })
  }

  useEffect(() => {
    return () => {
      resetAllSessions()
      resetAllClasses()
      resetAllStudents()
      resetCurrentActiveStudent()
      resetInvoiceCampaign()
    }
  }, [
    resetAllClasses,
    resetAllSessions,
    resetAllStudents,
    resetCurrentActiveStudent,
    resetInvoiceCampaign,
  ])

  return (
    <InvoiceEditorProvider>
      <LessonDataLoader />
      <PackageDiscountAutoApplyAll />
      <ContentLayout
        headerBackButton={{
          mode: 'back',
          action: () => navigate('/invoice-templates'),
        }}
        headerClassName="px-4 md:flex-row flex-col"
        leftHeader={
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SegmentedSwitch
                    disabled={!isOneSingleParent || isCompleted}
                    className="min-w-fit"
                    value={existingInvoiceCampaign?.isCombined ?? false}
                    onChange={onChangeMode}
                    trueLabel={t('invoiceCampaign:editor.combined') as string}
                    falseLabel={
                      t('invoiceCampaign:editor.individual') as string
                    }
                  />
                </TooltipTrigger>
                {!isOneSingleParent && (
                  <TooltipContent>
                    <p>
                      {
                        t(
                          'invoiceCampaign:editor.combineInvoiceTooltip'
                        ) as string
                      }
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </>
        }
        rightHeader={
          <div className="flex items-center gap-2">
            {isCompleted && (
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  {t('invoiceCampaign:editor.editMode')}
                </span>
                {existingInvoiceCampaign?.invoiceIds?.[0] && (
                  <a
                    href={`/application/edit?id=${existingInvoiceCampaign.invoiceIds[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 underline hover:text-blue-800"
                  >
                    #{existingInvoiceCampaign.invoiceIds[0]}
                  </a>
                )}
              </div>
            )}
            {/* <Button
              variant="outline"
              iconBefore={<LuEye aria-hidden="true" />}
              disabled={allStudents.length <= 0}
              onClick={() => {
                navigate(
                  '/invoice-templates/editor/preview' +
                    `?documentId=${searchParams.get('documentId') || ''}`
                )
              }}
            >
              {t('invoiceCampaign:editor.previewAllInvoices')}
            </Button> */}
            {allStudents.length > 0 && !isCompleted && (
              <Button
                iconBefore={<AiOutlineSave />}
                variant="primary-outline"
                loading={isCreating || isUpdating}
                disabled={isDisabledActions}
                onClick={saveCampaign}
              >
                {t('invoiceCampaign:editor.saveCampaign')}
              </Button>
            )}

            {isCompleted && (
              <Button
                variant="outline"
                iconBefore={<LuSend />}
                disabled={whatsappRows.length === 0}
                onClick={() => setIsWhatsappModalOpen(true)}
              >
                {t('editor.send.sendViaWhatsApp', { ns: 'invoiceCampaign' })}
              </Button>
            )}

            <Button
              variant="default"
              iconBefore={<LuSend />}
              disabled={allStudents.length === 0 || isDisabledActions}
              loading={isCreating || isUpdating}
              onClick={handleSendInvoices}
            >
              {t('invoiceCampaign:editor.sendInvoices')}
            </Button>
          </div>
        }
        mainClassName="bg-gray-50 h-screen"
      >
        <CourseAssignment />
        <Outlet />
      </ContentLayout>
      {isWhatsappModalOpen && (
        <ConfirmSendPaymentProof
          action={SendPaymentActions.RESEND_PAYMENT_REMINDER}
          selectedRows={whatsappRows}
          isOpen={isWhatsappModalOpen}
          onClose={() => setIsWhatsappModalOpen(false)}
        />
      )}
    </InvoiceEditorProvider>
  )
}

export default InvoiceEditor
