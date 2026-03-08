import { useMemo, useRef, useState } from 'react'

import {
  ColDef,
  ICellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import QuickFilterTable from '@/components/Tables/QuickFilterTable'
import Heading from '@/components/Texts/Heading'
import { Button } from '@/components/ui/Button'
import useDynamicHeight from '@/hooks/useDynamicHeight'
import useInstructors from '@/hooks/useInstructors'
import useSchoolData from '@/hooks/useSchoolData'
import useUsersManagement from '@/hooks/useUsersManagement'
import ContentLayout from '@/layouts/ContentLayout'
import ProtectedComponent from '@/routes/ProtectedComponent'
import { UserRole } from '@/stores/userPermissionData'
import { SinglePermission, StaffUserType } from '@/types/user'
import { formatPhoneNumber, getRowId } from '@/utils/misc'

import PermissionBadges from './components/PermissionBadges'
import { UserManagementActionButton } from './components/UserManagementActionButton'
import ManageHourlyRatesModal from './views/ManageHourlyRatesModal'
import ProfileModal from './views/ProfileModal'
import InviteUserDrawer from './InviteUserDrawer'

export default function UserManagement(): JSX.Element {
  const { t } = useTranslation()
  const [isOpenInviteUserDrawer, setIsOpenInviteUserDrawer] = useState(false)
  const dynamicHeight = useDynamicHeight()
  const gridRef = useRef<AgGridReact<StaffUserType>>(null)
  const { useGetInstructors } = useInstructors()
  const { data: userList, isLoading: isLoadingUserList } = useGetInstructors()

  const { currentSchool } = useSchoolData()

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isHourlyRatesModalOpen, setIsHourlyRatesModalOpen] = useState(false)
  const [selectedUserRole, setSelectedUserRole] =
    useState<StaffUserType | null>(null)

  const userAccessTable = useMemo<ColDef<StaffUserType>[]>(
    () => [
      {
        field: 'id',
        filter: false,
        sortable: false,
        maxWidth: 100,
        headerName: t('setting:userManagement.action') as string,
        cellRenderer: ({
          data,
        }: ICellRendererParams<StaffUserType, string>) => {
          if (!data) return null
          return (
            <UserManagementActionButton
              userRoleData={data}
              setIsProfileModalOpen={setIsProfileModalOpen}
              setSelectedUserRole={setSelectedUserRole}
              setIsHourlyRatesModalOpen={setIsHourlyRatesModalOpen}
            />
          )
        },
      },

      {
        field: 'id', // Using id as field but showing permissions
        sortable: false,
        filter: false,
        cellClass: 'flex justify-start items-center flex-wrap gap-2',
        headerName: t('setting:userManagement.userRole') as string,
        cellRenderer: ({
          data,
        }: ICellRendererParams<StaffUserType, number>) => {
          if (!data || data.institutionId !== currentSchool?.id) return <></>

          // Convert the role flags back to a SinglePermission object for display
          const permission: SinglePermission = {
            userId: data.userId,
            institutionId: data.institutionId,
            isInstitutionManager: data.isInstitutionManager,
            isInstructor: data.isInstructor,
            isMasterAdmin: data.isMasterAdmin,
            isOperator: data.isOperator,
            isSiteManager: data.isSiteManager,
            isStudent: data.isStudent,
            siteId: data.siteId,
          }

          return (
            <PermissionBadges permissions={[permission]} type="horizontal" />
          )
        },
      },
      {
        field: 'user.firstName',
        filter: true,
        headerName: t('setting:userManagement.name') as string,
        valueGetter: ({ data }) => {
          return `${data?.user?.firstName ?? ''} ${data?.user?.lastName ?? ''}`
        },
      },

      {
        field: 'user.email',
        filter: true,
        headerName: t('setting:userManagement.email') as string,
        valueGetter: ({ data }) => {
          return data?.user?.email ?? ''
        },
      },
      {
        field: 'user.phone',
        filter: true,
        headerName: t('setting:userManagement.phone') as string,
        valueGetter: ({ data }) => {
          const phone = data?.user?.phone
          return phone ? formatPhoneNumber(phone) : ''
        },
      },
      {
        field: 'instructorProfile.instructorRates',
        filter: false,
        headerName: t(
          'setting:userManagement.hourlyRates.instructorRates'
        ) as string,
        cellRenderer: ({
          data,
        }: ICellRendererParams<StaffUserType, string>) => {
          return (
            <div>
              {data?.instructorProfile?.instructorRates?.find(
                rate => rate.isDefaultRate
              )?.hourlyRate ?? 'N/A'}
            </div>
          )
        },
      },

      {
        field: 'user.lastActiveTime',
        filter: true,
        headerName: t('setting:userManagement.lastActiveTime') as string,
        valueGetter: ({ data }) => {
          const lastActiveTime = data?.user?.lastActiveTime
          return lastActiveTime ? dayjs(lastActiveTime).fromNow() : ''
        },
      },
    ],
    [t]
  )

  const RightHeaderContent = () => {
    return (
      <ProtectedComponent roleAllowed={[UserRole.SiteAdmin]}>
        <Button
          variant="default"
          onClick={() => {
            setIsOpenInviteUserDrawer(true)
          }}
          aria-label={t(`setting:userManagement.inviteNewUser`).toString()}
          data-testid="invite-new-user"
        >
          {t(`setting:userManagement.inviteNewUser`)}
        </Button>
      </ProtectedComponent>
    )
  }
  const rowsData = useMemo(() => {
    return userList || []
  }, [userList])

  return (
    <ContentLayout
      leftHeader={<Heading>{t('setting:userManagement.title')}</Heading>}
      rightHeader={<RightHeaderContent />}
    >
      <div className="box-col p-4">
        <QuickFilterTable
          getRowId={row => getRowId('id', row)}
          hasCheckboxSelection={false}
          isLoading={isLoadingUserList}
          rowData={rowsData}
          height={dynamicHeight}
          gridRef={gridRef}
          useUrlSearch
          columns={userAccessTable}
          showFilterBox={false}
        />
      </div>

      <InviteUserDrawer
        open={isOpenInviteUserDrawer}
        onClose={() => {
          setIsOpenInviteUserDrawer(false)
        }}
      />

      <ProfileModal
        open={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false)
          setSelectedUserRole(null)
        }}
        selectedUserRole={selectedUserRole}
      />

      <ManageHourlyRatesModal
        open={isHourlyRatesModalOpen}
        onClose={() => {
          setIsHourlyRatesModalOpen(false)
          setSelectedUserRole(null)
        }}
        selectedUserRole={selectedUserRole}
      />
    </ContentLayout>
  )
}
