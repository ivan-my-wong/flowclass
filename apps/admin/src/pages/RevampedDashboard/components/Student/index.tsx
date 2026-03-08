import { useTranslation } from 'react-i18next'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { StudentByItem, StudentOverview } from '@/types/enrollCourse'
import { StatFilter } from '@/types/statistics'
import { cn } from '@/utils/cn'

import { ByInstructorTab } from './ByInstructorTab'
import { ByStudentTab } from './ByStudentTab'
import { StudentOverviewTab } from './Overview'

interface StudentTabProps {
  data?: StudentOverview | StudentByItem[]
  isLoading: boolean
  activeFilter: StatFilter
  onFilterChange: (value: StatFilter) => void
}

export const StudentTab = ({
  data,
  isLoading,
  activeFilter,
  onFilterChange,
}: StudentTabProps) => {
  const { t } = useTranslation(['onboarding'])

  const handleFilterChange = (value: string) => {
    onFilterChange(value as StatFilter)
  }

  const isStudentOverview = (data: any): data is StudentOverview => {
    return data && typeof data === 'object' && 'summary' in data
  }

  return (
    <Tabs
      value={activeFilter}
      onValueChange={handleFilterChange}
      className="w-full"
    >
      <TabsList className="w-full flex h-12 bg-transparent p-0 mb-6">
        {[
          { value: 'overview', label: t('dashboard.student.overview') },
          { value: 'by-student', label: t('dashboard.student.byStudent') },
          {
            value: 'by-instructor',
            label: t('dashboard.student.byInstructor'),
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
          <StudentOverviewTab
            overviewData={isStudentOverview(data) ? data : undefined}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="by-student">
          <ByStudentTab
            data={Array.isArray(data) ? data : undefined}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="by-instructor">
          <ByInstructorTab
            data={Array.isArray(data) ? data : undefined}
            isLoading={isLoading}
          />
        </TabsContent>
      </div>
    </Tabs>
  )
}
