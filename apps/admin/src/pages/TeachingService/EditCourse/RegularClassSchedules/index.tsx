import { useFormContext } from 'react-hook-form'

import Box from '@/components/ui/Box'
import { Card } from '@/components/ui/Card'
import DateOverride from '@/pages/Availability/components/DateOverride'
import { ClassesForm } from '@/types/classes'

import { BookingAndPricingSection } from './BookingAndPricingSection'
import { PeriodConfigurationSection } from './PeriodConfigurationSection'
import { RegularClassSchedulePeriods } from './RegularClassSchedulePeriods'
import { RegularScheduleLessonPreview } from './RegularScheduleLessonPreview'
import { SchoolClosuresSection } from './SchoolClosuresSection'

export const RegularClassSchedulesV2 = (): JSX.Element => {
  const form = useFormContext<ClassesForm>()

  return (
    <Box direction="col" gap="lg">
      {/* Main Configuration Sections */}
      <div className="box-col-full lg:box-row-full !items-start !justify-start">
        <div className="box-col-full items-start justify-start">
          {/* Recurrence Pattern Section */}
          <RegularClassSchedulePeriods />

          {/* Period Configuration Section */}
          <PeriodConfigurationSection />

          {/* Date Overrides Section */}
          <Card className="p-2 w-full">
            <DateOverride
              form={form}
              formName="regularScheduleV2.dateOverrides"
              className="w-full"
            />
          </Card>

          {/* School Closures Section */}
          <SchoolClosuresSection />

          {/* Booking and Pricing Section */}
          <BookingAndPricingSection />
        </div>

        {/* Lesson Preview */}
        <div className="box-col-full min-w-[10rem]">
          <RegularScheduleLessonPreview />
        </div>
      </div>
    </Box>
  )
}
