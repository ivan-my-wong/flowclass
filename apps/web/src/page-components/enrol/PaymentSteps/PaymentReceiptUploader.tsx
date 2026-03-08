import { useRecoilValue } from 'recoil'

import useTranslation from 'next-translate/useTranslation'

import ImageUploader from '@/components/Images/ImageUploader'
import Heading from '@/components/Texts/Heading'
import { currentWebsiteTheme } from '@/stores/schoolContext'
import { templateSectionBgColor } from '@/types/websiteTemplate'

type PropsType = {
  setProofImage: (file: File) => void
}
const PaymentReceiptUploader = ({ setProofImage }: PropsType): JSX.Element => {
  const currentTheme = useRecoilValue(currentWebsiteTheme)
  const { t } = useTranslation()

  const onImageUploadSuccess = (file: File) => {
    setProofImage(file)
  }
  return (
    <div className={`box-col-full mt-4 lg:pb-4`}>
      <div
        className={`box-col mb-4 items-center rounded-md p-4 lg:p-8 ${templateSectionBgColor(
          currentTheme
        )}`}
      >
        <>
          <div className="box-col-full mt-4">
            {/** This is the third part where the user uploads the payment receipt */}
            <div className="box-col-full">
              <Heading align="center">{t('enrol:paymentDetail.uploadReceipt')}</Heading>
              <p className="mb-4">{t('enrol:uploadReceipt.paymentReceipt')}</p>
              <div className="w-full justify-center">
                <ImageUploader onSuccess={onImageUploadSuccess} />
              </div>
            </div>
          </div>
        </>
      </div>
    </div>
  )
}

export default PaymentReceiptUploader
