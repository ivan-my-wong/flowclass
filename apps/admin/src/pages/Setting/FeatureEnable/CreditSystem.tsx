import { useEffect } from 'react'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import Switch from '@/components/Toggle/Switch'
import { Button } from '@/components/ui/Button'
import FormProvider, {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import useCredit from '@/hooks/useCredit'

type FormValues = {
  conversionRate: number
  isEnabled: boolean
}

const CreditSystem = () => {
  const { t } = useTranslation()

  const { useGetCreditSettings, useUpdateCreditSettings } = useCredit()

  const {
    data: creditSettings,
    refetch,
    isLoading: loadSettings,
  } = useGetCreditSettings()
  const { mutateAsync: handleUpdate, isLoading: loadUpdate } =
    useUpdateCreditSettings()

  const isLoading = loadSettings || loadUpdate

  const form = useForm<FormValues>({
    defaultValues: {
      conversionRate: 1,
      isEnabled: false,
    },
  })

  useEffect(() => {
    if (creditSettings) {
      form.setValue('conversionRate', creditSettings.conversionRate)
      form.setValue('isEnabled', creditSettings.isEnabled)
    }
  }, [creditSettings, form])

  const handleSubmit = async (data: FormValues) => {
    try {
      await handleUpdate(data)
      await refetch()
    } catch (error) {
      console.error('Failed to update credit settings:', error)
    }
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="w-full flex flex-col"
      >
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">
            {t('setting:creditSystem.creditManagement')}
          </div>
          <Button
            type="submit"
            className="w-fit self-end mb-2"
            disabled={isLoading}
            loading={isLoading}
          >
            {t('setting:creditSystem.updateSettings')}
          </Button>
        </div>
        <FormField
          control={form.control}
          name="isEnabled"
          render={({ field }) => (
            <FormItem className="w-full mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                <FormLabel>{t(`setting:creditSystem.title`)}</FormLabel>
                <Switch
                  checked={field.value}
                  className="justify-end"
                  onCheckedChange={field.onChange}
                />
              </div>
              <FormDescription>
                {t(
                  `setting:creditSystem.${
                    field.value ? 'descriptionEnable' : 'descriptionDisable'
                  }`
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="conversionRate"
          render={({ field }) => (
            <FormItem className="w-full mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                <FormLabel>
                  {t(`setting:creditSystem.conversionRatioForCredits`)}
                </FormLabel>
                <Input
                  type="number"
                  placeholder="1"
                  value={field.value}
                  onChange={e => field.onChange(Number(e.target.value))}
                  className="w-full"
                  min={0}
                  step={0.01}
                  disabled
                />
              </div>
              <FormDescription>
                {t(`setting:creditSystem.conversionRatioForCreditsDescription`)}
              </FormDescription>
              <FormDescription className="mt-2">
                For example: <br /> If 1 credit = $1.00, the conversion ratio is
                1:1. If 10 credits = $1.00, the conversion ratio is 10:1. If 1
                credit = $0.50, the conversion ratio is 1:0.5.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </FormProvider>
  )
}

export default CreditSystem
