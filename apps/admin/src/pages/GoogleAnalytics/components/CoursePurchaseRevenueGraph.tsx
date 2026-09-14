import { useEffect, useState } from 'react'

import { t } from 'i18next'
import { Line } from 'react-chartjs-2'
import { useRecoilValue } from 'recoil'

import CourseSelector, {
  CourseSelectorItem,
} from '@/components/Selector/CourseSelector'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import useCourseData from '@/hooks/useCourseData'
import useGoogleAnalytics from '@/hooks/useGoogleAnalytics'
import { schoolState } from '@/stores/schoolData'
import { ChartDate } from '@/types/chartDate.type'
import { SchoolCourseRevenueAmount } from '@/types/dataAnalytics'
import { addMissingData } from '@/utils/dataAnalytics'
import { courseListToCourseOptions } from '@/utils/options'
import { getFormatDate } from '@/utils/timeFormat'

import { getLineChartOptions, mapDataToChart } from './chartjsSetup'
import ChartStatusWrapper from './ChartStatusWrapper'

type PropTypes = {
  outerChartDate: ChartDate
}
const CoursePurchaseRevenueGraph = ({
  outerChartDate,
}: PropTypes): JSX.Element => {
  const { courseData } = useCourseData()
  const schoolData = useRecoilValue(schoolState)
  const currentSchoolId = schoolData.currentSchool?.id || 0
  const { useFetchRevenueAnalytics } = useGoogleAnalytics()
  const courseSelectorOptions: CourseSelectorItem[] = courseListToCourseOptions(
    courseData.courses,
    false
  )

  const [selectedCourse, setSelectedCourse] = useState<CourseSelectorItem>(
    courseSelectorOptions[0]
  )

  const { data, isLoading, isError, refetch } = useFetchRevenueAnalytics({
    institutionId: currentSchoolId,
    courseId: parseInt(selectedCourse?.value, 10),
    startDate: outerChartDate.startDate,
    endDate: outerChartDate.endDate,
  })

  const [eachDayData, setEachDayData] = useState<SchoolCourseRevenueAmount[]>(
    data ?? []
  )

  useEffect(() => {
    refetch().then(res => {
      const formattedData = addMissingData(res.data ?? [], outerChartDate).map(
        item => {
          const date = getFormatDate(item.date)

          return {
            totalAmount: item.totalAmount,
            date,
          }
        }
      )
      setEachDayData(formattedData)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outerChartDate, selectedCourse])

  return (
    <ChartStatusWrapper isLoading={isLoading} isError={isError}>
      {data && (
        <>
          <Box justify="center" direction="col">
            <Text bold>
              {t(`component:googleAnalytics.coursePurchaseRevenue`)}
            </Text>

            <CourseSelector
              selectOption={selectedCourse}
              options={courseSelectorOptions}
              onChange={setSelectedCourse}
              autoHeight
              width="90%"
            />
          </Box>
          <Box className="h-[85%]">
            <Line
              data={mapDataToChart({
                chartData: eachDayData ?? [],
                labelKey: 'date',
                dataKey: 'totalAmount',
                label: `${t(`component:googleAnalytics.revenue`)} (${
                  schoolData.currentSchool?.siteSetting?.currency
                })`,
              })}
              options={getLineChartOptions()}
            />
          </Box>
        </>
      )}
    </ChartStatusWrapper>
  )
}

export default CoursePurchaseRevenueGraph
