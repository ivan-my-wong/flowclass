import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

import StudentIcon from '@/assets/svgs/promotion/StudentIcon'
import Box from '@/components/Containers/Box'
import ImageAspect from '@/components/Images/ImageAspect'
import { TextInput } from '@/components/Inputs/TextInput'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { Button } from '@/components/ui/Button'
import { Coupon, DiscountType } from '@/types/coupon'
import { formatPhoneNumber } from '@/utils/misc'
import { formatTs } from '@/utils/timeFormat'

import OptionStudentDialog, {
  mapStudentPropsToStudentOption,
  StudentOption,
} from './OptionDialogStudent'

type CouponInformationProps = {
  currentCoupon: Coupon
}
const CouponInformation = ({
  currentCoupon,
}: CouponInformationProps): JSX.Element => {
  const { t } = useTranslation()

  const [currentDiscountType] = useState(currentCoupon.discountType)
  const [isOpenCustomizeAmount] = useState<boolean>(true)
  const [isOpenCustomizeRedeemable] = useState<boolean>(true)
  const [isOpenCustomizeExpireTime] = useState<boolean>(true)
  const [isOpenSelectStudent, setIsOpenSelectStudent] = useState<boolean>(false)
  const [selectedStudents, setSelectedStudents] = useState<StudentOption[]>([])

  useEffect(() => {
    setSelectedStudents(
      currentCoupon.studentsAssigned.map(student =>
        mapStudentPropsToStudentOption(student)
      )
    )
  }, [currentCoupon.studentsAssigned])

  return (
    <Box
      direction="column"
      padding="large"
      justify="flex-start"
      align="flex-start"
      css={{
        width: '35%',

        '@sm': {
          width: '100% !important',
          padding: '$8',
        },
      }}
    >
      <Heading>{t('promotion:basicInfor')}</Heading>
      <form action="" style={{ width: '100%' }}>
        <TextInput
          id="code"
          type="text"
          value={currentCoupon.code}
          vertical
          disabled
          label={t('promotion:label.code')}
          css={{ width: '100%' }}
        />
        <Box
          direction="column"
          justify="flex-start"
          align="flex-start"
          css={{ margin: '$6 0' }}
        >
          <Box justify="space-between">
            <Text css={{ fontWeight: 'bold', width: '60%' }}>
              {t('promotion:discountAmount')}
            </Text>
            <Box
              css={{
                width: '50%',
                '@sm': {
                  width: '50%',
                },
              }}
              gap="none"
              justify="center"
              align="center"
            >
              {currentDiscountType === DiscountType.PERCENTAGE ? (
                <Box
                  css={{
                    color: '$primary',

                    height: '30px',
                    border: '2px solid $primary',
                    borderRadius: '$4',
                  }}
                  // onClick={() =>
                  //   setCurrentDiscountType(DiscountType.PERCENTAGE)
                  // }
                >
                  %
                </Box>
              ) : (
                <Box
                  css={{
                    color: '$primary',
                    border: '2px solid $primary',
                    height: '30px',
                    borderRadius: '$4',
                  }}
                  // onClick={() => setCurrentDiscountType('fixedAmount')}
                >
                  {t('promotion:fix')}
                </Box>
              )}
            </Box>
          </Box>
          <Box
            direction="column"
            css={{
              padding: '$3',
              background: isOpenCustomizeExpireTime
                ? '$backgroundLayer2'
                : '$white',
            }}
          >
            {/* <Tags
              items={
                currentDiscountType !== DiscountType.PERCENTAGE
                  ? AmountCoupons
                  : PercentageAmountCoupons
              }
              disable
              defaultValue={currentCoupon.amount}
              onActionCustomize={setIsOpenCustomizeAmount}
            /> */}
            {isOpenCustomizeAmount && (
              <TextInput
                disabled
                id="amount"
                type="text"
                vertical
                value={currentCoupon.amount}
                placeholder="Fill in number only, i.e. 500"
                css={{ width: '100%' }}
              />
            )}
          </Box>
        </Box>
        <Box
          direction="column"
          justify="flex-start"
          align="flex-start"
          css={{ margin: '$2 0' }}
        >
          <Text css={{ fontWeight: 'bold' }}>
            {t('promotion:detailTitle1')}
          </Text>
          <Box
            direction="column"
            css={{
              padding: '$3',
              background: isOpenCustomizeExpireTime
                ? '$backgroundLayer2'
                : '$white',
            }}
          >
            {/* <Tags
              items={expireTimeCoupons}
              disable
              condition="time"
              defaultValue={currentCoupon.expireDate.toString()}
              onActionCustomize={setIsOpenCustomizeExpireTime}
            /> */}
            {isOpenCustomizeExpireTime && (
              <TextInput
                id="expireDate"
                type="text"
                vertical
                disabled
                value={formatTs(
                  (currentCoupon?.expireDate ?? '').toString(),
                  'DD MMM YYYY | HH:mm'
                )}
                placeholder="Fill in number only, i.e. 500"
                css={{ width: '100%' }}
              />
            )}
          </Box>
        </Box>
        <Box
          direction="column"
          justify="flex-start"
          align="flex-start"
          css={{
            margin: '$4 0',
            paddingBottom: '$6',
            borderBottom: '1px solid $textDisabled',
          }}
        >
          <Text css={{ fontWeight: 'bold' }}>
            {t('promotion:detailTitle2')}
          </Text>
          <Box
            direction="column"
            css={{
              padding: '$3',
              background: isOpenCustomizeRedeemable
                ? '$backgroundLayer2'
                : '$white',
            }}
          >
            {/* <Tags
              items={redeemablCoupons}
              disable
              defaultValue={currentCoupon.quota}
              onActionCustomize={setIsOpenCustomizeRedeemable}
            /> */}
            {isOpenCustomizeRedeemable && (
              <TextInput
                id="redeemable"
                type="integer"
                value={currentCoupon.quota}
                vertical
                disabled
                placeholder="Fill in number only, i.e. 500"
                css={{ width: '100%', background: 'white' }}
              />
            )}
          </Box>
        </Box>
        <Box direction="column" align="flex-start">
          <Heading size="smallMedium">
            {t('promotion:advanceCondition')}
          </Heading>
          <Box
            // align="center"
            direction="column"
            justify="flex-start"
            align="flex-start"
            // width="100%"
            css={{
              width: '100%',
              padding: '$4',
              // height: '60px',
              background: '$backgroundLayer2',
            }}
          >
            {t('promotion:teachingServiceOption1')}
            {currentCoupon.courseAssigned.length > 0 &&
              currentCoupon.courseAssigned.map(course => {
                return (
                  <Box
                    key={course.id}
                    direction="column"
                    justify="flex-start"
                    align="flex-start"
                    css={{
                      borderTop: '1px solid $backgroundDisabled',
                      // margin: '$4 0',
                      padding: '$4 0',
                    }}
                  >
                    <Box
                      justify="flex-start"
                      align="flex-start"
                      // direction="column"
                    >
                      <ImageAspect
                        src={course.previewImageUrl || ''}
                        ratio={2 / 1}
                        width="42px"
                        alt={course.name}
                      />
                      {course.name}
                    </Box>
                    <Box
                      justify="flex-start"
                      align="flex-start"
                      direction="column"
                      css={{
                        paddingLeft: '$6',
                        marginLeft: '$2',
                        borderLeft: '1px solid $borderColor',
                      }}
                    >
                      {course.classes.map(institution => {
                        return (
                          <Text key={institution.id} css={{ paddingTop: '2' }}>
                            {institution.name}
                          </Text>
                        )
                      })}
                    </Box>
                  </Box>
                )
              })}
          </Box>
          <Box
            direction="column"
            justify="flex-start"
            align="flex-start"
            css={{
              width: '100%',
              // height: '60px',
              padding: '$4',
              background: '$backgroundLayer2',
            }}
          >
            <Box justify="space-between">
              <p>
                {currentCoupon.studentsAssigned.length > 0
                  ? t('promotion:studentOption2')
                  : t('promotion:studentOption1')}
              </p>
              <Button
                variant="link"
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  setIsOpenSelectStudent(prev => !prev)
                }}
              >
                {t('promotion:change')}
              </Button>
            </Box>
            <div className="box-col-full gap-2">
              {selectedStudents.length > 0 &&
                selectedStudents.map(el => {
                  return (
                    <Box key={el.value} justify="flex-start" align="center">
                      <StudentIcon />
                      {el.label}
                    </Box>
                  )
                })}
            </div>
            {selectedStudents.length ? (
              <Box
                justify="flex-start"
                align="center"
                css={{
                  padding: '$0 0',
                }}
              >
                <Text>{t('promotion:couponOption4')}</Text>
              </Box>
            ) : (
              <></>
            )}
          </Box>
          {/* <Box
            justify="flex-start"
            direction="column"
            align="flex-start"
            css={{
              width: '100%',
              padding: '$4',
              background: '$backgroundLayer2',
            }}
          >
            <Text>{t('promotion:couponOption2')}</Text>
          </Box>
          <Box
            justify="flex-start"
            align="flex-start"
            css={{
              width: '100%',
              padding: '$4',
              background: '$backgroundLayer2',
            }}
          >
            {t('promotion:couponOption3')}
          </Box> */}
        </Box>
      </form>
      {isOpenSelectStudent && (
        <OptionStudentDialog
          open={isOpenSelectStudent}
          setOpen={() => setIsOpenSelectStudent(!isOpenSelectStudent)}
          setFinalSelectedStudents={setSelectedStudents}
          isUpdateMode
          couponId={currentCoupon.id}
          existingStudents={currentCoupon.studentsAssigned}
        />
      )}
    </Box>
  )
}
export default CouponInformation
