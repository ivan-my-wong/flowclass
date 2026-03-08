/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ChangeEvent,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'

import { Title } from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { BiEditAlt } from 'react-icons/bi'
import Select from 'react-select'
import { useRecoilValue } from 'recoil'

import { GtmEvent, setGtmEvent } from '@/api/external/gtmEvent'
import Box from '@/components/Containers/Box'
import { TextInput } from '@/components/Inputs/TextInput'
import Modal from '@/components/Popups/Modal'
import PriceOptionsManager from '@/components/PriceOption/PriceOptionsManager'
import { selectCustomStyles } from '@/components/Selector/TextSearchMultiSelector'
import Separator from '@/components/Separators/Separator'
import Text from '@/components/Texts/Text'
import Switch from '@/components/Toggle/Switch'
import { Button } from '@/components/ui/Button'
import Form, {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/Form'
import { defaultRepeatFormat } from '@/constants/course'
import useClassData from '@/hooks/useClassData'
import useSiteData from '@/hooks/useSiteData'
import { courseState } from '@/stores/courseData'
import { defaultAppointment } from '@/types/appointment'
import { Classes } from '@/types/classes'
import { ClassTypeEnum, PriceType } from '@/types/course'
import { defaultRegularPeriod } from '@/utils/convert-class.utils'
import { getCurrencySymbol } from '@/utils/currency'
import { generateDefaultPriceOptionName } from '@/utils/price-option-name-generator'
import { validateCourseLowestPrice } from '@/utils/validate'

type AddClassModalProps = {
  hidden?: boolean
  classType: ClassTypeEnum
  onCreateClassSuccess?: (classes: Classes) => void
}

export type AddClassModalHandle = {
  handleOpenChange: () => void
}

interface PriceOption {
  id: string
  name: string
  amount: number
  numberOfLessons: number
  isFreeOfCharge?: boolean
}

interface CreateClassFormData {
  name: string
  tuition: number
  quota: number
  times?: number
  priceType: PriceType
  priceOptions: PriceOption[]
  isFree: boolean
}

const AddClassModal = forwardRef<AddClassModalHandle, AddClassModalProps>(
  ({ hidden, classType, onCreateClassSuccess }, ref) => {
    const form = useForm<CreateClassFormData>({
      defaultValues: {
        name: '',
        tuition: 0,
        quota: 10,
        times: 1,
        priceType: PriceType.PER_LESSON,
        priceOptions: [],
        isFree: false,
      },
    })

    const {
      register,
      handleSubmit,
      formState: { errors },
      trigger,
      watch,
    } = form
    const { useCreateClass } = useClassData()
    const { mutateAsync, isLoading } = useCreateClass(data => {
      onCreateClassSuccess?.(data)
      setIsOpen(false)
    })
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const { currentCourse } = useRecoilValue(courseState)
    const { t } = useTranslation(['teachingService'])
    const { siteData } = useSiteData()
    const { currency } = siteData.currentSite!

    const priceType = watch('priceType')
    const isFree = watch('isFree')
    const times = watch('times')

    const showTuitionField = priceType !== PriceType.MULTIPLE_OPTIONS
    const showPriceOptions =
      (classType === ClassTypeEnum.recurring ||
        classType === ClassTypeEnum.appointment) &&
      priceType === PriceType.MULTIPLE_OPTIONS

    const handleOpenChange = () => {
      setIsOpen(!isOpen)
    }

    useImperativeHandle(ref, () => ({
      handleOpenChange,
    }))

    const priceTypeOptions = useMemo(() => {
      const baseOptions = [
        {
          label: t('teachingService:feeNTime.tuitionPerClass'),
          value: PriceType.PER_CLASS,
        },
        {
          label: t('teachingService:feeNTime.tuitionPerLesson'),
          value: PriceType.PER_LESSON,
        },
      ]

      if (
        classType === ClassTypeEnum.recurring ||
        classType === ClassTypeEnum.appointment
      ) {
        baseOptions.push({
          label: t('teachingService:feeNTime.multiplePriceOption'),
          value: PriceType.MULTIPLE_OPTIONS,
        })
      }

      return baseOptions
    }, [classType, t])

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
      const { id, value } = event.target
      trigger('tuition')

      if (id === 'times') {
        form.setValue('times', parseInt(value, 10))
      }
    }

    const recurringFormat = useMemo(() => {
      if (
        [
          ClassTypeEnum.recurring,
          ClassTypeEnum.subscription,
          ClassTypeEnum.appointment,
        ].includes(classType)
      ) {
        return {
          ...defaultRepeatFormat,
          times: times ?? 1,
        }
      }
      return undefined
    }, [classType, times])

    const onSubmit = (data: CreateClassFormData) => {
      let finalPriceOptions: any[]
      const { priceOptions } = data
      if (
        priceType === PriceType.MULTIPLE_OPTIONS &&
        priceOptions.length === 0
      ) {
        form.setError('priceOptions', {
          type: 'required',
          message: t('teachingService:errors.priceOptionRequired') as string,
        })
        return
      }
      if (
        priceType === PriceType.MULTIPLE_OPTIONS &&
        priceOptions?.length > 0
      ) {
        let hasError = false

        priceOptions.forEach((option, index) => {
          if (
            !option.isFreeOfCharge &&
            (option.amount === null || option.amount === undefined)
          ) {
            form.setError(`priceOptions.${index}.amount`, {
              type: 'required',
              message: t('teachingService:errors.priceRequired') as string,
            })
            hasError = true
          }
        })

        if (hasError) {
          return
        }
        finalPriceOptions = priceOptions.map(option => ({
          priceType,
          amount: Number(option.amount),
          numberOfLessons: Number(option.numberOfLessons),
          isFreeOfCharge: option.isFreeOfCharge,
          name:
            option.name ||
            generateDefaultPriceOptionName(
              t,
              option.numberOfLessons,
              option.amount,
              currency
            ),
        }))
      } else {
        const numberOfLessons = times ?? 1
        finalPriceOptions = [
          {
            priceType,
            amount: isFree ? 0 : Number(data.tuition),
            numberOfLessons,
            name: generateDefaultPriceOptionName(
              t,
              numberOfLessons,
              isFree ? 0 : Number(data.tuition),
              currency
            ),
          },
        ]
      }

      mutateAsync({
        priceType,
        name: data.name,
        quota: Number(data.quota),
        courseId: currentCourse!.id,
        priceOptions: finalPriceOptions,
        regularPeriods:
          classType === ClassTypeEnum.regular ||
          classType === ClassTypeEnum.workshop
            ? [defaultRegularPeriod(currentCourse!.id, 60)]
            : undefined,
        recurringFormat,
        appointment:
          classType === ClassTypeEnum.appointment
            ? defaultAppointment
            : undefined,
        type: classType,
        dropIn: false,
        teachingLanguage: 'en',
      })

      setGtmEvent({
        courseId: currentCourse?.id ?? undefined,
        event: GtmEvent.createClass,
      })
    }

    return (
      <Modal
        open={isOpen}
        onOpenChange={handleOpenChange}
        trigger={
          <Box
            css={{
              cursor: 'pointer',
              width: 'fit-content',
              display: `${hidden ? 'none' : ''}`,
            }}
          >
            <BiEditAlt />
          </Box>
        }
      >
        <Form {...form}>
          <Box
            direction="column"
            justify="flex-start"
            align="flex-start"
            gap="large"
          >
            <Title className="font-bold">{`${t('common:action.create')} ${t(
              `teachingService:courseType.${classType}`
            )}`}</Title>
            <Separator />
            <TextInput
              id="name"
              label={t('teachingService:class.name')}
              isError={!!errors.name}
              helperText={errors.name?.message as string}
              {...register('name', {
                required: t('login:errors.required') as string,
              })}
            />

            {showTuitionField && (
              <div className="box-row-full justify-start">
                <Text
                  noWrap
                  bold
                  css={{
                    width: '30%',
                    marginRight: '$2',
                    flexShrink: 0,
                  }}
                >
                  {t(`teachingService:feeNTime.freeLesson`)}
                </Text>
                <FormField
                  name="isFree"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={checked => {
                            field.onChange(checked)
                            if (checked) {
                              form.setValue('tuition', 0)
                            } else {
                              form.resetField('tuition')
                            }
                          }}
                          className="justify-start"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            <Box justify="flex-start" css={{ width: '100%' }}>
              <Text className="w-[30%] mr-0 text-sm flex-shrink-0" noWrap bold>
                {t(`teachingService:class.priceForClass`)}
              </Text>
              <FormField
                name="priceType"
                control={form.control}
                render={({ field }) => (
                  <Box css={{ flex: 1 }}>
                    <Select
                      value={priceTypeOptions.find(
                        option => option.value === field.value
                      )}
                      options={priceTypeOptions}
                      styles={selectCustomStyles('100%')}
                      onChange={(selectedOption: any) => {
                        field.onChange(selectedOption.value)
                      }}
                      placeholder={t('teachingService:class.selectPriceType')}
                    />
                  </Box>
                )}
              />
            </Box>

            {showTuitionField && !isFree && (
              <>
                <TextInput
                  id="tuition"
                  type="number"
                  min={0}
                  label={`${t(
                    'teachingService:class.tuition'
                  )} ${getCurrencySymbol(currency)}`}
                  isError={!!errors.tuition}
                  helperText={errors.tuition?.message as string}
                  {...register('tuition', {
                    valueAsNumber: true,
                    required: t('login:errors.required') as string,
                    onChange: handleChange,
                    validate: async (val: number) => {
                      if (val < 0) {
                        return t('embed:configuration.negative') as string
                      }
                      if (isFree) return true
                      const priceValidation = await validateCourseLowestPrice(
                        val,
                        currency
                      )
                      if (!priceValidation) {
                        return t('teachingService:feeNTime.tooLow') as string
                      }
                      return undefined
                    },
                  })}
                />
                <Text css={{ marginTop: '-$3' }}>
                  {t('teachingService:class.showCurrency')}{' '}
                  <span style={{ fontWeight: 700 }}>{currency}. </span>
                  <a href="/contact?tab=regionLanguage">
                    {t('teachingService:class.changeCurrency')}
                  </a>
                </Text>
              </>
            )}

            {showPriceOptions && (
              <Box direction="column" css={{ width: '100%' }}>
                <FormField
                  name="priceOptions"
                  control={form.control}
                  render={() => (
                    <FormItem className="w-full">
                      <FormLabel>
                        {t('teachingService:class.priceOptions')}
                      </FormLabel>
                      <FormControl>
                        <PriceOptionsManager
                          currency={currency}
                          form={form}
                          fieldName="priceOptions"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </Box>
            )}

            <TextInput
              id="quota"
              type="number"
              min="0"
              label={t('teachingService:class.quota')}
              isError={!!errors.quota}
              helperText={errors.quota?.message as string}
              {...register('quota', {
                required: t('login:errors.required') as string,
              })}
            />

            {[ClassTypeEnum.recurring, ClassTypeEnum.appointment].includes(
              classType
            ) &&
              priceType !== PriceType.MULTIPLE_OPTIONS && (
                <TextInput
                  id="times"
                  type="number"
                  min="1"
                  label={t('teachingService:class.numOfLessons')}
                  isError={!!errors.times}
                  helperText={errors.times?.message as string}
                  {...register('times', {
                    required: t('login:errors.required') as string,
                    onChange: handleChange,
                  })}
                />
              )}

            <Button
              size="md"
              className="ml-auto"
              disabled={isLoading}
              onClick={handleSubmit(onSubmit)}
              data-testid="confirm-class-btn"
              loading={isLoading}
            >
              {t(`teachingService:class.confirm`)}
            </Button>
          </Box>
        </Form>
      </Modal>
    )
  }
)

export default AddClassModal
