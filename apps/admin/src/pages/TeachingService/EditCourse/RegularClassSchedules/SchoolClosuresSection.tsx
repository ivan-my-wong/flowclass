import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuDoorClosed, LuExternalLink, LuPlus, LuSchool } from 'react-icons/lu'

import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Text from '@/components/ui/Text'
import useBlockTimeData from '@/hooks/useBlockTimeData'
import BlockTimeItem from '@/pages/Setting/component/BlockTimeItem'
import { formatTs } from '@/utils/timeFormat'

export const SchoolClosuresSection = (): JSX.Element => {
  const { t } = useTranslation(['teachingService'])
  const { useFetchAllblockTimeData } = useBlockTimeData()
  const { data: blockTimes } = useFetchAllblockTimeData()
  const navigate = useNavigate()

  const schoolClosureTitle = (
    <div className="box-row-full items-center gap-2 justify-start">
      <LuDoorClosed />
      <Text className="text-xl font-semibold">
        {t('teachingService:regularV2.schoolClosures')}
      </Text>
    </div>
  )

  if (!blockTimes?.length) {
    return (
      <Card className="p-4 w-full">
        {schoolClosureTitle}
        <Text className="text-gray-500">
          {t('teachingService:regularV2.noSchoolClosures')}
        </Text>
      </Card>
    )
  }

  return (
    <Card className="p-4 w-full">
      <div className="box-row-full justify-between items-center">
        {schoolClosureTitle}
        <Button
          variant="outline"
          iconBefore={<LuExternalLink />}
          onClick={() => {
            navigate('/availability')
          }}
        >
          {t('teachingService:regularV2.addSchoolClosure')}
        </Button>
      </div>

      <div className="box-col-full mt-4">
        {blockTimes.map(blockTime => (
          <BlockTimeItem
            key={blockTime.id}
            data={blockTime}
            isEditable={false}
          />
        ))}
      </div>
    </Card>
  )
}
