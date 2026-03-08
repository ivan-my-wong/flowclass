import { useRouter } from 'next/router'

import { AiOutlineInfoCircle } from 'react-icons/ai'

type PromotionCardProps = {
  icon: string
  title: string
  numOfPromotion: number
  disabled?: boolean
  url: string
}

const PromotionCard: React.FC<PromotionCardProps> = ({
  icon,
  title,
  numOfPromotion,
  disabled = false,
  url,
}) => {
  // const { t } = useTranslation()
  const router = useRouter()
  return (
    <div
      className={` box-col bg-backgroundLayer2 h-[250px] w-[200px] rounded-sm p-2 ${
        disabled ? 'grayscale-100' : ''
      } hover:bg-backgroundLayer3 cursor-pointer transition-colors`}
      onClick={() => {
        router.push(url)
      }}
    >
      <div className="box-row cursor-pointer items-end justify-end">
        <AiOutlineInfoCircle />
      </div>
      <div className="box-row p-4">
        <img src={icon} alt="" style={{ width: '100px' }} draggable={false} />
      </div>

      <div className="box-row p-2 text-base">{title}</div>

      <div className="box-row text-lg">{numOfPromotion}</div>

      <div />
    </div>
  )
}

export default PromotionCard
