import useTranslation from 'next-translate/useTranslation'

import Heading from '../Texts/Heading'
import Text from '../Texts/Text'

type SubscriptionCardProps = {
  icon: JSX.Element
  title: string
  price?: string
  link: string
  billDate: string
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  icon,
  title,
  price,

  billDate,
}) => {
  const { t } = useTranslation()
  return (
    <div className="box-col bg-backgroundLayer2 rounded-sm p-4">
      <div className="box-row">
        <div className="fill-primary w-6">{icon}</div>
        <Heading>{title}</Heading>
      </div>
      <div className="box-col items-start">
        <Text align="left">{price}</Text>
        <Text>
          {t('subscription:nextBillDay')}: {billDate}
        </Text>
      </div>
    </div>
  )
}

export default SubscriptionCard
