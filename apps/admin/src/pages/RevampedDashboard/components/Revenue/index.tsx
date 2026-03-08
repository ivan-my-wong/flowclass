import { useTranslation } from 'react-i18next'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { RevenueByItem, RevenueOverview } from '@/types/enrollCourse'
import { StatFilter } from '@/types/statistics'
import { cn } from '@/utils/cn'

import { ByClassTab } from './ByClassTab'
import { ByCourseTab } from './ByCourse'
import { ByInstructorTab } from './ByInstructorTab'
import { ByStudentTab } from './ByStudentTab'
import { Overview } from './Overview'

interface RevenueTabProps {
  data?: RevenueOverview | RevenueByItem[]
  isLoading: boolean
  activeFilter: StatFilter
  onFilterChange: (value: StatFilter) => void
  chartDate: {
    startDate: string
    endDate: string
  }
}

export const RevenueTab = ({
  data,
  isLoading,
  activeFilter,
  onFilterChange,
  chartDate,
}: RevenueTabProps): JSX.Element => {
  const { t } = useTranslation(['onboarding'])

  const handleFilterChange = (value: string) => {
    if (
      value === 'overview' ||
      value === 'by-course' ||
      value === 'by-class' ||
      value === 'by-instructor' ||
      value === 'by-student'
    ) {
      onFilterChange(value)
    }
  }

  const isRevenueOverview = (
    statisticData: RevenueOverview | RevenueByItem[] | undefined
  ): statisticData is RevenueOverview => {
    if (!statisticData || Array.isArray(statisticData)) {
      return false
    }
    return 'totalRevenue' in statisticData
  }

  return (
    <Tabs
      value={activeFilter}
      onValueChange={handleFilterChange}
      className="w-full"
    >
      <TabsList className="w-full flex h-12 bg-transparent p-0 mb-6">
        {[
          { value: 'overview', label: t('dashboard.revenue.overview') },
          { value: 'by-course', label: t('dashboard.revenue.byCourse') },
          { value: 'by-class', label: t('dashboard.revenue.byClass') },
          {
            value: 'by-instructor',
            label: t('dashboard.revenue.byInstructor'),
          },
        ].map(item => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className={cn(
              'flex-1 min-w-0 font-medium text-sm !shadow-none !bg-transparent',
              'flex items-center justify-center py-2 px-3 text-center',
              'transition-colors duration-200 border-b-2 border-transparent',
              activeFilter === item.value
                ? 'text-blue-600 border-blue-600 font-semibold'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="pt-2">
        <TabsContent value="overview">
          <Overview
            overviewData={
              activeFilter === 'overview' && isRevenueOverview(data)
                ? data
                : undefined
            }
            isLoading={isLoading}
            chartDate={chartDate}
          />
        </TabsContent>

        <TabsContent value="by-course">
          <ByCourseTab
            data={
              activeFilter === 'by-course'
                ? (data as RevenueByItem[])
                : undefined
            }
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="by-class">
          <ByClassTab
            data={
              activeFilter === 'by-class'
                ? (data as RevenueByItem[])
                : undefined
            }
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="by-student">
          <ByStudentTab
            data={
              activeFilter === 'by-student'
                ? (data as RevenueByItem[])
                : undefined
            }
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="by-instructor">
          <ByInstructorTab
            data={
              activeFilter === 'by-instructor'
                ? (data as RevenueByItem[])
                : undefined
            }
            isLoading={isLoading}
          />
        </TabsContent>
      </div>
    </Tabs>
  )
}
