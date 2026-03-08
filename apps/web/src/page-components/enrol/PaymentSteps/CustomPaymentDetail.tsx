import useTranslation from 'next-translate/useTranslation'
import { FaExternalLinkAlt } from 'react-icons/fa'

import Button from '@/components/Buttons/Button'
import ImageAspect from '@/components/Images/ImageAspect'
import { PaymentDetailType } from '@/types/enrol'

type PropsType = {
  data: PaymentDetailType
}
const CustomPaymentMethod = ({ data }: PropsType): JSX.Element => {
  const { t } = useTranslation()
  return (
    <div className="w-full">
      <div className="flex min-h-[20rem] w-full flex-col items-start justify-start rounded-md border border-gray-300 p-6 shadow-xl">
        <h1 className="text-left font-semibold">Instruction</h1>
        <p className="my-3 whitespace-pre-line">{data.description}</p>

        {data.payoutMethodDetails?.payoutImg && (
          <ImageAspect
            s3="private"
            ratio={1}
            alt="Payment preview cover"
            imgClassName="object-cover h-fit w-fit md:h-96 md:w-96"
            className="mx-auto h-40 w-40 md:h-80 md:w-80"
            src={data.payoutMethodDetails?.payoutImg}
          />
        )}
        {data.payoutMethodDetails?.payoutUrl && (
          <Button
            className="mt-4 w-full"
            iconAfter={<FaExternalLinkAlt />}
            onClick={e => {
              window.open(data.payoutMethodDetails?.payoutUrl, '_blank')
            }}
          >
            {t('enrol:paymentDetail.payWithExternalLink')}
          </Button>
          // <InAppBrowser
          //   trigger={
          //     <Button className="mt-4 w-full" iconAfter={<FaExternalLinkAlt />}>
          //       {t('enrol:paymentDetail.payWithExternalLink')}
          //     </Button>
          //   }
          //   url={data.payoutMethodDetails?.payoutUrl as string}
          //   title="Payment"
          //   status={data.description}
          // />
        )}
      </div>
    </div>
  )
}

export default CustomPaymentMethod
