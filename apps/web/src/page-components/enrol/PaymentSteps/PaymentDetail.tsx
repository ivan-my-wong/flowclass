import { useEffect } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { useQuery } from 'react-query'

import { getPaymentDetail } from '@/api/enrolApi'
import Spinner from '@/components/Loaders/Spinner'
import TabPanel from '@/components/Tabs/TabPanel'
import TabWithListAndButton from '@/components/Tabs/TabWithListAndButton'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { QUERY_KEY } from '@/constants/queryKey'
import { PaymentDetailType } from '@/types/enrol'

import PaymentDetailElement from './PaymentDetailElement'

interface PaymentDetailProps {
  schoolId: number
  hide: boolean
  paymentDetail: PaymentDetailType | undefined
  setPaymentDetail: (e: PaymentDetailType | undefined) => void
  waitingPayment?: boolean
}

export const PaymentDetail = ({
  schoolId,
  hide,
  paymentDetail,
  setPaymentDetail,
  waitingPayment = false,
}: PaymentDetailProps): JSX.Element => {
  const { t } = useTranslation()

  const { data, isLoading, isSuccess, isError } = useQuery(
    [QUERY_KEY.currentPaymentDetailSchoolKey, schoolId],
    () => getPaymentDetail(schoolId),
    {
      enabled: !!schoolId,
    }
  )
  const content = data || []

  const tabData = content.map(item => ({
    label: item.methodName ?? '',
    value: item?.id?.toString() ?? '',
  }))

  // const [paymentDetail, setPaymentDetail] = useState<PaymentDetailType | undefined>()

  useEffect(() => {
    if (content.length > 0) {
      setPaymentDetail(paymentDetail ?? content[0] ?? undefined)
    }
  }, [content, paymentDetail])

  return (
    <div className="box-col-full items-start ">
      {isLoading && <Spinner />}
      {isError && <div>{t('enrol:paymentDetail.error')}</div>}
      {isSuccess && tabData && tabData.length > 0 && (
        <>
          <Heading
            className="w-full text-left text-xl font-bold"
            data-testid="payment-detail-title"
          >
            {t('enrol:paymentDetail.title')}
          </Heading>
          <div className="flex w-full flex-row justify-start">
            <Text align="left">
              {waitingPayment
                ? `${t('enrol:uploadReceipt.selectedPayLaterMethod')}: ${
                    paymentDetail?.methodName ?? ''
                  } `
                : t('enrol:paymentDetail.choosePaymentMethod')}
            </Text>
          </div>

          <div className="box-row-full mt-2">
            <TabWithListAndButton
              tabData={tabData}
              selectedTab={paymentDetail?.id?.toString() ?? content[0].id?.toString() ?? ''}
              handleChange={(value: string) => {
                setPaymentDetail(content?.find(item => item?.id?.toString() === value))
              }}
            >
              {content.map(item => {
                const { payoutMethodDetails } = item
                return (
                  <TabPanel
                    key={item?.id}
                    tabName={item?.id?.toString() ?? ''}
                    className="box-col-full mt-2 items-start gap-y-3 rounded border p-4 "
                  >
                    {!hide &&
                      Object.entries(payoutMethodDetails ?? {}).map(([key, value]) => {
                        if (value) {
                          return (
                            <div key={key} className="user-select-none w-[100%] md:w-[60%]">
                              <div className="w-32 min-w-fit font-bold md:w-40">
                                {t(`enrol:paymentDetail.${key}`)}:
                              </div>
                              <PaymentDetailElement
                                key={key}
                                fieldKey={key}
                                value={value.toString()}
                              />
                            </div>
                          )
                        }
                      })}
                    <div className="flex w-full">
                      <div className="w-32 min-w-fit whitespace-nowrap font-bold md:w-40">
                        {t('enrol:paymentDetail.description')}:{' '}
                      </div>
                      <div className="w-[75%] whitespace-normal break-words">
                        {item.description}
                      </div>
                    </div>
                    {/*<div style={{ fontWeight: 'bold' }}>{`* ${t(*/}
                    {/*  'enrol:paymentDetail.enrollToSeeDetail'*/}
                    {/*)}`}</div>*/}

                    <div>
                      {hide && <p>{t('enrol:paymentDetail.paymentGuide')}</p>}
                      <ul className="mt-2 list-inside list-disc">
                        {hide && <li> {t('enrol:paymentDetail.scanPaymentImage')}</li>}
                        <li> {t('enrol:paymentDetail.enterPaymentLink')}</li>
                        <li> {t('enrol:paymentDetail.transferMoney')}</li>
                      </ul>
                    </div>
                  </TabPanel>
                )
              })}
            </TabWithListAndButton>
          </div>
        </>
      )}
    </div>
  )
}

export default PaymentDetail
