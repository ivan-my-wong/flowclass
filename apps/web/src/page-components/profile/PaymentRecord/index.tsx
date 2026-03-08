import { useState } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { MdLoop } from 'react-icons/md'

import PaginatedItems from '@/components/Containters/Pagination'
import { useGetPaymentRecords } from '@/hooks/useProfile'
import { Course, School } from '@/types'
import { FilterPaymentReports, PaymentStatus } from '@/types/profile'

import FilterForm from './FilterForm'
import PaymentRecordItem from './PaymentRecordItem'

type PaymentRecordProps = {
  school: School
  courses?: Course[]
  showPaidOnly?: boolean
  showPaymentState?: boolean
}

const PaymentRecord = ({
  school,
  courses = [],
  showPaidOnly = false,
  showPaymentState,
}: PaymentRecordProps): React.ReactElement => {
  const { t } = useTranslation()

  const [filter, setFilter] = useState<FilterPaymentReports>()

  const { data, refetch, isLoading } = useGetPaymentRecords({
    institutionId: school.id,
    ...(filter ?? {}),
    paymentState: showPaidOnly
      ? [PaymentStatus.PAID]
      : Object.values([
          PaymentStatus.PENDING,
          PaymentStatus.CRITICAL,
          PaymentStatus.SUBMITTED,
          PaymentStatus.UNPAID,
        ]),
  })

  return (
    <div className="space-y-4">
      <FilterForm
        courses={courses}
        currentFilter={filter}
        setCurrentFilter={setFilter}
        showPaymentState={showPaymentState}
      />
      {isLoading && (
        <div className="flex items-center justify-center gap-x-2">
          <MdLoop className="animate-spin" /> Loading...
        </div>
      )}
      {data?.length === 0 && !isLoading && <div className="text-center">{t('profile:noData')}</div>}

      <PaginatedItems itemsPerPage={5} hidePaginationIfOnePage>
        {data?.map(item => (
          <PaymentRecordItem
            key={`payment-record-${item.id}`}
            schoolUrl={school.url ?? ''}
            data={item}
            refetch={refetch}
          />
        )) || []}
      </PaginatedItems>
    </div>
  )
}

export default PaymentRecord
