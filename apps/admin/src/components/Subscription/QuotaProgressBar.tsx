import { useMemo } from 'react'

import { QuotaItem } from '@/types/schoolSubscriptionPlan'
import { formatNumber } from '@/utils/misc'

import { Progress } from '../ui/Progress'

type PropsType = {
  data: QuotaItem
  title: string
}
const QuotaProgressBar = ({ data, title }: PropsType): JSX.Element => {
  const percent = useMemo(() => (data.used / data.quota) * 100, [data])
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between">
        <p>{title}</p>
        <p>
          {formatNumber(data.used)}/{formatNumber(data.quota)}
        </p>
      </div>
      <Progress value={percent} max={100} />
    </div>
  )
}

export default QuotaProgressBar
