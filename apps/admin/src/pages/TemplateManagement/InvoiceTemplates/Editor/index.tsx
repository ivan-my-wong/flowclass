import { useCallback, useEffect, useMemo } from 'react'
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
import { Input } from '@/components/ui/Inputs/Input'
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
import { useSendingCampaign } from '@/hooks/useSendingCampaign'
import useStudentInvoice from '@/hooks/useStudentInvoice'
import ContentLayout from '@/layouts/ContentLayout'
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
import { PriceOption } from '@/types/regularClass'
import {
  type InvoiceCampaignDetailDto,
  InvoiceCampaignDto,
  type InvoiceClassType,
  type InvoiceSessionType,
  InvoiceSplitType,
  type InvoiceStudent,
} from '@/types/studentInvoice.type'
import type { InvoiceCampaign } from '@/types/templateManagement'
import dayjs from '@/utils/dayjs'
import {
  buildInvoiceCampaignData,
  createSessionId,
} from '@/utils/invoice-campaign.utils'

import CourseAssignment from './CourseAssignment'
import { InvoiceEditorProvider } from './InvoiceEditorContext'

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

  const resetAllStudents = useResetRecoilState(invoiceStudentState)
  const resetAllClasses = useResetRecoilState(invoiceClassesState)
  const resetAllSessions = useResetRecoilState(invoiceSessionState)
  const resetCurrentActiveStudent = useResetRecoilState(
    currentActiveStudentState
  )
  const resetInvoiceCampaign = useResetRecoilState(invoiceCampaignState)

  const determineClassPrice = (priceOption: PriceOption | undefined) => {
    if (!priceOption) return 0
    const { amount, numberOfLessons, priceType } = priceOption
    let amountNum = Number(amount)
    if (priceType !== PriceType.PER_LESSON) {
      amountNum = Number(amount) / (numberOfLessons || 1)
    }
    return Number.isFinite(amountNum) ? amountNum : 0
  }

  const initializeCampaignData = useCallback(
    (invoiceCampaign: InvoiceCampaign, classes: Classes[]) => {
      setInvoiceCampaign({
        id: invoiceCampaign.id,
        title: invoiceCampaign.title,
        isCombined: invoiceCampaign.isCombined,
        isDraft: invoiceCampaign.isDraft,
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
        const students = (invoices ?? []).map(invoice => {
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
          } as InvoiceStudent
        })
        setAllStudents(students)
        setAllClasses(
          (invoices ?? []).flatMap(invoice =>
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
        )
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
  const saveCampaign = async () => {
    const invoiceCampaigns: InvoiceCampaignDetailDto[] =
      buildInvoiceCampaignData(
        currentSchool?.id ?? 0,
        currentSite?.id ?? 0,
        currentSite?.currency || DEFAULT_CURRENCY,
        allStudents,
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
            ...defaultStudentInvoiceConfig,
          }
          return newInvoiceStudentItem
        })
      setAllStudents(studentsToAssign)
      if (studentsToAssign.length > 0) {
        setCurrentActiveStudent(studentsToAssign[0])
      }
    }
  }, [setAllStudents, setCurrentActiveStudent, studentIdsToAssign, studentList])

  const isDisabledActions = useMemo(() => {
    return isCreating || isUpdating
  }, [isCreating, isUpdating])

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
    setInvoiceCampaign(prev => {
      if (!prev) return null
      return {
        ...prev,
        isCombined: isOneSingleParent,
      }
    })
  }, [isOneSingleParent, setInvoiceCampaign])
  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value
      .replace(/\s{2,}/g, ' ')
      .replace(/^\s+/, '')
    setInvoiceCampaign(prev => {
      if (!prev) return null
      return {
        ...prev,
        title: newTitle ?? prev.title,
        isCombined: prev.isCombined ?? false,
      }
    })
  }

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
      <ContentLayout
        headerBackButton={{
          mode: 'back',
          action: () => navigate('/invoice-templates'),
        }}
        headerClassName="px-4 md:flex-row flex-col"
        leftHeader={
          <>
            <Input
              id="name"
              placeholder={t(
                'invoiceCampaign:studentCard.invoiceCampaignName'
              ).toString()}
              value={existingInvoiceCampaign?.title ?? ''}
              onChange={onChangeName}
              disabled={!existingInvoiceCampaign}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SegmentedSwitch
                    disabled={!isOneSingleParent}
                    className="min-w-fit"
                    value={existingInvoiceCampaign?.isCombined ?? false}
                    onChange={onChangeMode}
                    trueLabel={t('invoiceCampaign:editor.single') as string}
                    falseLabel={t('invoiceCampaign:editor.multiple') as string}
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
          <div className="flex gap-2">
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
            {allStudents.length > 0 && (
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

            <Button
              variant="default"
              iconBefore={<LuSend />}
              disabled={allStudents.length === 0 || isDisabledActions}
              onClick={() => {
                let endPath = 'send-multiple'
                if (existingInvoiceCampaign?.isCombined) {
                  endPath = 'send'
                }
                if (invoiceCampaign?.jobId) {
                  endPath = 'sending-progress'
                }
                navigate(
                  `/invoice-templates/editor/${endPath}` +
                    `?documentId=${searchParams.get('documentId') || ''}`
                )
              }}
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
    </InvoiceEditorProvider>
  )
}

export default InvoiceEditor
