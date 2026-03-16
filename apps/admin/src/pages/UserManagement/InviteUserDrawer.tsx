import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import Drawer from '@/components/Drawer/Drawer'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import Heading from '@/components/Texts/Heading'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import Form from '@/components/ui/Form'
import Text from '@/components/ui/Text'
import useUsersManagement from '@/hooks/useUsersManagement'
import ContentLayout from '@/layouts/ContentLayout'
import { InviteUserFormData } from '@/types/userManagement'
import { cn } from '@/utils/cn'

import InviteForm from './InviteForm'
import InviteSuccessfully from './InviteSuccessfully'

type InviteUserDrawerProps = {
  onClose: () => void
  open: boolean
}

const InviteUserDrawer = ({
  onClose,
  open,
}: InviteUserDrawerProps): JSX.Element => {
  const { t } = useTranslation()
  const formData = useForm<InviteUserFormData>()
  const headerBackButton: HeaderBackButtonStatus = {
    mode: 'back',
    action: () => {
      onClose()
    },
  }

  const { useInviteUser } = useUsersManagement()
  const {
    mutateAsync: mutateAsyncInviteUser,
    isLoading: isLoadingInviteUser,
    data: inviteSuccessResponse,
  } = useInviteUser()

  const handleConfirm: SubmitHandler<InviteUserFormData> = async data => {
    await mutateAsyncInviteUser(data)
  }

  return (
    <Drawer open={open} onClose={onClose}>
      <ContentLayout
        headerBackButton={headerBackButton}
        leftHeader={
          <Heading bold className="text-base">
            {t('setting:userManagement.inviteNewUser')}
          </Heading>
        }
        rightHeader={
          <Box className={cn(inviteSuccessResponse && 'hidden')}>
            <Button
              variant="ghost"
              disabled={isLoadingInviteUser}
              onClick={onClose}
              data-testid="cancel-invite-user-button"
            >
              {t('common:action.cancel')}
            </Button>

            <Button
              loading={isLoadingInviteUser}
              onClick={formData.handleSubmit(handleConfirm)}
              data-testid="invite-user-button"
            >
              {t('common:action.confirm')}
            </Button>
          </Box>
        }
      >
        <Form {...formData}>
          <form
            onSubmit={formData.handleSubmit(handleConfirm)}
            className="mt-2 w-full"
          >
            <Box direction="col" align="start" padding="sm">
              {!inviteSuccessResponse && <InviteForm />}
              {inviteSuccessResponse &&
                !isLoadingInviteUser &&
                inviteSuccessResponse.length > 0 && (
                  <InviteSuccessfully
                    inviteSuccessResponse={inviteSuccessResponse[0]}
                  />
                )}
            </Box>
          </form>
        </Form>
      </ContentLayout>
    </Drawer>
  )
}

export default InviteUserDrawer
