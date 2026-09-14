import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import AlertBox from '@/components/Boxes/AlertBox'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import Heading from '@/components/Texts/Heading'
import { Button } from '@/components/ui/Button'
import useBlockTimeData from '@/hooks/useBlockTimeData'
import ContentLayout from '@/layouts/ContentLayout'

import BlockTimeItem from '../Setting/component/BlockTimeItem'
import AddBlockTime from '../Setting/component/CreateBlockTime'

const ListBlockTime = (): JSX.Element => {
  const { t } = useTranslation()
  const [isOpenAddBlockTime, setIsOpenAddBlockTime] = useState(false)
  const { useFetchAllblockTimeData } = useBlockTimeData()
  const fetchLessonDataResult = useFetchAllblockTimeData()
  const { isLoading, isError, isSuccess, isIdle, data } = fetchLessonDataResult
  // useEffect(() => {
  //   refetch()
  // }, [isOpenAddBlockTime, refetch])

  const rightHeaderContent = (
    <Button onClick={() => setIsOpenAddBlockTime(true)}>
      {t('common:action.add')}
    </Button>
  )
  return (
    <ContentLayout
      leftHeader={
        <Heading>{t('setting:systemSettings.blockTimeSetting')}</Heading>
      }
      rightHeader={rightHeaderContent}
    >
      <div className="box-col-full p-4">
        <AlertBox content={t('setting:systemSettings.inBeta')} />
      </div>

      {isIdle && (
        <FullScreenAlertBox text={t(`setting:systemSettings.noBlockTime`)} />
      )}
      {isLoading && <FullScreenLoading />}
      {isError && (
        <FullScreenAlertBox text={t(`common:errors.UNKNOWN_ERROR`)} />
      )}
      {isSuccess && data && data.length === 0 && (
        <FullScreenAlertBox text={t(`setting:systemSettings.noBlockTime`)} />
      )}
      {isSuccess && data && data.length > 0 && (
        <div className="box-col-full px-4">
          {data?.map(blockTime => {
            return <BlockTimeItem key={blockTime.id} data={blockTime} />
          })}
        </div>
      )}

      <AddBlockTime
        open={isOpenAddBlockTime}
        handleClose={() => setIsOpenAddBlockTime(false)}
      />
    </ContentLayout>
  )
}

export default ListBlockTime
