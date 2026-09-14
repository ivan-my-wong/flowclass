import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { FaArrowRight } from 'react-icons/fa'
import { LuCrown } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const NoActiveSubscription = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <div className="p-2 md:p-5">
      <Card className="shadow-none px-5 gap-5 py-8 flex items-start flex-col md:flex-row border-gray-300">
        <div className="text-center md:text-left">
          <div className="flex items-center gap-3">
            <LuCrown size={30} className="text-yellow-400" />
            <div className="text-2xl text-gray-800 font-semibold">
              {t('subscription:noActiveSubscription.upgradeTitle')}
            </div>
          </div>
          <div className="text-gray-600 text-sm mt-2">
            {t('subscription:noActiveSubscription.description')}
          </div>
        </div>
        <Button
          iconAfter={<FaArrowRight />}
          onClick={() => navigate('/subscription')}
          className="ml-auto"
        >
          {t('subscription:noActiveSubscription.manageButton')}
        </Button>
      </Card>
    </div>
  )
}

export default NoActiveSubscription
