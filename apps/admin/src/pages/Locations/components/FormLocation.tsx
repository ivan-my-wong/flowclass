import { useMemo } from 'react'

import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import CreatableSelector from '@/components/Selector/CreatableSelector'
import Box from '@/components/ui/Box'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import Textarea from '@/components/ui/TextArea'
import { useLocationRoom } from '@/hooks/useRoomLocation'
import { LocationRoomForm } from '@/types/classes'
import { createOption } from '@/utils/class-options.utils'

const FormLocation = () => {
  const form = useFormContext<LocationRoomForm>()
  const { useFetchLocationGroupAndEquipment } = useLocationRoom()
  const {
    data: locationGroupAndEquipment,
    isLoading: isLoadingLocationGroupAndEquipment,
  } = useFetchLocationGroupAndEquipment()
  const { t } = useTranslation()

  const locationGroupOptions = useMemo(() => {
    return (locationGroupAndEquipment?.locationGroups || []).map(
      locationGroup => ({
        label: locationGroup,
        value: locationGroup,
      })
    )
  }, [locationGroupAndEquipment])
  const equipmentOptions = useMemo(() => {
    return (locationGroupAndEquipment?.equipment || []).map(equipment => ({
      label: equipment,
      value: equipment,
    }))
  }, [locationGroupAndEquipment])
  return (
    <Box direction="col" gap="lg" className="py-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel required>{t('location:form.name')}</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t('location:form.namePlaceholder').toString()}
                data-testid="location-room-name"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="locationGroups"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>{t('location:form.locationGroup')}</FormLabel>
            <FormControl>
              <CreatableSelector
                isMulti
                id="locationGroupContainer"
                inputId="locationGroupSelector"
                isLoading={isLoadingLocationGroupAndEquipment}
                onCreateOption={(inputValue: string) => {
                  field.onChange([...field.value, createOption(inputValue)])
                }}
                value={field.value}
                options={locationGroupOptions}
                placeholder={t('location:form.locationGroupPlaceholder')}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(newValue: any) => {
                  field.onChange(newValue)
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="capacity"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel required>{t('location:form.capacity')}</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                data-testid="location-room-capacity"
                placeholder={t('location:form.capacityPlaceholder').toString()}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="equipment"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>{t('location:form.equipment')}</FormLabel>
            <FormControl>
              <CreatableSelector
                isMulti
                isLoading={isLoadingLocationGroupAndEquipment}
                id="equipmentContainer"
                inputId="equipmentSelector"
                onCreateOption={(inputValue: string) => {
                  field.onChange([...field.value, createOption(inputValue)])
                }}
                value={field.value}
                options={equipmentOptions}
                placeholder={t('location:form.equipmentPlaceholder')}
                data-testid="location-room-equipment"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(newValue: any) => {
                  field.onChange(newValue)
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>{t('location:form.description')}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t(
                  'location:form.descriptionPlaceholder'
                ).toString()}
                data-testid="location-room-description"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* <FormField
        control={form.control}
        name="coordinate"
        render={({ field }) => (
          <FormItem className="w-full min-h-[340px] mb-8">
            <FormLabel>{t('location:form.locationOnMap')}</FormLabel>
            <FormField
              control={form.control}
              name="address"
              render={({ field: { value, onChange } }) => (
                <DraggableMarker
                  position={field.value}
                  setPosition={field.onChange}
                  setAddress={address => onChange(address || '')}
                  setCenter={setCenter}
                />
              )}
            />
            <FormControl>
              <LocationMap
                onCenterChange={field.onChange}
                position={field.value}
                setAddress={address => {
                  form.setValue('address', address || '', {
                    shouldDirty: true,
                    shouldTouch: true,
                  })
                }}
                address={form.watch('address')}
              />
            </FormControl>
          </FormItem>
        )}
      /> */}
    </Box>
  )
}

export default FormLocation
