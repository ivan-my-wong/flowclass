import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import LoadingButton from '@/components/Buttons/LoadingButton'
import Drawer from '@/components/Drawer/Drawer'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import Heading from '@/components/Texts/Heading'
import Box from '@/components/ui/Box'
import Form from '@/components/ui/Form'
import { useLocationRoom } from '@/hooks/useRoomLocation'
import ContentLayout from '@/layouts/ContentLayout'
import { LocationRoomForm } from '@/types/classes'
import { createOption } from '@/utils/class-options.utils'

import FormLocation from './components/FormLocation'

const UpdateLocation = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState(true)
  const { locationRoomId } = useParams<{ locationRoomId: string }>()
  const { useUpdateLocationRoom, useFetchLocationRoom } = useLocationRoom()
  const handleCloseAndRemove = () => {
    setIsOpen(false)
  }
  const {
    mutateAsync: mutateUpdateLocationRoom,
    isLoading: isUpdatingLocationRoom,
  } = useUpdateLocationRoom(locationRoomId || '', handleCloseAndRemove)
  const { data: locationRoom } = useFetchLocationRoom(locationRoomId || '')
  const form = useForm<LocationRoomForm>({
    defaultValues: {
      name: '',
      capacity: 0,
      description: '',
      locationGroups: [],
      coordinate: null,
      equipment: [],
    },
  })
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (locationRoom) {
      form.reset({
        name: locationRoom.name,
        capacity: locationRoom.capacity,
        description: locationRoom.description,
        locationGroups: locationRoom.locationGroups.map(option =>
          createOption(option)
        ),
        coordinate: locationRoom.coordinate,
        equipment: locationRoom.equipment.map(option => createOption(option)),
        address: locationRoom.address,
      })
    }
  }, [locationRoom, form])

  const headerBackButton: HeaderBackButtonStatus = {
    mode: 'back',
    action: () => handleCloseAndRemove(),
  }

  const leftHeaderContent = (
    <Heading size="smallMedium">{t('location:form.updateLocation')}</Heading>
  )
  const updateLocationRoom: SubmitHandler<LocationRoomForm> = async data => {
    await mutateUpdateLocationRoom({
      name: data.name,
      capacity: data.capacity,
      description: data.description,
      locationGroups: data.locationGroups.map(option => option.value),
      coordinate: data.coordinate,
      equipment: data.equipment.map(option => option.value),
      address: data.address,
    })
  }
  const rightHeaderContent = (
    <Box>
      <LoadingButton
        data-testid="save-location-btn"
        isLoading={isUpdatingLocationRoom}
        onClick={form.handleSubmit(updateLocationRoom)}
      >
        {t('location:form.saveAction')}
      </LoadingButton>
    </Box>
  )
  useEffect(() => {
    if (!isOpen) {
      navigate('/locations')
    }
  }, [isOpen])
  return (
    <Drawer open={isOpen} onClose={handleCloseAndRemove}>
      <ContentLayout
        leftHeaderCSS="max-h-full"
        headerBackButton={headerBackButton}
        leftHeader={leftHeaderContent}
        rightHeader={rightHeaderContent}
      >
        <Form {...form}>
          <FormLocation />
        </Form>
      </ContentLayout>
    </Drawer>
  )
}

export default UpdateLocation
