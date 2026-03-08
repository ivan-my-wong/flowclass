import { ChangeEvent, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { MultiValue } from 'react-select'

import StudentIcon from '@/assets/svgs/promotion/StudentIcon'
import CustomDatePicker from '@/components/DatePickers/DatePicker'
import Drawer from '@/components/Drawer/Drawer'
import ImageAspect from '@/components/Images/ImageAspect'
import { TextInput } from '@/components/Inputs/TextInput'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import Switch from '@/components/Toggle/Switch'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import {
  AmountCoupons,
  expireTimeCoupons,
  PercentageAmountCoupons,
  redeemableCoupons,
} from '@/constants/coupon'
import usePromotionData from '@/hooks/usePromotionData'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import ContentLayout from '@/layouts/ContentLayout'
import { DiscountType } from '@/types/coupon'
import {
  CourseAndClassOptionProps,
  OptionProps,
} from '@/types/courseSelector.type'
import { cn } from '@/utils/cn'
import { randomCode } from '@/utils/string'
import {
  validateCouponCode,
  validateDiscountAmount,
  validateRedeemable,
} from '@/utils/validate'

import OptionCourseDialog from '../components/OptionDialogCourse'
import OptionStudentDialog, {
  StudentOption,
} from '../components/OptionDialogStudent'
// import { StudentSelectorItem } from '../components/StudentSelector'
import Tags from '../components/Tags'

interface Props {
  open: boolean
  handleClose: () => void
}

const DEFAULT_DISCOUNT_AMOUNT = PercentageAmountCoupons[1].value

const CreateCouponCode = ({ open, handleClose }: Props): JSX.Element => {
  const { t } = useTranslation()

  const [isOpenSelectCourse, setIsOpenSelectCourse] = useState<boolean>(false)
  const [isOpenSelectStudent, setIsOpenSelectStudent] = useState<boolean>(false)

  const { useCreateCoupon, useFetchCourseData } = usePromotionData()
  const createCoupon = useCreateCoupon()
  const { schoolData } = useSchoolData()
  const { data: listCourse = [] } = useFetchCourseData(!isOpenSelectCourse)

  const [searchParams] = useSearchParams()

  const idStudent = searchParams.get('userId') || searchParams.get('student')
  const name = searchParams.get('name') || ''
  const back = searchParams.get('back') || '/promotion/coupon-code'

  const currentInstitutionId = schoolData.currentSchool?.id || 0
  const { convertDateToCurrentTimeZoneUTCString } = useSiteData()

  const [currentDiscountType, setCurrentDiscountType] = useState(
    DiscountType.PERCENTAGE
  )

  const [redeemableTimes, setRedeemableTimes] = useState<number>(
    redeemableCoupons[0].value
  )
  const [discountAmount, setDiscountAmount] = useState<number>(
    DEFAULT_DISCOUNT_AMOUNT
  )

  const [isOpenCustomizeAmount, setIsOpenCustomizeAmount] =
    useState<boolean>(false)
  const [isOpenCustomizeRedeemable, setIsOpenCustomizeRedeemable] =
    useState<boolean>(false)
  const [isOpenCustomizeExpireTime, setIsOpenCustomizeExpireTime] =
    useState<boolean>(false)

  const [couponCode, setCouponCode] = useState<string>(randomCode(6))
  const [isValidCouponCode, setIsValidCouponCode] = useState<boolean>(true)
  const [isValidDiscount, setIsValidDiscount] = useState<boolean>(true)
  const [isValidRedeemable, setIsValidRedeemable] = useState<boolean>(true)
  const [expireDate, setExpireDate] = useState<string>(
    String(expireTimeCoupons[0].value)
  )
  const [isEmailNotifyOn, setIsEmailNotifyOn] = useState<boolean>(true)

  const [selectedOptionCourse, setSelectedOptionCourse] = useState<
    CourseAndClassOptionProps[]
  >([])
  const [selectedOptionClass, setSelectedOptionClass] = useState<
    MultiValue<OptionProps>
  >([])
  const [selectedOptionStudent, setSelectedOptionStudent] = useState<
    StudentOption[]
  >([])

  const navigate = useNavigate()

  useEffect(() => {
    if (!!idStudent && open) {
      setSelectedOptionStudent([
        {
          label: name,
          value: +idStudent,
        },
      ])
    }
  }, [idStudent, open])

  // const courseOptions = courseListToCourseOptions(courseList)
  const handleRedeemableTimesChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = event.target.value

    if (validateRedeemable(inputValue)) {
      setRedeemableTimes(+inputValue)
      setIsValidRedeemable(true)
    } else {
      setIsValidRedeemable(false)
    }
  }
  const handleRedeemTagChange = (value: number) => {
    setIsValidRedeemable(true)
    setRedeemableTimes(value)
  }

  const handleCouponCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (validateCouponCode(event.target.value)) {
      setIsValidCouponCode(true)
      setCouponCode(event.target.value)
    } else {
      setIsValidCouponCode(false)
    }
  }
  const handleDiscountTypeChange = (type: DiscountType) => {
    setCurrentDiscountType(type)
    setIsValidDiscount(true)
  }
  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value

    if (validateDiscountAmount(newValue)) {
      setDiscountAmount(+newValue)

      const floatValue = parseFloat(newValue)
      if (
        floatValue <= 0 ||
        (currentDiscountType === 'percentage' &&
          (floatValue <= 0 || floatValue > 100))
      ) {
        setIsValidDiscount(false)
      } else {
        setIsValidDiscount(true)
      }
    }
  }

  const handleExpireDateChange = (value: Date | null) => {
    if (!value) return
    const isoString = convertDateToCurrentTimeZoneUTCString(value)
    if (!isoString) return
    setExpireDate(isoString)
  }

  const createCouponCode = async () => {
    createCoupon
      .mutateAsync({
        userIds: selectedOptionStudent.map(student => +student.value) || [],
        courseIds: selectedOptionCourse?.map(course => +course.courseId) || [],
        classIds: selectedOptionClass?.map(course => +course.value) || [],
        code: couponCode,
        quota: +redeemableTimes,
        discountType: currentDiscountType,
        amount: discountAmount,
        institutionId: currentInstitutionId,
        expireDate: new Date(expireDate),
        emailNotifyOn: isEmailNotifyOn,
      })
      .then(() => {
        handleCloseAndRemove()
      })
  }
  const handleCloseAndRemove = () => {
    setSelectedOptionStudent([])
    setSelectedOptionCourse([])
    setSelectedOptionClass([])
    setCouponCode(randomCode(6))
    setExpireDate(expireTimeCoupons[0].value)
    setDiscountAmount(AmountCoupons[2].value)
    setCurrentDiscountType(DiscountType.FIXED_AMOUNT)
    // setRedeemableTimes(redeemablCoupons[0].value)
    navigate(back)
    handleClose()
  }
  const headerBackButton: HeaderBackButtonStatus = {
    mode: 'back',
    action: () => handleCloseAndRemove(),
  }
  const leftHeaderContent = (
    <Heading size="smallMedium">{t('promotion:titles.couponCode')}</Heading>
  )
  const rightHeaderContent = (
    <Box>
      <Button variant="destructive-outline" onClick={handleCloseAndRemove}>
        {t('promotion:cancel')}
      </Button>
      <Button
        data-testid="save-coupon-btn"
        onClick={createCouponCode}
        loading={createCoupon.isLoading}
        disabled={
          !couponCode ||
          !discountAmount ||
          !isValidCouponCode ||
          discountAmount <= 0 ||
          !isValidDiscount ||
          !isValidRedeemable
        }
      >
        {t('promotion:save')}
      </Button>
    </Box>
  )
  if (open) {
    return (
      <Drawer open={open} onClose={handleClose}>
        <ContentLayout
          leftHeaderCSS="max-h-full"
          headerBackButton={headerBackButton}
          leftHeader={leftHeaderContent}
          rightHeader={rightHeaderContent}
        >
          <Box direction="col" className="py-6" justify="start" align="start">
            <form action="" style={{ width: '100%' }}>
              {selectedOptionStudent.length > 0 && (
                <div className="flex w-full flex-row items-center justify-between mb-3">
                  <Text css={{ fontWeight: 'bold' }}>
                    {t('promotion:sendEmailNotifyStudent')}
                  </Text>
                  <div>
                    <Switch
                      className="w-fit"
                      checked={isEmailNotifyOn}
                      onCheckedChange={() =>
                        setIsEmailNotifyOn(!isEmailNotifyOn)
                      }
                    />
                  </div>
                </div>
              )}
              <TextInput
                id="code"
                type="text"
                vertical
                value={couponCode}
                label={t('promotion:label.code')}
                css={{ width: '100%' }}
                isError={!isValidCouponCode}
                onChange={handleCouponCodeChange}
              />
              <Box
                direction="col"
                justify="start"
                align="start"
                className="my-6"
              >
                <Box justify="between">
                  <Text css={{ fontWeight: 'bold', width: '60%' }}>
                    {t('promotion:discountAmount')}
                  </Text>
                  <Box
                    className="w-full md:w-1/2"
                    justify="center"
                    align="center"
                    gap="0"
                  >
                    <Box
                      className={cn(
                        'w-1/2 cursor-pointer h-[30px] rounded-tl-[20px] rounded-bl-[20px]',
                        currentDiscountType !== DiscountType.PERCENTAGE
                          ? 'text-primary border-2 border-primary'
                          : 'text-text border border-borderColor'
                      )}
                      onClick={() =>
                        handleDiscountTypeChange(DiscountType.FIXED_AMOUNT)
                      }
                      data-testid="fixed-amount-btn"
                    >
                      {t('promotion:fix')}
                    </Box>
                    <Box
                      className={cn(
                        'w-1/2 cursor-pointer h-[30px] rounded-tr-[20px] rounded-br-[20px]',
                        currentDiscountType === DiscountType.PERCENTAGE
                          ? 'text-primary border-2 border-primary'
                          : 'text-text border border-borderColor'
                      )}
                      onClick={() =>
                        handleDiscountTypeChange(DiscountType.PERCENTAGE)
                      }
                      data-testid="percentage-btn"
                    >
                      %
                    </Box>
                  </Box>
                </Box>
                <Box
                  direction="col"
                  className={cn(
                    isOpenCustomizeAmount ? 'bg-background-layer-2' : 'bg-white'
                  )}
                >
                  <Tags<number>
                    items={
                      currentDiscountType !== DiscountType.PERCENTAGE
                        ? AmountCoupons
                        : PercentageAmountCoupons
                    }
                    defaultValue={
                      currentDiscountType !== DiscountType.PERCENTAGE
                        ? AmountCoupons[1].value
                        : DEFAULT_DISCOUNT_AMOUNT
                    }
                    currentValue={discountAmount}
                    discountType={currentDiscountType}
                    onActionClick={value => setDiscountAmount(value)}
                    onActionCustomize={setIsOpenCustomizeAmount}
                  />
                  {isOpenCustomizeAmount && (
                    <TextInput
                      id="amount"
                      type="number"
                      vertical
                      placeholder={
                        t('promotion:createInputplaceholder') as string
                      }
                      css={{ width: '100%' }}
                      isError={!isValidDiscount}
                      onChange={handleAmountChange}
                    />
                  )}
                </Box>
              </Box>
              <Box
                direction="col"
                justify="start"
                align="start"
                className="my-2"
              >
                <Text css={{ fontWeight: 'bold' }}>
                  {t('promotion:detailTitle1')}
                </Text>
                <Box
                  direction="col"
                  className={cn(
                    'p-3',
                    isOpenCustomizeExpireTime
                      ? 'bg-background-layer-2'
                      : 'bg-white'
                  )}
                  justify="center"
                  align="center"
                >
                  <Tags<string>
                    items={expireTimeCoupons}
                    onActionClick={value => setExpireDate(value)}
                    onActionCustomize={setIsOpenCustomizeExpireTime}
                  />
                  <Box className="mt-2">
                    {isOpenCustomizeExpireTime && (
                      <CustomDatePicker
                        showTimeSelect
                        selectedDate={expireDate}
                        onChange={handleExpireDateChange}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
              <Box
                direction="col"
                justify="start"
                align="start"
                className="my-4 pb-6 border-b-text-disabled"
              >
                <Text css={{ fontWeight: 'bold' }}>
                  {t('promotion:detailTitle2')}
                </Text>
                <Box
                  direction="col"
                  className={cn(
                    'p-3',
                    isOpenCustomizeRedeemable
                      ? 'bg-background-layer-2'
                      : 'bg-white'
                  )}
                >
                  <Tags<number>
                    items={redeemableCoupons}
                    currentValue={redeemableTimes}
                    defaultValue={redeemableCoupons[0].value}
                    onActionClick={value => handleRedeemTagChange(value)}
                    onActionCustomize={setIsOpenCustomizeRedeemable}
                  />
                  {isOpenCustomizeRedeemable && (
                    <TextInput
                      id="redeemable"
                      min={1}
                      vertical
                      type="number"
                      placeholder={
                        t('promotion:createInputplaceholder') as string
                      }
                      css={{ width: '100%' }}
                      onChange={handleRedeemableTimesChange}
                    />
                  )}
                </Box>
              </Box>

              <div className="box-col-full gap-6 items-start">
                <Heading size="smallMedium">
                  {t('promotion:advanceCondition')}
                </Heading>
                <div className="w-full bg-background-layer-2">
                  <Box justify="between">
                    <p>{t('promotion:teachingServiceOption1')}</p>
                    <Button
                      variant="link"
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        setIsOpenSelectCourse(!isOpenSelectCourse)
                      }}
                    >
                      {t('promotion:change')}
                    </Button>
                  </Box>
                  {selectedOptionCourse &&
                    selectedOptionCourse?.length > 0 &&
                    selectedOptionCourse.map(course => {
                      return (
                        <Box
                          key={course.courseId}
                          direction="col"
                          justify="start"
                          align="start"
                          className="pt-4"
                        >
                          <Box
                            justify="start"
                            align="start"
                            // direction="column"
                          >
                            <ImageAspect
                              src={course.previewImageUrl || ''}
                              ratio={2 / 1}
                              width="42px"
                              alt={course.course}
                            />
                            {course.course}
                          </Box>
                          <Box
                            justify="start"
                            align="start"
                            direction="col"
                            className="pl-6 ml-2 border-l-border-primary"
                          >
                            {course.classes.map(institution => {
                              return (
                                <Text
                                  key={institution.id}
                                  css={{ paddingTop: '2' }}
                                >
                                  {institution.name}
                                </Text>
                              )
                            })}
                          </Box>
                        </Box>
                      )
                    })}
                </div>
                {isOpenSelectCourse && listCourse && (
                  <OptionCourseDialog
                    courses={listCourse}
                    open={isOpenSelectCourse}
                    setOpen={() => setIsOpenSelectCourse(!isOpenSelectCourse)}
                    actionSelectClassOption={setSelectedOptionClass}
                    actionSelectOption={setSelectedOptionCourse}
                  />
                )}

                <div className="w-full bg-background-layer-2">
                  <Box justify="between">
                    <p>
                      {selectedOptionStudent.length > 0
                        ? t('promotion:studentOption2')
                        : t('promotion:studentOption1')}
                    </p>
                    <Button
                      variant="link"
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        setIsOpenSelectStudent(!isOpenSelectStudent)
                      }}
                    >
                      {!isOpenSelectStudent
                        ? t('promotion:change')
                        : t('promotion:change')}
                    </Button>
                  </Box>
                  {selectedOptionStudent && (
                    <>
                      {selectedOptionStudent.map(el => {
                        return (
                          <Box
                            key={el.value}
                            justify="start"
                            align="center"
                            className="border-t-background-disabled py-4"
                          >
                            <StudentIcon />
                            {el.label}
                          </Box>
                        )
                      })}
                    </>
                  )}
                  {selectedOptionStudent && selectedOptionStudent.length ? (
                    <Box
                      justify="start"
                      align="center"
                      className="border-t-background-disabled py-4"
                    >
                      <Text>{t('promotion:couponOption4')}</Text>
                    </Box>
                  ) : (
                    <></>
                  )}
                </div>
                {isOpenSelectStudent && (
                  <OptionStudentDialog
                    open={isOpenSelectStudent}
                    setOpen={() => {
                      setIsOpenSelectStudent(prev => !prev)
                    }}
                    setFinalSelectedStudents={setSelectedOptionStudent}
                    existingStudents={[]} // Empty for create mode
                  />
                )}
                {/* <div>
                  <p>{t('promotion:couponOption1')}</p>
                </div>
                <div>
                  <p>{t('promotion:couponOption2')}</p>
                </div> */}
              </div>
            </form>
          </Box>
        </ContentLayout>
      </Drawer>
    )
  }
  return <></>
}

export default CreateCouponCode
