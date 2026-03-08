import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import { deleteAccount } from '@/api/auth'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import Spacer from '@/components/Separators/Spacer'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import ContentLayout from '@/layouts/ContentLayout'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { userState } from '@/stores/userData'
import { cn } from '@/utils/cn'

const DeleteAccount = () => {
  const [showConfirmPopup, setShowConfirmPopup] = useState(false)
  const [showFinalPopup, setShowFinalPopup] = useState(false)
  const [isInputValid, setIsInputValid] = useState(true)
  const [showAction, setShowAction] = useState(false)
  const { t } = useTranslation()

  const handleConfirm = () => {
    setIsInputValid(true)
    setShowFinalPopup(true)
  }

  const user = useRecoilValue(userState)

  const handleDeleteAccount = async () => {
    if (user && user.id) {
      await deleteAccount(user.id)

      toast.success(t('account:deleteAccount.successDelete'))
      localStorage.clear()
      window.location.href = '/login'
      window.location.reload()
    }
  }
  const headerBackButton: HeaderBackButtonStatus = {
    title: t(`account:account`),
    mode: 'add',
  }

  return (
    <ContentLayout headerBackButton={headerBackButton}>
      <Box padding="base" direction="col" align="start" gap="lg">
        <Heading>{t('account:deleteAccount.deleteAccount')}</Heading>
        <Text className={cn('w-[60%] sm:w-full')}>
          {t('account:deleteAccount.notice1')}
        </Text>
        <Text className={cn('w-[60%] sm:w-full')}>
          {t('account:deleteAccount.notice2')}
        </Text>
        <Text className={cn('w-[60%] sm:w-full')}>
          {t('account:deleteAccount.notice3')}
        </Text>
        <Spacer space="y2" />
        <Button
          color="warn"
          onClick={() => {
            setShowConfirmPopup(true)
          }}
        >
          {t('account:deleteAccount.goToConfirm')}
        </Button>
        <Text> {t('account:deleteAccount.willNotDelete')}</Text>
        {isInputValid && (
          <CustomedAlertDialog
            open={showFinalPopup}
            setOpen={setShowFinalPopup}
            alertType={AlertTypes.WARN}
            description={t('account:deleteAccount.description') as string}
            title={t('account:deleteAccount.title') as string}
            cancelText={t('account:deleteAccount.cancel') as string}
            actionText={t('account:deleteAccount.confirm') as string}
            onActionClick={async () => {
              await handleDeleteAccount()
            }}
          />
        )}

        <CustomedAlertDialog
          open={showConfirmPopup}
          setOpen={setShowConfirmPopup}
          alertType={AlertTypes.WARN}
          description={t('account:deleteAccount.textInput') as string}
          title={t('account:deleteAccount.title') as string}
          inputRequired
          isInputValid={showAction}
          cancelText={t('account:deleteAccount.cancel') as string}
          actionText={
            showAction ? (t('account:deleteAccount.confirm') as string) : ''
          }
          onInputChange={value => {
            if (value === 'delete') {
              setShowAction(true)
            } else {
              setShowAction(false)
            }
          }}
          onActionClick={handleConfirm}
        />
      </Box>
    </ContentLayout>
  )
}

export default DeleteAccount
