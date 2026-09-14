import React from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuArrowRight, LuCrown, LuInfo, LuX } from 'react-icons/lu'
import { useRecoilState, useRecoilValue } from 'recoil'

import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Separator } from '@/components/ui/Separator'
import {
  schoolSubscriptionState,
  subscriptionDialogOpenState,
} from '@/stores/schoolSubscriptionData'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/currency'

const SubscriptionDialog: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [dialog, setDialog] = useRecoilState(subscriptionDialogOpenState)
  const schoolSubscription = useRecoilValue(schoolSubscriptionState)

  const handleClose = () => {
    setDialog({ open: false, message: null })
  }

  const handleUpgrade = () => {
    handleClose()
    navigate('/subscription/create-subscription')
  }

  if (!dialog.open) return null

  const { activePlan } = schoolSubscription

  const currentPlanTier = activePlan?.customerSupportTier || 'FREE_TIER'
  const totalPrice = activePlan?.totalPrice || 0
  const expiryDate = activePlan?.expiryDate
  const isTrial = activePlan?.isTrial || false

  const formatPlanTier = (tier: string) => {
    return tier.replace('_TIER', '').replace('_', ' ')
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const getPlanBadgeStyle = (isTrial: boolean, currentPlanTier: string) => {
    if (isTrial) return 'bg-orange-100 text-orange-800'
    if (currentPlanTier === 'FREE_TIER') return 'bg-gray-100 text-gray-800'
    return 'bg-blue-100 text-blue-800'
  }

  return (
    <Dialog open={dialog.open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <LuCrown className="h-6 w-6 text-secondary" />
            {t('subscription:upgradeRequired')}
          </DialogTitle>
        </DialogHeader>

        <div className="box-col px-4 pb-6">
          {/* Upgrade Message */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <LuInfo className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              {dialog.message ||
                t('subscription:subscriptionDialog.upgradePlan')}
            </div>
          </div>

          <Separator />

          {/* Current Subscription Status */}
          <div className="box-col-full">
            <h3 className="font-semibold text-sm text-gray-900">
              {t('subscription:currentSubscription')}
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">
                  {t('subscription:currentPlan')}
                </span>
                <div className="font-medium mt-1">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      getPlanBadgeStyle(isTrial, currentPlanTier)
                    )}
                  >
                    {isTrial && '🎯 '}
                    {formatPlanTier(currentPlanTier)}
                    {isTrial && ' Trial'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-gray-500">
                  {t('subscription:monthlyPrice')}
                </span>
                <div className="font-medium mt-1">
                  {totalPrice > 0
                    ? formatCurrency(totalPrice, 'HKD')
                    : t('subscription:free')}
                </div>
              </div>

              {expiryDate && (
                <>
                  <div>
                    <span className="text-gray-500">
                      {t('subscription:expiryDate')}
                    </span>
                    <div className="font-medium mt-1">
                      {formatDate(expiryDate)}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500">
                      {t('subscription:status')}
                    </span>
                    <div className="font-medium mt-1">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          new Date(expiryDate) > new Date()
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        )}
                      >
                        {new Date(expiryDate) > new Date()
                          ? t('subscription:active')
                          : t('subscription:expired')}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Upgrade Benefits */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">
              {t('subscription:upgradeToUnlock')}
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                {t('subscription:benefits.moreFeatures')}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                {t('subscription:benefits.higherLimits')}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                {t('subscription:benefits.prioritySupport')}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              {t('common:action.cancel')}
            </Button>
            <Button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <span className="flex items-center gap-2">
                {t('subscription:upgradeNow')}
                <LuArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SubscriptionDialog
