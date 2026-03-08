import dayjs from 'dayjs'
import useTranslation from 'next-translate/useTranslation'

import PaginatedItems from '@/components/Containters/Pagination'
import imageUrls from '@/constants/imageUrls'
import { useGetPastLessons, useGetUpcomingLessons } from '@/hooks/useProfile'
import { School } from '@/types'
import { PaymentStatus } from '@/types/profile'

type UpcomingLessonsProps = {
  school: School
  isPastLesson?: boolean
}

const UpcomingLessons = ({ school, isPastLesson }: UpcomingLessonsProps): React.ReactElement => {
  const { t } = useTranslation()

  const pastLessData = useGetPastLessons({ institutionId: school.id })
  const upcomingLessData = useGetUpcomingLessons({ institutionId: school.id })

  const { data } = isPastLesson ? pastLessData : upcomingLessData

  return (
    <PaginatedItems itemsPerPage={10}>
      {(Object.keys(data || {})
        ?.filter(key => !!data?.[key]?.length)
        ?.map(key => {
          const firstItem = data?.[key].sort((a, b) => {
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          })[0]
          const lastItem = data?.[key].sort((a, b) => {
            return new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
          })[0]

          const isPending = data?.[key].some(o => o.invoice.paymentState !== PaymentStatus.PAID)
          const bgColor = isPending ? 'bg-gray-400' : 'bg-green-400'
          const totalDone = data?.[key].filter(o => o.isDone).length

          return (
            <div
              key={firstItem?.id}
              data-testid={firstItem?.id}
              className="bg-background-layer-2 flex w-full flex-col items-center justify-between gap-4 rounded-md p-4 md:flex-row md:p-8"
            >
              <div className="flex flex-col items-center gap-4 md:flex-row">
                <img
                  src={firstItem?.course?.previewImageUrl || imageUrls.defaultFallback}
                  className="h-full w-full rounded-lg object-cover md:h-[100px] md:w-[100px]"
                  alt="course"
                />
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{firstItem?.course?.name}</div>
                  <div>
                    {dayjs(firstItem?.startTime).format('YYYY/MM/DD hh:mm:ss a')}
                    {` - `}
                    {dayjs(lastItem?.endTime).format('YYYY/MM/DD hh:mm:ss a')}
                  </div>
                  <div>
                    {t('school:profile.lesson')} {totalDone} / {data?.[key].length}
                  </div>
                </div>
              </div>
              <div
                className={`text-tableOddRowColor w-full rounded-md ${bgColor} p-2 text-center font-bold md:w-[100px]`}
              >
                {t(`school:profile.invoiceStatus.${isPending ? 'UNPAID' : 'PAID'}`)}
              </div>
            </div>
          )
        }) as any) || []}
    </PaginatedItems>
  )
}

export default UpcomingLessons
