import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { BiSolidDetail } from 'react-icons/bi'
import { BsFillMoonFill, BsSendFill } from 'react-icons/bs'
import { FaInfinity } from 'react-icons/fa'

// import { FiMoreHorizontal } from 'react-icons/fi'
import DeleteIcon from '@/assets/svgs/DeleteIcon'
import Button from '@/components/Buttons/Button'
import Box from '@/components/Containers/Box'
import DropdownMenu, {
  DropDownMenuItemType,
} from '@/components/DropDownMenus/DropDownMenu'
import SvgIcon from '@/components/Images/SvgIcon'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import ProgressBar from '@/components/ProgressIndicator/ProgressBar'
import Text from '@/components/Texts/Text'
import usePromotionData from '@/hooks/usePromotionData'
import useSchoolData from '@/hooks/useSchoolData'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { CouponStatusEnum } from '@/types/coupon'
import { cn } from '@/utils/cn'
import { formatTs, getFormatDate } from '@/utils/timeFormat'

type CouponCardProps = {
  width?: string
  id: number
  date: string
  code: string
  amount: string
  quota: number
  usage: number
  description: string
  url?: string
  isActive: boolean
  handleReload?: () => void
}

const CouponCard: React.FC<CouponCardProps> = ({
  id,
  date,
  code,
  quota,
  usage,
  amount,
  isActive,
  description,

  handleReload,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { useDeleteCoupon, setCurrentCoupon, useUpdateStatusCoupon } =
    usePromotionData()
  const { schoolData } = useSchoolData()
  const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false)
  const [showConfirmCopyPopup, setShowConfirmCopyPopup] =
    useState<boolean>(false)
  const [showConfirmActivePopup, setShowConfirmActivePopup] =
    useState<boolean>(false)
  const [showConfirmInactivePopup, setShowConfirmInactivePopup] =
    useState<boolean>(false)

  const handleEditCoupon = () => {
    setCurrentCoupon(id)
    navigate('/promotion/coupon-code/detail')
  }
  const handleCopyMessage = (finalText: string) => {
    navigator.clipboard.writeText(finalText)
    setShowConfirmCopyPopup(false)
  }

  const deleteCoupon = useDeleteCoupon()
  const updateStatusCoupon = useUpdateStatusCoupon(id)
  const handleConfirm = async () => {
    await deleteCoupon.mutateAsync(id)
    if (handleReload) {
      handleReload()
    }
  }
  const handleInactive = () => {
    updateStatusCoupon.mutateAsync({
      status: CouponStatusEnum.inActive,
    })
    if (handleReload) {
      handleReload()
    }
  }
  const handleActive = () => {
    updateStatusCoupon.mutateAsync({
      status: CouponStatusEnum.active,
    })
    if (handleReload) {
      handleReload()
    }
  }

  // const disableDelete =
  //   !!isActive ||
  //   (quota === 0 ? quota !== usage : quota === usage) ||
  //   (!!isActive && new Date(date) > new Date())

  const canDelete = !(
    !!isActive ||
    (quota === 0 ? quota !== usage : quota === usage) ||
    (!!isActive && new Date(date) > new Date())
  )

  const menuItems: DropDownMenuItemType[] = [
    {
      type: 'item',
      disabled: false,
      content: (
        <>
          <BiSolidDetail style={{ marginRight: '1.5rem' }} />
          <Text>{t('promotion:action:viewDetail')}</Text>
        </>
      ),
      onClick: () => handleEditCoupon(),
    },
    {
      type: 'separator',
    },
    {
      type: 'item',
      disabled: false,
      content: (
        <>
          <BsSendFill style={{ marginRight: '1.5rem' }} />
          <Text>{t('promotion:action:copyMessage')}</Text>
        </>
      ),
      onClick: () => setShowConfirmCopyPopup(true),
    },
    {
      type: 'separator',
    },
    {
      type: 'item',
      disabled: !isActive,
      content: (
        <>
          <BsFillMoonFill style={{ marginRight: '1.5rem' }} />
          <Text>{t('promotion:action:setAsInactive')}</Text>
        </>
      ),
      onClick: () => setShowConfirmInactivePopup(true),
    },
    {
      type: 'separator',
    },
    // {
    //   type: 'item',
    //   disabled: isActive,
    //   content: (
    //     <>
    //       <SvgIcon css={{ marginRight: '1rem' }}>
    //         <ActiveIcon />
    //       </SvgIcon>
    //       <Text>{t('promotion:action:setAsActive')}</Text>
    //     </>
    //   ),
    //   onClick: () => setShowConfirmActivePopup(true),
    // },
    // {
    //   type: 'separator',
    // },
    {
      type: 'item',
      // disabled: !canDelete,
      // isHidden: !canDelete,
      content: (
        <>
          <SvgIcon className="mr-4">
            <DeleteIcon fill="var(--colors-warn)" />
          </SvgIcon>
          <Text className="text-warn">
            {t('promotion:coupons.deleteCoupon')}
          </Text>
        </>
      ),
      onClick: () => setShowConfirmPopup(true),
    },
  ]

  const messageToBeCopied = `${schoolData.currentSchool?.name} ${t(
    'promotion:dialog:descriptionCopyMessage'
  )} ${amount} ! ${t('promotion:dialog:descriptionCopyMessage1')} ${code} ${t(
    'promotion:dialog:descriptionCopyMessage2'
  )} ${formatTs(date, 'DD MMM YYYY')}`

  return (
    <Box
      data-testid="coupon-card"
      direction="column"
      role="button"
      tabIndex={0}
      onClick={handleEditCoupon}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleEditCoupon()
        }
      }}
      className={cn(
        'relative rounded-lg p-4 overflow-hidden cursor-pointer',
        !isActive
          ? 'bg-background-disabled grayscale'
          : 'bg-background-layer-2 hover:bg-background-layer-3'
      )}
    >
      <Box
        direction="column"
        justify="flex-start"
        align="flex-start"
        className="px-1"
      >
        <Box
          justify="flex-start"
          align="flex-start"
          className="pb-2 text-text-subtle text-sm border-b border-text-disabled"
        >
          {t('promotion:validUntil')}: {getFormatDate(date)}
        </Box>

        <Box justify="flex-start" align="flex-start" className="text-base">
          {t('promotion:discountCode')}: {code}
        </Box>

        <Box
          justify="flex-start"
          align="flex-start"
          className="text-base pb-2 border-b border-text-disabled"
        >
          {t('promotion:amount')}: {amount}
        </Box>

        <Box
          justify="flex-start"
          align="flex-start"
          className="text-sm text-text-subtle"
        >
          {description}
        </Box>
        <Text className="text-base">{t('promotion:totalUsage')}</Text>
        <Box justify="space-between" align="center">
          <ProgressBar percentage={(usage / quota) * 100} />
          <Button
            variants="outlined"
            className="rounded-lg h-[30px] gap-1"
            // css={{ color: '$primary', border: '1px solid', padding: '10' }}
          >
            {`${usage ?? 0} / `}
            {quota > 999999 ? (
              <FaInfinity style={{ marginLeft: '$1' }} />
            ) : (
              quota
            )}
          </Button>
        </Box>
      </Box>

      <div
        role="group"
        className="absolute w-fit top-4 right-4 z-[1]"
        onClick={e => e.stopPropagation()}
      >
        <DropdownMenu
          menuItems={menuItems}
          contentProps={{ minWidth: '16rem', zIndex: 999 }}
        />
      </div>

      <CustomedAlertDialog
        open={showConfirmPopup}
        setOpen={setShowConfirmPopup}
        description={t('promotion:dialog:descriptionAlertDialog')}
        title={`${t('promotion:dialog:titleAlertDialog')}${code}`}
        alertType={AlertTypes.WARN}
        cancelText={t('common:action.cancel') as string}
        actionText={t('common:action.confirm') as string}
        onActionClick={handleConfirm}
      />
      <CustomedAlertDialog
        open={showConfirmActivePopup}
        setOpen={setShowConfirmActivePopup}
        description={t('promotion:dialog:descriptionActiveDialog')}
        title={`${t('promotion:dialog:titleActiveDialog')}`}
        alertType={AlertTypes.WARN}
        cancelText={t('common:action.cancel') as string}
        actionText={t('common:action.confirm') as string}
        onActionClick={handleActive}
      />
      <CustomedAlertDialog
        open={showConfirmInactivePopup}
        setOpen={setShowConfirmInactivePopup}
        description={`${t('promotion:dialog:descriptionInactivelog')}
				${t('promotion:dialog:descriptionAlertDialog')}`}
        title={`${t('promotion:dialog:titleInactiveDialog')}${code}`}
        alertType={AlertTypes.WARN}
        cancelText={t('common:action.cancel') as string}
        actionText={t('common:action.confirm') as string}
        onActionClick={handleInactive}
      />
      <CustomedAlertDialog
        open={showConfirmCopyPopup}
        setOpen={setShowConfirmCopyPopup}
        description={messageToBeCopied}
        title={t('promotion:dialog:titleCopyMessage')}
        alertType={AlertTypes.WARN}
        cancelText={t('common:action.cancel')}
        actionText={t('common:action.copy')}
        onActionClick={() => handleCopyMessage(messageToBeCopied)}
      />
    </Box>
  )
}
export default CouponCard
