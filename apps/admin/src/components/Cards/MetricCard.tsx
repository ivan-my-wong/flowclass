import { getGrowthRateColor } from '@/utils/options'

import Text from '../Texts/Text'
import ShadowBox from '../ui/ShadowBox'

type PropsType = {
  title: string
  value: number | string
  growthRate?: string
  subtitle?: string
}

// MetricCard component
const MetricCard = ({
  title,
  value,
  growthRate,
  subtitle,
}: PropsType): JSX.Element => {
  return (
    <ShadowBox direction="col" align="start" gap="base" className="p-6">
      <Text size="medium">{title}</Text>
      <div className="box-col-full justify-between items-start">
        <Text bold size="large">
          {value}
        </Text>
        <div className="box-row-full w-fit">
          {growthRate && (
            <Text
              bold
              size="small"
              css={{
                color: getGrowthRateColor(growthRate),
                padding: '$1',
                borderRadius: '$1',
              }}
            >
              {growthRate}
            </Text>
          )}
          {subtitle && (
            <Text bold size="small">
              {subtitle}
            </Text>
          )}
        </div>
      </div>
    </ShadowBox>
  )
}

export default MetricCard
