import { ChartDate } from '@/types/chartDate.type'
import { SchoolCourseRevenueAmount } from '@/types/dataAnalytics'
import dayjs from '@/utils/dayjs'

import { addDaysToDate, getFormatDate } from './timeFormat'

export const addMissingData = (
  resData: SchoolCourseRevenueAmount[],
  chartDate: ChartDate
): SchoolCourseRevenueAmount[] => {
  let currentStartDate = new Date(chartDate.startDate)
  const lastDate = new Date(chartDate.endDate)
  const newData = [...(resData ?? [])]
  const processDate = (date: Date) => {
    if (
      !resData?.some(
        item => getFormatDate(item.date) === getFormatDate(date.toISOString())
      )
    ) {
      newData.push({
        totalAmount: 0,
        date: date.toISOString(),
      })
    }

    newData.sort(
      (a, b) =>
        dayjs(a.date).toDate().getTime() - dayjs(b.date).toDate().getTime()
    )
    // setEachDayData(newData)
  }

  while (currentStartDate <= lastDate) {
    processDate(currentStartDate)
    currentStartDate = new Date(
      addDaysToDate(currentStartDate.toISOString(), 1)
    )
  }
  return newData
}
