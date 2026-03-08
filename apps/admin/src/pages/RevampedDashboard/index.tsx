import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuArrowRight } from 'react-icons/lu'

import ChartDatePicker from '@/components/DatePickers/ChartDatePicker'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/Separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useStatistics } from '@/hooks/useStatistics'
import { useStatisticsData } from '@/hooks/useStatisticsData'
import {
  RevenueByItem,
  RevenueOverview,
  StudentByItem,
  StudentOverview,
} from '@/types/enrollCourse'
import { cn } from '@/utils/cn'

import { RevenueTab } from './components/Revenue'
import { StudentTab } from './components/Student'

const Dashboard = (): JSX.Element => {
  const { t } = useTranslation(['onboarding'])
  const navigate = useNavigate()

  const { type, setType, filter, setFilter, chartDate, handleChartDateChange } =
    useStatistics()

  const { data: dynamicData, isLoading: isDataLoading } = useStatisticsData({
    type,
    filter,
    startDate: chartDate.startDate,
    endDate: chartDate.endDate,
  })

  const handleTabChange = (newType: string) => {
    if (newType === 'revenue' || newType === 'student') {
      setType(newType)
      setFilter('overview')
    }
  }

  return (
    <div className="w-full box-col-full gap-4 p-4 items-start relative">
      <div className="box-responsive-full justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            {t('onboarding:dashboard.statistics')}
          </h1>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="primary-outline"
            size="sm"
            iconAfter={<LuArrowRight />}
          >
            {t('onboarding:dashboard.basicAnalytics')}
          </Button>
        </div>
        <ChartDatePicker
          chartDate={chartDate}
          handleChartDateChange={handleChartDateChange}
          mode="month"
        />
      </div>
      <div className="box-responsive-full items-center justify-between">
        <Tabs
          activationMode="manual"
          value={type}
          onValueChange={handleTabChange}
          className="w-full max-w-full mx-auto"
        >
          <TabsList className="w-full flex h-auto py-0 bg-transparent">
            <TabsTrigger
              value="revenue"
              className={cn(
                'flex-1 font-medium text-sm text-gray-500 !shadow-none !bg-transparent flex items-center justify-center py-3',
                type === 'revenue'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'border-b-2 border-transparent'
              )}
            >
              {t('dashboard.revenue.title')}
            </TabsTrigger>
            <TabsTrigger
              value="student"
              className={cn(
                'flex-1 font-medium text-sm text-gray-500 !shadow-none !bg-transparent flex items-center justify-center py-3',
                type === 'student'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'border-b-2 border-transparent'
              )}
            >
              {t('dashboard.student.title')}
            </TabsTrigger>
          </TabsList>
          <Separator className="bg-gray-200" />
          <TabsContent value="revenue">
            <RevenueTab
              data={
                dynamicData as RevenueOverview | RevenueByItem[] | undefined
              }
              isLoading={isDataLoading}
              activeFilter={filter}
              onFilterChange={setFilter}
              chartDate={chartDate}
            />
          </TabsContent>
          <TabsContent value="student">
            <StudentTab
              data={
                dynamicData as StudentOverview | StudentByItem[] | undefined
              }
              isLoading={isDataLoading}
              activeFilter={filter}
              onFilterChange={setFilter}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Dashboard
