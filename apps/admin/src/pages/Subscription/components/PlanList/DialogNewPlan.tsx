import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { BsBook, BsLightningCharge, BsWindowDesktop } from 'react-icons/bs'
import { FaChevronRight } from 'react-icons/fa'
import { RiChat3Line } from 'react-icons/ri'
import { useRecoilValue } from 'recoil'

import { Card } from '@/components/ui/Card'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { allSubscribedPlans } from '@/stores/subscription'
import { PlanType } from '@/types/schoolSubscriptionPlan'

import NewPlanSelection from './NewPlanSelection'

export type PlanCategory = {
  type: string
  multipleChoices: boolean
  icon: JSX.Element
}

const planCategories: PlanCategory[] = [
  {
    type: 'NOTIFICATION_CHANNEL',
    multipleChoices: false,
    icon: (
      <RiChat3Line
        size={45}
        className="bg-blue-100 text-blue-900 rounded-lg p-3"
      />
    ),
  },
  {
    type: 'CLASS_TYPE',
    icon: (
      <BsBook size={45} className="bg-blue-100 text-blue-900 rounded-lg p-3" />
    ),
    multipleChoices: true,
  },
  {
    type: 'FEATURE_ENABLE',
    icon: (
      <BsLightningCharge
        size={45}
        className="bg-blue-100 text-blue-900 rounded-lg p-3"
      />
    ),
    multipleChoices: true,
  },
  {
    type: 'PROMOTION_FEES',
    icon: (
      <BsWindowDesktop
        size={45}
        className="bg-blue-100 text-blue-900 rounded-lg p-3"
      />
    ),
    multipleChoices: false,
  },
]

interface Props {
  open: boolean
  onClose: () => void
}

const CreateNewPlan: React.FC<Props> = ({ open, onClose }): JSX.Element => {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState<PlanCategory | null>(
    null
  )
  const subscribedPlans = useRecoilValue(allSubscribedPlans)

  const usedCategories = useMemo(() => {
    return planCategories.filter(category => {
      const subscribedPlansExceptFree = subscribedPlans
        .filter(item => item.price)
        .map(item => item.type)
      const { type } = category
      if (
        type === PlanType.NOTIFICATION_CHANNEL ||
        type === PlanType.PROMOTION_FEES
      ) {
        return !subscribedPlansExceptFree.includes(type)
      }
      return true
    })
  }, [subscribedPlans])

  const renderCategorySelection = () => {
    return (
      <>
        <div className="font-semibold mb-1">
          {t('subscription:addPlan.selectCatLabel')}
        </div>
        <DialogDescription className="mb-6 font-medium text-gray-600">
          {t('subscription:addPlan.dialogDes')}
        </DialogDescription>
        {usedCategories.map(category => (
          <Card
            key={category.type}
            className="p-4 transition delay-75 duration-100 ease-out rounded-lg shadow-none cursor-pointer border-gray-200 bg-gray-50 hover:bg-gray-100 relative mb-4"
            onClick={() => setSelectedCategory(category)}
          >
            <div className="flex items-center gap-3">
              {category.icon}
              <div className="text-sm">
                <div className="font-semibold text-gray-900">
                  {t(`subscription:planType.${category.type}.title`)}
                </div>
                <div className="text-gray-500">
                  {t(`subscription:planType.${category.type}.desc`)}
                </div>
              </div>
              <FaChevronRight className="text-gray-400 ml-auto" />
            </div>
          </Card>
        ))}
      </>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="lg:max-w-[700px]">
        <DialogHeader className="sticky top-0 z-10">
          <DialogTitle>{t('subscription:addPlan.dialogTitle')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {selectedCategory ? (
            <NewPlanSelection
              planType={selectedCategory}
              onBack={() => setSelectedCategory(null)}
              onSubmitted={onClose}
            />
          ) : (
            renderCategorySelection()
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

export default CreateNewPlan
