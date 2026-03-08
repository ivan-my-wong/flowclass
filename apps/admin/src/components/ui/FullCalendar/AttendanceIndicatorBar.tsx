import { useTranslation } from 'react-i18next'
import { BsQuestionCircle } from 'react-icons/bs'

import { Button } from '../Button'
import { Popover, PopoverContent, PopoverTrigger } from '../Popover'

const AttendanceIndicatorBar = (): JSX.Element => {
  const { t } = useTranslation('calendar')
  const indicators = [
    {
      key: 'gray',
      color: 'bg-gray-500',
    },
    {
      key: 'yellow',
      color: 'bg-yellow-500',
    },
    {
      key: 'green',
      color: 'bg-green-500',
    },
  ]
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">
          <BsQuestionCircle size={20} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] text-sm" side="bottom" align="end">
        <div className="font-semibold text-gray-700 mb-3">
          {t(`indicator.title`)}
        </div>
        <div className="space-y-3">
          {indicators.map(item => (
            <div key={item.key}>
              <div className="font-medium flex items-center gap-1 mb-1 text-gray-700 capitalize">
                <div className={`${item.color} h-4 w-4 rounded-full`} />
                <div>{t(`indicator.${item.key}.title`)}</div>
              </div>
              <div className="text-gray-600">
                {t(`indicator.${item.key}.description`)}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default AttendanceIndicatorBar
