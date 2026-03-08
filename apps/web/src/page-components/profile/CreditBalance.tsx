import dayjs from 'dayjs'
import useTranslation from 'next-translate/useTranslation'

import Button from '@/components/Buttons/Button'
import useCredit from '@/hooks/useCredit'
import { useAuth } from '@/stores/auth'
import { School } from '@/types'

type CreditBalanceProps = {
  school: School
}

const CreditBalance = ({ school }: CreditBalanceProps) => {
  const { t } = useTranslation()
  const { auth } = useAuth()
  const userAliasId = auth?.userAliasId || 0
  const { useGetCreditBalance, useGetCreditHistory } = useCredit()
  const { data: creditBalance } = useGetCreditBalance(school.id, userAliasId)
  const {
    data: creditHistory,
    hasNextPage,
    fetchNextPage,
  } = useGetCreditHistory(school.id, userAliasId)

  return (
    <div className="border-background-layer-3 mt-4 rounded-lg border p-4">
      <div className="flex flex-col items-center justify-between md:flex-row">
        <div className="flex flex-col items-center justify-center md:items-start">
          <div className="text-xl font-bold">{t('school:credit.currentBalance')}</div>
          <div className="text-backgroundDisabled text-sm">
            {t('school:credit.creditDescription')}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="text-primary text-[45px] font-bold">{creditBalance ?? 0}</div>
          <div className="text-backgroundDisabled text-sm">
            {t('school:credit.availableCredits')}
          </div>
        </div>
      </div>
      <div className="mt-5">
        <div className="font-bold">{t('school:credit.creditHistory')}</div>
        <div className="text-backgroundDisabled text-sm">
          {t('school:credit.creditHistoryDescription')}
        </div>

        <table className="mt-3 border text-sm">
          <thead>
            <tr className="border-b">
              <th className="border-r p-2">{t('school:credit.date')}</th>
              <th className="w-full border-r p-2">{t('school:credit.description')}</th>
              <th className="border-r p-2">{t('school:credit.change')}</th>
              <th className="border-r p-2">{t('school:credit.balance')}</th>
            </tr>
          </thead>
          <tbody>
            {creditHistory?.pages.flatMap(page => {
              return page.items.map((history, idx) => (
                <tr key={history.id ?? idx} className="border-b">
                  <td className="border-r p-2">
                    {dayjs(history.createdAt).format('YYYY/MM/DD HH:mm')}
                  </td>
                  <td className="border-r p-2">{history.description ?? ''}</td>
                  <td
                    className={[
                      'border-r p-2',
                      history.amount > 0 ? 'text-success' : 'text-warn',
                    ].join(' ')}
                  >
                    {history.amount > 0 ? `+${history.amount}` : history.amount}
                  </td>
                  <td className="p-2">{history.balanceAfter}</td>
                </tr>
              ))
            })}
          </tbody>
        </table>

        {hasNextPage && (
          <div className="mt-4 text-center">
            <Button variant="outlined" onClick={() => fetchNextPage()}>
              {t('school:credit.loadMore')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreditBalance
