import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import { GtmEvent, setGtmEvent } from '@/api/external/gtmEvent'
import flowclassLogo from '@/assets/logos/flowclass.png'
import DotSpinner1 from '@/assets/svgs/spinners/DotSpinner1'
import Box from '@/components/Containers/Box'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import ImageAspect from '@/components/Images/ImageAspect'
import SvgIcon from '@/components/Images/SvgIcon'
import Text from '@/components/Texts/Text'
import usePlanData from '@/hooks/useSubscriptionPlanData'
import ContentLayout from '@/layouts/ContentLayout'
import AddSchoolModal from '@/pages/School/CreateSchoolModal'
import { schoolState } from '@/stores/schoolData'
import { userState } from '@/stores/userData'

const ManageSubscription = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useRecoilValue(userState)
  const { currentSchool } = useRecoilValue(schoolState)

  const { useFetchSubscriptionDetail } = usePlanData()
  const { isLoading, isError, isIdle, isSuccess, data } =
    useFetchSubscriptionDetail()

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (isSuccess) {
      // stripe subscrpition type doesn't have plan field, don't know why
      // set any to avoid type error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { plan: planData } = data as any
      setGtmEvent({
        schoolId: currentSchool?.id,

        price: planData.amount,
        plan: planData.metadata.planType,
        email: user.email,
        event: GtmEvent.purchase,
      })

      const timer = setTimeout(() => {
        navigate('/subscription')
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isSuccess])

  const SubscriptionSuccessMessage = (): JSX.Element => {
    return (
      <Box
        direction="column"
        gap="large"
        css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100% !important',
          width: '100% !important',
        }}
      >
        <ImageAspect
          ratio={5.4 / 1}
          width="20%"
          src={flowclassLogo}
          alt="No students yet"
        />
        <Text css={{ whiteSpace: 'pre-line', textAlign: 'center' }}>
          {t(`subscription:subscriptionSuccessPage`)}
        </Text>
        <Text> {t(`subscription:redirecting`)}</Text>
        <SvgIcon>
          <DotSpinner1 />
        </SvgIcon>
      </Box>
    )
  }

  return (
    <ContentLayout>
      {isIdle && (
        <FullScreenAlertBox
          text={t(`teachingService:noSchool`)}
          content={<AddSchoolModal />}
        />
      )}
      {isLoading && <FullScreenLoading />}
      {isError && (
        <FullScreenAlertBox text={t(`common:errors.UNKNOWN_ERROR`)} />
      )}
      {isSuccess && <SubscriptionSuccessMessage />}
    </ContentLayout>
  )
}

export default ManageSubscription
