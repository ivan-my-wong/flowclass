import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { BiTrash } from 'react-icons/bi'
import { GiHamburgerMenu } from 'react-icons/gi'
import { LuPencil } from 'react-icons/lu'
import { useRecoilState } from 'recoil'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import useGlobalConfirm from '@/hooks/useGlobalConfirm'
import usePayoutData from '@/hooks/usePayoutData'
import { AlertTypes, ConfirmOptionsType } from '@/reducers/confirm.reducers'
import payoutData from '@/stores/payoutData'
import { Payout } from '@/types/payout'

type PropsType = {
  payment: Payout
} & React.ComponentPropsWithoutRef<'div'>
const PaymentAction = ({ payment }: PropsType): React.ReactElement => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { useDeletePayoutMethod } = usePayoutData()
  const [isOpen, setIsOpen] = useState(false)
  const [payoutState, setPayoutState] = useRecoilState(payoutData)
  const { mutateAsync, isLoading } = useDeletePayoutMethod(() => {
    closeConfirm()
  })
  useEffect(() => {
    // We need to set style of body to empty string because:
    // When go to edit page that the dropdown state is open, the dropdown component set style of body to cursor-pointer: none
    // And after user back to setting payments page there is nothing the user can click. So we need to set style of body to empty string
    document.querySelector('body')?.setAttribute('style', '')
  }, [pathname])

  const { setConfirm, closeConfirm } = useGlobalConfirm(isLoading)
  const confirmParams = useMemo<ConfirmOptionsType>(() => {
    return {
      title: t('payout:deletePayment.title').toString(),
      description: t('payout:deletePayment.description').toString(),
      cancelText: t('common:action.cancel') as string,
      confirmText: t('common:action.confirm') as string,
      alertType: AlertTypes.WARN,
      onConfirm: async () => {
        await mutateAsync({
          institutionId: payment.institutionId,
          siteId: payment.siteId,
          id: payment.id as number,
        })
      },
    }
  }, [mutateAsync, payment, t])
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        className="p-1 rounded-full ml-2"
        data-testid="action-btn"
      >
        <GiHamburgerMenu className="h-6 w-6" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            navigate(`/settings/payments/${payment.id}/edit`)
            // Set payout data to store
            setPayoutState({
              ...payoutState,
              payout: payment,
            })
          }}
        >
          <LuPencil
            fill="currentColor"
            size={24}
            strokeWidth={0.5}
            stroke="white"
            className="text-primary mr-2"
          />
          Edit payment method
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setConfirm(confirmParams).open()}
        >
          <BiTrash
            fill="currentColor"
            size={24}
            strokeWidth={0.5}
            stroke="white"
            className="text-red-500 mr-2"
          />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default PaymentAction
