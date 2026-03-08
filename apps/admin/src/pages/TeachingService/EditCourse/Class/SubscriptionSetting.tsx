import { useEffect, useState } from 'react'

import { t } from 'i18next'
import { useForm, useFormContext } from 'react-hook-form'
import { LuCopy, LuExternalLink } from 'react-icons/lu'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import Link from '@/components/Texts/Link'
import Switch from '@/components/Toggle/Switch'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import Form, {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import Text from '@/components/ui/Text'
import { INCOMPLETE_FEATURE_FLAG } from '@/constants/featureFlags'
import useCourseData from '@/hooks/useCourseData'
import useSiteData from '@/hooks/useSiteData'
import { courseState } from '@/stores/courseData'
import { ClassesForm } from '@/types/classes'
import { convertToClassFormData } from '@/utils/convert-class.utils'
import { getCurrencySymbol } from '@/utils/currency'
import { validateCourseLowestPrice } from '@/utils/validate'

import MultipleApplicantSetting from './MultipleApplicantSetting'
import MultipleClassesSetting from './MultipleClassesSetting'

type SubscriptionSettingProps = {
  fieldIndex: number
}
const SubscriptionSetting = ({
  fieldIndex,
}: SubscriptionSettingProps): JSX.Element => {
  const form = useFormContext<{ classes: ClassesForm[] }>()
  const localForm = useForm<ClassesForm>({
    defaultValues: form.getValues(`classes.${fieldIndex}`),
  })

  const { courseEnrolUrl } = useCourseData()

  const { siteData } = useSiteData()
  const { currency } = siteData.currentSite!
  const [freeStates, setFreeStates] = useState<{ [key: number]: boolean }>({})
  const [courseRecoilState] = useRecoilState(courseState)

  const classId = localForm.getValues(`dataId`)
  const classEnrolUrl = `${courseEnrolUrl}&classId=${classId}`
  const tuition = localForm.watch(`tuition`)

  useEffect(() => {
    setFreeStates(prev => ({
      ...prev,
      [classId]: Number(tuition) === 0,
    }))
  }, [classId, tuition])

  // Ensure recurringFormat.repeat is always false (one-time only)
  useEffect(() => {
    localForm.setValue('recurringFormat.repeat', false)
  }, [localForm])

  useEffect(() => {
    const subscription = localForm.watch(values => {
      form.setValue(
        `classes.${fieldIndex}`,
        convertToClassFormData({ classData: values as ClassesForm }),
        {
          shouldDirty: true,
        }
      )
    })
    return () => subscription.unsubscribe()
  }, [localForm, form, fieldIndex])
  return (
    <Form {...localForm}>
      {/* Application Link Buttons - match BasicSetting style */}
      <div className="w-full flex md:flex-row flex-col gap-2 justify-end">
        <Button
          variant="primary-outline"
          iconAfter={<LuCopy />}
          onClick={() => {
            navigator.clipboard.writeText(classEnrolUrl)
            toast.success(t('teachingService:view.copySuccess'))
          }}
        >
          {t('teachingService:view.copyApplicationLink')}
        </Button>

        <Button
          onClick={() => {
            window.open(classEnrolUrl, '_blank')
          }}
          variant="primary-outline"
          iconAfter={<LuExternalLink />}
          disabled={!courseRecoilState?.currentCourse?.published}
        >
          {t('teachingService:view.viewApplicationLink')}
        </Button>
      </div>
      <Box direction="col" align="start" gap="lg">
        <FormField
          name="name"
          control={localForm.control}
          render={({ field }) => (
            <FormItem
              id="className"
              className="flex gap-x-4 w-full items-center leading-5"
            >
              <FormLabel className="w-[45%] font-bold">
                {t('teachingService:class.name')}
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div
          className="box-row-full justify-start"
          id="free-course-tuition-button"
        >
          <Text noWrap bold className="w-[30%] mr-2 flex-shrink-0 text-sm">
            {t(`teachingService:subscriptionSetting.freeSubscription`)}
          </Text>
          <FormField
            name="isFree"
            control={localForm.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Switch
                    data-testid="free-lesson-switch"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="!justify-end md:!justify-start"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        {!localForm.watch(`isFree`) && (
          <>
            <Box id="classTuition" align="start">
              <FormField
                name="tuition"
                control={localForm.control}
                rules={{
                  required: t('login:errors.required') as string,
                  validate: async (val: number) => {
                    if (val < 0) {
                      return t('embed:configuration.negative') as string
                    }
                    if (freeStates[classId ?? 0]) return true
                    const isPriceValid = await validateCourseLowestPrice(
                      val,
                      currency
                    )
                    if (!isPriceValid) {
                      return t('teachingService:feeNTime.tooLow') as string
                    }
                    return undefined
                  },
                }}
                render={({ field }) => (
                  <FormItem
                    id="tuition"
                    className="flex gap-x-4 w-full items-center leading-5"
                  >
                    <FormLabel className="w-[45%] font-bold">
                      {`${t(`common:fields.price`)} ${getCurrencySymbol(
                        currency
                      )}`}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>
            <Text className="-mt-3">
              {t('teachingService:class.showCurrency')}{' '}
              <span style={{ fontWeight: 700 }}>{currency}. </span>
              <Link href="/contact?tab=regionLanguage">
                {t('teachingService:class.changeCurrency')}
              </Link>
            </Text>
          </>
        )}
        <FormField
          name="quota"
          control={localForm.control}
          rules={{
            validate: (val: number) =>
              val > 0 || (t('embed:configuration.negative') as string),
          }}
          render={({ field }) => (
            <FormItem
              id="classQuota"
              className="flex gap-x-4 w-full items-center leading-5"
            >
              <FormLabel className="w-[45%] font-bold">
                {t('teachingService:class.quota')}
              </FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <MultipleClassesSetting />
        {INCOMPLETE_FEATURE_FLAG.ONE_APPLICATION_FOR_MULTIPLE_STUDENTS && (
          <MultipleApplicantSetting />
        )}
      </Box>
    </Form>
  )
}

export default SubscriptionSetting
