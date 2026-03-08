import { forwardRef, useImperativeHandle, useRef, useState } from 'react'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { LuX } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import useCredit from '@/hooks/useCredit'
import { CreditTransactionType } from '@/types/credit'

import AddOrDeductCreditModal, {
  AddOrDeductCreditModalHandle,
} from './AddOrDeductCreditModal'

type CreditBalanceModalProps = { userAliasId: number }

export type CreditBalanceModalHandle = {
  handleOpenChange: () => void
}

const CreditBalanceModal = forwardRef<
  CreditBalanceModalHandle,
  CreditBalanceModalProps
>(({ userAliasId }, ref) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [filterType, setFilterType] = useState<'all' | 'added' | 'deducted'>(
    'all'
  )

  const { t } = useTranslation()

  // Refs for add and deduct credit modals
  const addCreditModalRef = useRef<AddOrDeductCreditModalHandle>(null)
  const deductCreditModalRef = useRef<AddOrDeductCreditModalHandle>(null)

  const handleOpenChange = () => {
    setIsOpen(open => !open)
  }

  const handleAddCredit = () => {
    addCreditModalRef.current?.handleOpenChange()
  }

  const handleDeductCredit = () => {
    deductCreditModalRef.current?.handleOpenChange()
  }

  useImperativeHandle(ref, () => ({
    handleOpenChange,
  }))

  // Determine transaction type for API call based on filter
  let transactionType: CreditTransactionType | undefined
  if (filterType === 'added') transactionType = CreditTransactionType.ADDED
  else if (filterType === 'deducted')
    transactionType = CreditTransactionType.DEDUCTED

  const { useGetCreditBalance, useGetCreditHistory } = useCredit()
  const { data: creditBalance } = useGetCreditBalance(userAliasId, isOpen)
  const {
    data: creditHistory,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    refetch: refetchCreditHistory,
  } = useGetCreditHistory(userAliasId, transactionType, isOpen)

  // Get transactions sorted by createdAt desc (newest first)
  const transactions =
    creditHistory?.pages.flatMap(page =>
      // Sort each page's items by createdAt desc and id desc for stable ordering
      [...page.items].sort((a, b) => {
        const dateCompare = dayjs(b.createdAt).diff(dayjs(a.createdAt))
        if (dateCompare !== 0) return dateCompare
        // If same timestamp, use id for stable ordering
        return (b.id ?? 0) - (a.id ?? 0)
      })
    ) || []

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 pb-0">
            <div className="text-center w-full">
              <DialogTitle className="text-lg font-semibold text-gray-900 mb-2">
                {t('student:credit.balance.title')}
              </DialogTitle>
              <p className="text-sm text-gray-600 mb-4">
                {t('student:credit.balance.subtitle')}
              </p>
            </div>
            <DialogClose className="absolute top-4 right-4">
              <LuX className="text-lg" />
            </DialogClose>
          </div>

          {/* Current Balance Section */}
          <div className="px-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {creditBalance ?? 0}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {t('student:credit.balance.available')}
              </div>
              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={handleDeductCredit}
                  disabled={!creditBalance || creditBalance <= 0}
                >
                  {t('student:credit.actions.deductCredits')}
                </Button>
                <Button
                  variant="default"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleAddCredit}
                >
                  {t('student:credit.actions.addCredits')}
                </Button>
              </div>
            </div>
          </div>

          {/* Usage & Change History Section */}
          <div className="p-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('student:credit.history.title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('student:credit.history.subtitle')}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex justify-center mb-6">
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                {(['all', 'added', 'deducted'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      filterType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setFilterType(type)}
                  >
                    {type === 'all' && t('student:credit.filter.all')}
                    {type === 'added' && t('student:credit.filter.added')}
                    {type === 'deducted' && t('student:credit.filter.deducted')}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction History Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">
                      {t('student:credit.history.date')}
                    </TableHead>
                    <TableHead>
                      {t('student:credit.history.description')}
                    </TableHead>
                    <TableHead className="w-[100px] text-right">
                      {t('student:credit.history.change')}
                    </TableHead>
                    <TableHead className="w-[100px] text-right">
                      {t('student:credit.history.balance')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    if (isLoading) {
                      return (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-8 text-gray-500"
                          >
                            {t('student:credit.history.loadingTransactions')}
                          </TableCell>
                        </TableRow>
                      )
                    }

                    if (transactions.length === 0) {
                      return (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-8 text-gray-500"
                          >
                            {t('student:credit.history.noTransactionsFound')}
                          </TableCell>
                        </TableRow>
                      )
                    }

                    return transactions.map((history, idx) => {
                      const isPositive = history.amount > 0

                      return (
                        <TableRow
                          key={history.id ?? idx}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="text-gray-600">
                            {dayjs(history.createdAt).format('YYYY/M/D')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  isPositive ? 'bg-green-500' : 'bg-red-500'
                                }`}
                              />
                              <span className="text-gray-900">
                                {history.description ??
                                  t(
                                    'student:credit.history.defaultDescription'
                                  )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`font-medium ${
                                isPositive ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {isPositive
                                ? `+${history.amount}`
                                : history.amount}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-gray-600">
                            {history.balanceAfter}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  })()}
                </TableBody>
              </Table>
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  className="text-gray-600 border-gray-300 hover:bg-gray-50"
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage
                    ? t('student:credit.history.loading')
                    : t('student:credit.history.loadMore')}
                </Button>
              </div>
            )}

            {/* Transaction Count */}
            {transactions.length > 0 && (
              <div className="text-center mt-4 text-sm text-gray-500">
                {t('student:credit.history.showingTransactions', {
                  count: transactions.length,
                })}
                {filterType !== 'all' &&
                  ` (${t(
                    `student:credit.history.${
                      filterType === 'added' ? 'additions' : 'deductions'
                    }`
                  )})`}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Credit Modal */}
      <AddOrDeductCreditModal
        ref={addCreditModalRef}
        userAliasId={userAliasId}
        transactionType={CreditTransactionType.ADDED}
        refetchCreditHistory={refetchCreditHistory}
      />

      {/* Deduct Credit Modal */}
      <AddOrDeductCreditModal
        ref={deductCreditModalRef}
        userAliasId={userAliasId}
        transactionType={CreditTransactionType.DEDUCTED}
        refetchCreditHistory={refetchCreditHistory}
      />
    </>
  )
})

export default CreditBalanceModal
