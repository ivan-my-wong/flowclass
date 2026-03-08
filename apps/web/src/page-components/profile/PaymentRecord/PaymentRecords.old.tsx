import dayjs from 'dayjs'
import useTranslation from 'next-translate/useTranslation'
import { toast } from 'sonner'

import Button from '@/components/Buttons/Button'
import PaginatedItems from '@/components/Containters/Pagination'
import { useGetPaymentRecords, useResendPaymentRecord } from '@/hooks/useProfile'
import { School } from '@/types'
import { getPriceWithCurrency } from '@/utils/string.utils'

import ViewPaymentProof from '../ViewPaymentProof'

const PaymentRecord = ({ school }: { school: School }): React.ReactElement => {
  const { t } = useTranslation()

  const { data } = useGetPaymentRecords({ institutionId: school.id })
  const { mutateAsync: handleResend } = useResendPaymentRecord()

  return (
    <PaginatedItems itemsPerPage={10}>
      {data?.map(item => {
        const paymentMethod = item.paymentMethod?.replace('_', ' ')?.toLowerCase()
        return (
          <div
            key={item.id}
            data-testid={item.id}
            className="bg-background-layer-2 flex w-full flex-col items-start justify-between gap-4 rounded-md p-4 md:flex-row"
          >
            <div className="w-full space-y-1">
              <div className="text-2xl font-bold">
                {getPriceWithCurrency(item.currency, item.payAmount) ?? ''}
              </div>
              <div>{dayjs(item.createdAt).format('YYYY/MM/DD hh:mm:ss a')}</div>
              <div>{`Course Name: ${item.course?.name}`}</div>
              <div>{`Class Name: ${item?.classes?.map(o => o.name).join(', ')}`}</div>
              <div className="capitalize">{`Payment Method: ${paymentMethod}`}</div>
            </div>
            <div className="flex w-full flex-col gap-4 md:flex-row">
              <Button
                className="h-[35px] w-full text-sm md:w-[210px]"
                onClick={() =>
                  handleResend({
                    invoices: [{ invoiceId: item.id, proofToken: item.proofToken }],
                  }).then(() => {
                    toast.success(t('school:profile.successResend') as string)
                  })
                }
              >
                {t('school:profile.resendPaymentRecord')}
              </Button>
              <ViewPaymentProof image={item.paymentProof} />
            </div>
          </div>
        )
      }) || []}
    </PaginatedItems>
  )
}

export default PaymentRecord
