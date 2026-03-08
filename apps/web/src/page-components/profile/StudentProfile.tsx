import { useCallback, useMemo, useState } from 'react'

import { AvatarIcon } from '@radix-ui/react-icons'
import * as Select from '@radix-ui/react-select'
import useTranslation from 'next-translate/useTranslation'
import { useForm } from 'react-hook-form'
import { FiUser, FiUsers } from 'react-icons/fi'
import { RiLogoutBoxRLine } from 'react-icons/ri'
import { toast } from 'sonner'

import InfoDialog from '@/components/Popups/InfoDialog'
import { useCheckProfile, useLoginWithAliasPassword } from '@/hooks/useProfile'
import { useAuth } from '@/stores/auth'
import { useTabContext } from '@/stores/tabContext'
import { School } from '@/types'
import { AuthState, StudentLoginWithAliasPasswordDto } from '@/types/profile'

import FormLogin from './FormLogin'
import ProfileFound from './ProfileFound'
import ProfileNotFound from './ProfileNotFound'

const StudentProfile = ({ school }: { school: School }): React.ReactElement => {
  const { setCurrentTab } = useTabContext()
  const { t } = useTranslation()
  const { auth, setAuth, clearAuth } = useAuth()

  const [showInfoDialog, setShowInfoDialog] = useState(false)
  const [statusComplete, setStatusComplete] = useState<boolean | undefined>()

  const { mutateAsync: handleCheckProfile, isLoading } = useCheckProfile()
  const { mutateAsync: handleLoginWithAliasPassword, isLoading: isLoginLoading } =
    useLoginWithAliasPassword((result: AuthState) => {
      if (!result.firstName && (result.email || result.phone)) {
        result.firstName = result.email?.split('@').at(0) ?? result.phone
      }
      setStatusComplete(true)
      setAuth(result)

      const currentlyActiveChild = result.listChildren?.find(
        c => c.userAliasId === result.activeUserAliasId
      )

      if (currentlyActiveChild) {
        setAuth({ ...result, currentlyActiveChild })
      } else {
        setAuth(result)
      }
    })

  const handleShowInfoDialog = (value: boolean) => {
    setStatusComplete(undefined)
    setShowInfoDialog(value)
  }

  const handleLogin = useCallback(
    async (values: StudentLoginWithAliasPasswordDto) => {
      try {
        await handleLoginWithAliasPassword({
          phone: values.phone,
          aliasPassword: values.aliasPassword,
          institutionId: school.id,
          name: values.name,
        })
      } catch (error) {
        console.error('Login failed:', error)
        setStatusComplete(false)
      }
    },
    [handleLoginWithAliasPassword, school.id, setAuth]
  )

  const formInstance = useForm<StudentLoginWithAliasPasswordDto>({
    defaultValues: {
      institutionId: school.id,
      phone: '',
      aliasPassword: '',
      name: '',
    },
  })

  const handleProfile = useCallback(() => {
    if (auth?.firstName) {
      setStatusComplete(undefined)
      setShowInfoDialog(false)
      location.replace(`/profile?school=${school.url ?? ''}`)
      return setCurrentTab('profile')
    }
    setShowInfoDialog(!showInfoDialog)
  }, [auth, showInfoDialog, setCurrentTab])

  const contentDialog = useMemo(() => {
    if (statusComplete === false) {
      return (
        <ProfileNotFound
          school={school}
          setShowInfoDialog={handleShowInfoDialog}
          setStatusComplete={setStatusComplete}
        />
      )
    } else if (statusComplete === true) {
      return (
        <ProfileFound
          school={school}
          setShowInfoDialog={handleShowInfoDialog}
          handleProfile={handleProfile}
        />
      )
    }
    return (
      <FormLogin
        form={formInstance}
        handleLogin={handleLogin}
        isLoading={isLoginLoading}
        school={school}
      />
    )
  }, [statusComplete, school, handleProfile, handleLogin, isLoginLoading])

  const onValueChange = async (value: string) => {
    if (value === 'profile') {
      handleProfile()
    } else if (value === 'logout') {
      clearAuth()
      location.replace(`/@${school.url ?? ''}`)
    } else {
      await handleCheckProfile({
        phone: auth?.phone,
        firstName: auth?.firstName,
        institutionId: school.id,
        activeUserAliasId: parseInt(value, 10),
        email: auth?.email,
      })
        .then(res => {
          res.currentlyActiveChild = res.listChildren?.find(
            child => child.userAliasId === res.activeUserAliasId
          )

          if (res.firstName) {
            setAuth(res)
            location.replace(`/profile?school=${school.url ?? ''}`)
          }
        })
        .catch(error => {
          toast.error(error.message || 'Failed to switch profile')
        })
    }
  }

  const renderProfileLabel = () => {
    if (auth.currentlyActiveChild) {
      return (
        <div>
          <div className="text-left text-sm font-bold">{auth.currentlyActiveChild.firstName}</div>
          <div className="text-xs">{t('profile:account.childAccount')}</div>
        </div>
      )
    }

    if (auth.isStudentParent) {
      return (
        <div>
          <div className="text-left text-sm font-bold">{auth.firstName}</div>
          <div className="text-xs">{t('profile:account.parentAccount')}</div>
        </div>
      )
    }

    return <div>{auth.firstName || t('school:profile.login')}</div>
  }

  return (
    <div className="btn-profile">
      <InfoDialog
        key={'dialog-enroll-complete'}
        title={t('school:profile.modalTitle').replace('{{institutionName}}', school.name)}
        description={''}
        trigger={
          <Select.Root onValueChange={onValueChange} value={''} data-testid="login-btn">
            <Select.Trigger
              className="flex max-h-none items-center gap-2 rounded-lg border p-2"
              onClick={() => handleProfile()}
            >
              <Select.Icon>
                <AvatarIcon className="h-6 w-6 rounded-lg object-cover" />
              </Select.Icon>
              <Select.Value placeholder={renderProfileLabel()} />
            </Select.Trigger>
            {!!auth.firstName && (
              <Select.Content
                className="bg-background border-background-layer-3 z-30 min-w-[250px] rounded border p-3 text-sm shadow-sm"
                hidden={!auth.firstName}
              >
                <Select.Viewport className="space-y-2">
                  <Select.Group>
                    <Select.Label className="mb-1 font-bold">
                      {t('profile:account.myAccount')}
                    </Select.Label>
                    <Select.Item
                      value={auth?.userAliasId?.toString() ?? 'profile'}
                      className={[
                        'flex cursor-pointer items-center gap-1 p-2',
                        auth?.userAliasId === auth.activeUserAliasId
                          ? 'bg-primary-subtle rounded-sm font-bold text-[#fff]'
                          : '',
                      ].join(' ')}
                    >
                      <FiUser className="h-4 w-4 rounded-lg object-cover" />
                      <Select.ItemText>{t('profile:account.viewMyProfile')}</Select.ItemText>
                    </Select.Item>
                  </Select.Group>
                  {!!auth?.listChildren?.length && (
                    <>
                      <div className="bg-background-layer-3 h-[1px] w-full" />
                      <Select.Group>
                        <Select.Label className="mb-1 font-bold">
                          {t('profile:account.switchTo')}
                        </Select.Label>
                        <div className="max-h-40 overflow-y-auto">
                          {auth?.listChildren?.map(child => (
                            <Select.Item
                              key={child.userAliasId}
                              value={child?.userAliasId?.toString() ?? 'child-profile'}
                              className={[
                                'flex cursor-pointer items-center gap-2 p-2',
                                child?.userAliasId === auth.activeUserAliasId
                                  ? 'bg-primary-subtle rounded-sm font-bold text-[#fff]'
                                  : '',
                              ].join(' ')}
                            >
                              <FiUsers className="h-4 w-4 rounded-lg object-cover" />
                              <Select.ItemText>{child.firstName}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </div>
                      </Select.Group>
                    </>
                  )}
                  <div className="bg-background-layer-3 h-[1px] w-full" />
                  <Select.Item
                    value="logout"
                    className="text-warn font-bol border-warn flex cursor-pointer items-center gap-2 rounded-md border px-1 py-2"
                  >
                    <RiLogoutBoxRLine className="h-4 w-4 rounded-lg object-cover" />
                    <Select.ItemText>{t('profile:account.logout')}</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            )}
          </Select.Root>
        }
        open={showInfoDialog}
        setOpen={handleProfile}
      >
        {contentDialog}
      </InfoDialog>
    </div>
  )
}

export default StudentProfile
