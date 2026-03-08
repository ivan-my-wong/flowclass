import useTranslation from 'next-translate/useTranslation'
import { FiMoreHorizontal } from 'react-icons/fi'

type CouponCardProps = {
  date: string
  code: string
  amount: string
  description: string
  url?: string
}

const CouponCard: React.FC<CouponCardProps> = ({ date, code, amount, description }) => {
  const { t } = useTranslation()
  return (
    <div className="box-col bg-backgroundLayer2 border-l-1 border-tertiary flex-1 cursor-pointer border-solid">
      <div className="box-col items-start justify-start px-1">
        <div className="box-row">
          <div className="box-row text-textSubtle items-start justify-start pb-2 text-sm">
            {t('promotion:validUntil')}: {date}
          </div>
          <div className="box-row items-end justify-end">
            <FiMoreHorizontal />
          </div>
        </div>

        <div className="box-row items-start justify-start text-base">
          {t('promotion:discountCode')}: {code}
        </div>

        <div className="box-row items-start justify-start pb-4 text-sm">
          {t('promotion:amount')}: {amount}
        </div>

        <div className="box-row text-textSubtle items-start justify-start pb-4 text-sm">
          {description}
        </div>
      </div>
    </div>
  )
}

export default CouponCard
