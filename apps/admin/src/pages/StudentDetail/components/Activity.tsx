import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useInfiniteQuery } from 'react-query'
import { useRecoilState } from 'recoil'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { getActivity } from '@/api/recordLogs'
import { Spinner } from '@/components/Loaders/Spinner'
import Separator from '@/components/Separators/Separator'
import Heading from '@/components/Texts/Heading'
import Box from '@/components/ui/Box'
import { QUERY_KEY } from '@/constants/queryKey'
import { schoolState } from '@/stores/schoolData'
import { siteState } from '@/stores/siteData'
import { StudentActivityType } from '@/types/studentActivity.type'

import BoxActivity from './BoxActivity'

type Props = {
  tabName: string
  personalName: string
}

const Activity = ({ tabName, personalName }: Props): JSX.Element => {
  const params = useParams()
  const { id } = params
  const [activities, setActivities] = useState<StudentActivityType[]>([])
  const [schoolData] = useRecoilState(schoolState)
  const [siteData] = useRecoilState(siteState)
  const currentSchoolId = schoolData.currentSchool?.id || 0
  const currentSiteId = siteData.currentSite?.id || 0
  const [page, setPage] = useState(1)

  const { t } = useTranslation()

  const getList = async () => {
    const params = {
      page,
      limit: 10,
      userId: Number(id),
      siteId: currentSiteId,
      institutionId: currentSchoolId,
    }
    return getActivity(params)
  }

  const { fetchNextPage, isLoading, hasNextPage } = useInfiniteQuery({
    queryKey: [
      QUERY_KEY.student.getActivityListKey,
      id,
      currentSiteId,
      currentSchoolId,
    ],
    queryFn: getList,
    getNextPageParam: () => {
      return page + 1
    },
    onSuccess: rs => {
      const ls =
        rs?.pages.reduce((acc, page) => {
          return [...acc, ...page]
        }, []) || []
      setActivities(ls)
      setPage(page + 1)
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
    enabled: !!id,
  })

  return (
    <Box border direction="col" id={tabName} padding="base">
      <Heading size="smallMedium">{t('student:activity.title')}</Heading>
      <Separator margin="large" />
      <InfiniteScroll
        dataLength={activities.length}
        next={fetchNextPage}
        hasMore={!!hasNextPage}
        loader={<></>}
        scrollableTarget="scrollableDiv"
      >
        {isLoading ? (
          <Spinner />
        ) : (
          activities.map(item => {
            return (
              <BoxActivity
                key={item?.id}
                item={item}
                personalName={personalName}
              />
            )
          })
        )}
      </InfiniteScroll>
    </Box>
  )
}

export default Activity
