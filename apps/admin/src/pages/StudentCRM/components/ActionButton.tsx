import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { AiOutlineUserSwitch } from 'react-icons/ai'
import { IoBookOutline } from 'react-icons/io5'
import {
  LuCreditCard,
  LuEye,
  LuLink,
  LuMerge,
  LuMessageSquare,
  LuPrinter,
  LuUserCheck,
  LuUserMinus,
  LuUserPlus,
} from 'react-icons/lu'
import { useMutation, useQueryClient } from 'react-query'
import { useRecoilState, useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { deleteStudent, editStatusStudent } from '@/api/student'
import DeleteIcon from '@/assets/svgs/student/DeleteIcon'
import TeachingServiceIcon from '@/assets/svgs/student/TeachingServiceIcon'
import ViewIcon from '@/assets/svgs/student/ViewIcon'
import DropdownMenu, {
  DropDownMenuItemType,
} from '@/components/DropDownMenus/DropDownMenu'
import SvgIcon from '@/components/Images/SvgIcon'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import {
  CUSTOM_DATA_FIELD_THRESHOLD,
  STUDENT_TABS,
  StudentStatus,
} from '@/constants/common'
import { QUERY_KEY } from '@/constants/queryKey'
import useCredit from '@/hooks/useCredit'
import { PrintLabelModalHandle } from '@/pages/StudentCRM/Label/PrintLabelModal'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { schoolState } from '@/stores/schoolData'
import { siteState } from '@/stores/siteData'
import { AddTeachingServiceMode, studentState } from '@/stores/studentData'
import { userPermissionState, UserRole } from '@/stores/userPermissionData'
import {
  StudentEnrolmentRecord,
  TypeDeleteStudentParams,
  TypeEditStatusStudentParams,
} from '@/types/student'
import { StudentUser } from '@/types/user'
import { generateDataTestId } from '@/utils/data-testid.utils'

import AddToParentGroupModal, {
  AddToParentGroupModalHandle,
} from './AddToParentGroupModal'
import ChangeToNewFamilyGroupModal, {
  ChangeToNewFamilyGroupModalHandle,
} from './ChangeToNewFamilyGroupModal'
import CreditBalanceModal, {
  CreditBalanceModalHandle,
} from './CreditBalanceModal'
import EditRemarksModal, { EditRemarksModalHandle } from './EditRemarksModal'
import MergeStudentModal, { MergeStudentModalHandle } from './MergeStudentModal'
import RemoveFromCurrentGroupModal, {
  RemoveFromCurrentGroupModalHandle,
} from './RemoveFromCurrentGroupModal'
import SetAsParentAccountModal, {
  SetAsParentAccountModalHandle,
} from './SetAsParentAccountModal'

type ActionButtonProps = {
  selectedTab: string
  studentInfo: StudentEnrolmentRecord
  refetchAllStudents: () => void
}

const ActionButton = ({
  selectedTab,
  studentInfo,
  refetchAllStudents,
}: ActionButtonProps): React.ReactElement => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [schoolData] = useRecoilState(schoolState)
  const currentSchoolId = schoolData.currentSchool?.id || 0
  const [siteData] = useRecoilState(siteState)
  const userPermission = useRecoilValue(userPermissionState)

  const {
    userId,
    email,
    id: userAliasId,
    isStudentParent,
    childOfUserAliasId,
  } = studentInfo

  const currentSiteId = siteData.currentSite?.id || 0
  const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false)
  const [showConfirmInactivePopup, setShowConfirmInactivePopup] =
    useState<boolean>(false)
  const queryClient = useQueryClient()
  const isBinTab = selectedTab === STUDENT_TABS.BIN
  const isActiveStudent = studentInfo?.user?.status === StudentStatus.ACTIVE

  const hasPermission = [
    UserRole.MasterAdmin,
    UserRole.SiteAdmin,
    UserRole.SchoolAdmin,
  ].includes(userPermission)

  const [, setStudentData] = useRecoilState(studentState)
  const registrationForm = useMemo(() => {
    return (studentInfo.enrollCourses || []).flatMap(
      enrollCourse => enrollCourse.registrationForm || []
    )
  }, [studentInfo?.enrollCourses])

  const { useCheckCreditSystemActive } = useCredit()
  const { isActive: showCreditSystem } = useCheckCreditSystemActive()

  const previousValue = useRef<string>()
  /*
   * Consider checking if value changed before setting/removing from localStorage
   * to avoid unnecessary operations
   */
  useEffect(() => {
    if ((registrationForm?.length || 0) > CUSTOM_DATA_FIELD_THRESHOLD) {
      if (previousValue.current !== 'true') {
        localStorage.setItem('showCustomDataField', 'true')
        previousValue.current = 'true'
      }
    } else if (previousValue.current === 'true') {
      localStorage.removeItem('showCustomDataField')
      previousValue.current = undefined
    }

    return () => {
      if (previousValue.current === 'true') {
        localStorage.removeItem('showCustomDataField')
        previousValue.current = undefined
      }
    }
  }, [registrationForm])

  const printLabelModalHandle = useRef<PrintLabelModalHandle>(null)
  const editRemarksModalHandle = useRef<EditRemarksModalHandle>(null)
  const creditBalanceModalHandle = useRef<CreditBalanceModalHandle>(null)
  const addToParentGroupModalHandle = useRef<AddToParentGroupModalHandle>(null)
  const setAsParentAccountModalHandle =
    useRef<SetAsParentAccountModalHandle>(null)
  const changeToNewFamilyGroupModalHandle =
    useRef<ChangeToNewFamilyGroupModalHandle>(null)
  const removeFromCurrentGroupModalHandle =
    useRef<RemoveFromCurrentGroupModalHandle>(null)
  const mergeStudentModalHandle = useRef<MergeStudentModalHandle>(null)

  const reInvalidateQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries([
        QUERY_KEY.student.studentListNewKey,
        currentSchoolId,
      ]),
      queryClient.invalidateQueries(QUERY_KEY.student.studentListBinKey),
    ])
  }
  const mutationDeleteStudent = useMutation({
    mutationFn: (params: Partial<TypeDeleteStudentParams>) =>
      deleteStudent(params),
    onSuccess: async () => {
      await reInvalidateQueries()
      toast.success(t('student:detail.deleteStudentSuccess'))
      setShowConfirmPopup(false)
      navigate('/student-record')
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  const mutationEditStatusStudent = useMutation({
    mutationFn: (params: Partial<TypeEditStatusStudentParams>) =>
      editStatusStudent(params),
    onSuccess: async () => {
      await reInvalidateQueries()
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  const handleConfirm = () => {
    if (userAliasId && currentSchoolId) {
      const params: TypeDeleteStudentParams = {
        institutionId: Number(currentSchoolId),
        siteId: currentSiteId,
        userAliasIds: [userAliasId],
      }
      mutationDeleteStudent.mutate(params)
    }
  }

  const handleConfirmDeactiveStudent = () => {
    if (currentSchoolId && userId) {
      const params: TypeEditStatusStudentParams = {
        institutionId: currentSchoolId,
        siteId: currentSiteId,
        userId: Number(userId),
        status:
          studentInfo.user?.status === StudentStatus.INACTIVE
            ? StudentStatus.ACTIVE
            : StudentStatus.INACTIVE,
      }
      mutationEditStatusStudent.mutate(params)
    }
  }

  const handleEditStudent = () => {
    navigate(`/student-record/${studentInfo.id}?userId=${studentInfo.userId}`)
  }
  const renderMenuItem = ({
    icon,
    title,
    funcHandleEvent,
    disabled,
    status,
    dataTestId,
  }: {
    icon: JSX.Element
    title: string
    funcHandleEvent: () => void
    disabled?: boolean
    status?: 'comingSoon' | 'hasPermission'
    dataTestId?: string
  }): DropDownMenuItemType => {
    const getStatusText = (status?: string) => {
      switch (status) {
        case 'comingSoon':
          return t('common:description.comingSoon')
        case 'hasPermission':
          return t('common:description.hasPermission')
        default:
          return ''
      }
    }
    const statusText = getStatusText(status)
    return {
      type: 'item',
      disabled: !!disabled,
      content: (
        <>
          <div className="flex items-center gap-1 mr-2">{icon}</div>
          {disabled ? (
            <>
              <ComingSoonText>{statusText}</ComingSoonText>
              <Text>{title}</Text>
            </>
          ) : (
            <Text>{title}</Text>
          )}
        </>
      ),
      dataTestId,
      onClick: () => funcHandleEvent(),
    }
  }

  const menuRowItems = (): DropDownMenuItemType[] => {
    const menus: DropDownMenuItemType[] = [
      {
        ...renderMenuItem({
          icon: <LuEye size={20} />,
          title: t('student:menu:view'),
          funcHandleEvent: handleEditStudent,
          dataTestId: generateDataTestId('view-student', studentInfo.name),
        }),
      },
      {
        ...renderMenuItem({
          icon: <LuMerge size={20} />,
          title: t('student:menu.merge'),
          funcHandleEvent: () => {
            mergeStudentModalHandle.current?.handleOpenChange?.()
          },
        }),
      },
      {
        type: 'separator',
      },
      {
        ...renderMenuItem({
          icon: <LuLink size={20} />,
          title: t('student:menu:addTeachingService'),
          funcHandleEvent: () => {
            navigate(`?student=${userId}`)
            setStudentData(prev => ({
              ...prev,
              tableDrawers: {
                ...prev.tableDrawers,
                isOpenAssignCourse: true,
                assignCourseMode: AddTeachingServiceMode.generateCourseLink,
              },
              currentStudent: {
                id: studentInfo.id,
                fullName: studentInfo.name,
                phone: studentInfo.phone,
                email: studentInfo.user?.email || studentInfo.email,
              } as StudentUser,
            }))
          },
        }),
      },

      {
        ...renderMenuItem({
          icon: <IoBookOutline size={20} />,
          title: t('student:menu:assignInvoiceDirectly'),
          funcHandleEvent: () => {
            if (studentInfo.id) {
              navigate(`/invoice-templates/editor?studentIds=${studentInfo.id}`)
            }
          },
        }),
      },

      {
        ...renderMenuItem({
          icon: <LuMessageSquare size={20} />,
          title: t('student:menu:addRemark'),
          funcHandleEvent: () => {
            editRemarksModalHandle.current?.open(
              studentInfo.id,
              studentInfo.remarks ?? null
            )
          },
        }),
      },

      ...(!childOfUserAliasId && showCreditSystem
        ? [
            {
              ...renderMenuItem({
                icon: <LuCreditCard className="text-xl" />,
                title: t('student:credit.title'),
                funcHandleEvent: () => {
                  creditBalanceModalHandle.current?.handleOpenChange?.()
                },
              }),
            },
          ]
        : []),
      ...(!isStudentParent && !childOfUserAliasId
        ? [
            {
              ...renderMenuItem({
                icon: <LuUserCheck className="text-xl" />,
                title: t('student:menu.setAsParentAccount'),
                funcHandleEvent: () => {
                  setAsParentAccountModalHandle.current?.handleOpenChange?.()
                },
              }),
            },
            {
              ...renderMenuItem({
                icon: <LuUserPlus className="text-xl" />,
                title: t('student:menu.addToParentGroup'),
                funcHandleEvent: () => {
                  addToParentGroupModalHandle.current?.handleOpenChange?.()
                },
              }),
            },
          ]
        : []),
      ...(!isStudentParent && childOfUserAliasId
        ? [
            {
              ...renderMenuItem({
                icon: <AiOutlineUserSwitch className="text-xl" />,
                title: t('student:menu.changeToNewFamilyGroup'),
                funcHandleEvent: () => {
                  changeToNewFamilyGroupModalHandle.current?.handleOpenChange?.()
                },
              }),
            },
          ]
        : []),
      ...(isStudentParent || childOfUserAliasId
        ? [
            {
              ...renderMenuItem({
                icon: <LuUserMinus className="text-xl" />,
                title: t('student:menu.removeFromCurrentGroup'),
                funcHandleEvent: () => {
                  removeFromCurrentGroupModalHandle.current?.handleOpenChange?.(
                    { isDeleted: false }
                  )
                },
              }),
            },
          ]
        : []),

      {
        ...renderMenuItem({
          icon: <DeleteIcon fill="#F87575" />,
          title: t('student:menu:delete'),
          funcHandleEvent: () => {
            if (childOfUserAliasId) {
              removeFromCurrentGroupModalHandle.current?.handleOpenChange?.({
                isDeleted: true,
              })
            } else {
              setShowConfirmPopup(true)
            }
          },
          disabled: !hasPermission || isStudentParent,
          status: 'hasPermission',
        }),
      },
    ]
    return menus
  }

  const menuRowItemsBinTab: DropDownMenuItemType[] = [
    {
      type: 'item',
      disabled: false,
      content: (
        <>
          <SvgIcon css={{ marginRight: '1rem' }}>
            <ViewIcon />
          </SvgIcon>
          <Text>{t('student:menu:view')}</Text>
        </>
      ),
      onClick: () => handleEditStudent(),
    },
  ]

  return (
    <Box>
      <Box onClick={e => e.stopPropagation()}>
        <DropdownMenu
          menuItems={isBinTab ? menuRowItemsBinTab : menuRowItems()}
          contentProps={{ minWidth: '16rem', zIndex: 999 }}
          dataTestId={generateDataTestId('action-button', studentInfo.name)}
        />
      </Box>

      <CustomedAlertDialog
        open={showConfirmPopup}
        setOpen={setShowConfirmPopup}
        description={t('student:dialog:descriptionAlertDialog')}
        title={`${t('student:dialog:titleAlertDialog')}`}
        alertType={AlertTypes.WARN}
        cancelText={t('common:action.cancel') as string}
        actionText={t('common:action.confirm') as string}
        onActionClick={handleConfirm}
        loading={mutationDeleteStudent.isLoading}
      />

      <CustomedAlertDialog
        open={showConfirmInactivePopup}
        setOpen={setShowConfirmInactivePopup}
        description={t('student:dialog:descriptionInactiveDialog')}
        title={
          isActiveStudent
            ? t('student:dialog:titleInactiveDialog')
            : t('student:dialog:titleActiveDialog')
        }
        alertType={AlertTypes.WARN}
        cancelText={t('common:action.cancel') as string}
        actionText={t('common:action.confirm') as string}
        onActionClick={handleConfirmDeactiveStudent}
        loading={mutationEditStatusStudent.isLoading}
      />

      <EditRemarksModal ref={editRemarksModalHandle} />
      <CreditBalanceModal
        ref={creditBalanceModalHandle}
        userAliasId={userAliasId}
      />
      <AddToParentGroupModal
        ref={addToParentGroupModalHandle}
        userAliasId={userAliasId}
        refetch={refetchAllStudents}
      />
      <SetAsParentAccountModal
        ref={setAsParentAccountModalHandle}
        userAliasId={userAliasId}
        refetch={refetchAllStudents}
      />
      <ChangeToNewFamilyGroupModal
        ref={changeToNewFamilyGroupModalHandle}
        userAliasId={userAliasId}
        refetchAllStudents={refetchAllStudents}
      />
      <RemoveFromCurrentGroupModal
        ref={removeFromCurrentGroupModalHandle}
        userAliasId={userAliasId}
        refetch={refetchAllStudents}
      />
      <MergeStudentModal
        ref={mergeStudentModalHandle}
        userAliasId={userAliasId}
        studentName={studentInfo.name}
        refetch={refetchAllStudents}
      />
      {/* <AddOrDeductCreditModal
        ref={addCreditModalHandle}
        userAliasId={userAliasId}
        transactionType={CreditTransactionType.ADDED}
        refetchAllStudents={refetchAllStudents}
      />
      <AddOrDeductCreditModal
        ref={deductCreditModalHandle}
        userAliasId={userAliasId}
        transactionType={CreditTransactionType.DEDUCTED}
        refetchAllStudents={refetchAllStudents}
      /> */}
    </Box>
  )
}
const ComingSoonText = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Text>) => (
  <Text
    className="absolute right-2 p-1 rounded-md text-text bg-tertiary z-[999] text-[8px]"
    {...props}
  >
    {children}
  </Text>
)
export default ActionButton
