import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import TabWithListAndButton, {
  TabData,
  TabWithListAndButtonHandle,
} from '@/components/TabWithListAndButton/TabWithListAndButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'
import useAvailability from '@/hooks/useAvailability'
import ContentLayout from '@/layouts/ContentLayout'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { userPermissionState, UserRole } from '@/stores/userPermissionData'
import { Availability, AvailabilityMenu } from '@/types/availability.type'

import { ApplyToClassHandle } from './components/ApplyToClass'
import DateOverride from './components/DateOverride'
import WeekdayList from './components/WeekdayList'

const AvailabilityPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  const tabWithListAndButtonHandle = useRef<TabWithListAndButtonHandle>(null)

  const availabilityTabsData: TabData[] = [
    {
      label: t('availability:tabBar.workingHours'),
      value: AvailabilityMenu.WORKING_HOURS,
    },
    {
      label: t(`availability:tabBar.dateOverride`),
      value: AvailabilityMenu.DATE_OVERRIDE,
    },
    // {
    //   label: t(`availability:tabBar.listClass`),
    //   value: AvailabilityMenu.LIST_CLASS,
    // },
  ]
  const applyToClassHandle = useRef<ApplyToClassHandle>(null)

  const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false)
  const [availabilityName, setAvailabilityName] = useState('')

  const [userPermission] = useRecoilState(userPermissionState)

  const form = useForm<Availability>()

  const { useFetchAvailabilitiesById, useUpdateAvailabilitySettings } =
    useAvailability()

  const updateAvailabilitySettings = useUpdateAvailabilitySettings(res => {
    if (res) {
      if (
        ![
          UserRole.MasterAdmin,
          UserRole.SiteAdmin,
          UserRole.SchoolAdmin,
        ].includes(userPermission) &&
        !res.appointments?.length
      ) {
        setShowConfirmPopup(true)
      }
      refetch()
    }
  })

  const { data: currentAvailability, refetch } = useFetchAvailabilitiesById(
    +(id ?? 0)
  )

  useEffect(() => {
    if (!currentAvailability) return
    setAvailabilityName(currentAvailability.name ?? '')
    form.reset(currentAvailability)
  }, [currentAvailability])

  const handleSaveSettings = async (data: Availability) => {
    try {
      await updateAvailabilitySettings.mutateAsync({
        ...data,
        name: availabilityName,
      })
    } catch (error) {
      toast.error(t('availability:errors.errorSavingSettings'))
    }
  }

  return (
    <ContentLayout
      leftHeader={
        <Input
          id="schedule-name"
          value={availabilityName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setAvailabilityName(e.target.value)
          }}
        />
      }
      headerBackButton={{
        title: t(`availability:title`),
        mode: 'add',
      }}
      rightHeader={
        <Button
          onClick={form.handleSubmit(handleSaveSettings)}
          loading={updateAvailabilitySettings.isLoading}
        >
          {t('common:action.save')}
        </Button>
      }
    >
      <TabWithListAndButton
        ref={tabWithListAndButtonHandle}
        tabData={availabilityTabsData}
      >
        <WeekdayList
          form={form}
          tabName={AvailabilityMenu.WORKING_HOURS}
          applyToClassHandle={applyToClassHandle}
          refetchAvailability={refetch}
        />
        <DateOverride
          form={form}
          formName="dateOverrides"
          tabName={AvailabilityMenu.DATE_OVERRIDE}
        />
        {/* <ListClass
          data={currentAvailability}
          tabName={AvailabilityMenu.LIST_CLASS}
        /> */}
      </TabWithListAndButton>

      <CustomedAlertDialog
        open={showConfirmPopup}
        setOpen={setShowConfirmPopup}
        description={t('availability:applyToClass.description')}
        title={t('availability:applyToClass.title')}
        alertType={AlertTypes.CONFIRM}
        cancelText={t('common:action.no') as string}
        actionText={t('common:action.yes') as string}
        onActionClick={() => {
          setShowConfirmPopup(false)
          applyToClassHandle.current?.handleOpenChange()
        }}
      />
    </ContentLayout>
  )
}

export default AvailabilityPage
