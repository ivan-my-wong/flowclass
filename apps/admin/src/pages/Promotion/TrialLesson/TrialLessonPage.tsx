import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuPlus } from 'react-icons/lu'

import { ParamsFetchingTrialLessons } from '@/api/trialLesson'
import Box from '@/components/Containers/Box'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import { Button } from '@/components/ui/Button'
import useCourseData from '@/hooks/useCourseData'
import useSiteData from '@/hooks/useSiteData'
import useTrialLessonData from '@/hooks/useTrialLessonData'
import ContentLayout from '@/layouts/ContentLayout'
import TrialLessonCard from '@/pages/Promotion/TrialLesson/TrialLessonCard'

const TrialLessonPage = () => {
  const { t } = useTranslation()

  const { siteData } = useSiteData()

  const navigate = useNavigate()
  const hasTrialLessonAccess = true
  const [params, setParams] = useState<ParamsFetchingTrialLessons>({
    num: 10,
    page: 1,
    order: 'ASC',
    orderBy: 'createdAt',
  })
  const { useFetchTrialLesson } = useTrialLessonData()
  const { useFetchAllCourseData } = useCourseData()

  const { data: listCourses } = useFetchAllCourseData()
  const {
    data: listTrialLesson,
    isLoading,
    isIdle,
    isError,
    isSuccess,
  } = useFetchTrialLesson(params)
  const headerBackButton: HeaderBackButtonStatus = {
    title: t('promotion:titles.trial'),
    mode: 'add',
  }

  const rightHeaderContent = (
    <Box>
      <Button
        data-testid="add-trial-btn"
        size="sm"
        className="px-4 gap-x-2"
        onClick={() => navigate('/promotion/trial-lesson/create')}
      >
        <LuPlus /> {t('common:action.add')}
      </Button>
    </Box>
  )
  return (
    <>
      <ContentLayout
        headerBackButton={headerBackButton}
        leftHeader={<></>}
        rightHeader={rightHeaderContent}
      >
        {isIdle && (
          <FullScreenAlertBox text={t(`promotion:trialLesson.notFound`)} />
        )}
        {isLoading && <FullScreenLoading />}
        {isError && (
          <FullScreenAlertBox text={t(`common:errors.UNKNOWN_ERROR`)} />
        )}
        {isSuccess &&
          listTrialLesson &&
          (listTrialLesson?.content?.length || 0) === 0 && (
            <FullScreenAlertBox text={t(`promotion:trialLesson.notFound`)} />
          )}
        <div className="grid grid-cols-1 w-full p-8 gap-3">
          {isSuccess &&
            (listTrialLesson?.content || []).map(trialLesson => (
              <TrialLessonCard
                data={trialLesson}
                key={trialLesson.id}
                currency={siteData?.currentSite?.currency || ''}
                courses={listCourses}
              />
            ))}
        </div>
      </ContentLayout>
      <Outlet />
    </>
  )
}
export default TrialLessonPage
