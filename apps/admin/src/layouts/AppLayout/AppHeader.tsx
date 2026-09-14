import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { FaWhatsapp } from 'react-icons/fa'
import {
  LuCreditCard,
  LuLogOut,
  LuPen,
  LuRocket,
  LuSchool,
  LuUser,
} from 'react-icons/lu'
import { MdAccountCircle } from 'react-icons/md'
import { CSSTransition } from 'react-transition-group'
import { useRecoilValue } from 'recoil'

import flowclassLogo from '@/assets/logos/flowclass.png'
import MenuIcon from '@/assets/svgs/MenuIcon'
import ViewSiteButton from '@/components/Buttons/ViewSite'
import DropdownMenu, {
  DropDownMenuItemType,
} from '@/components/DropDownMenus/DropDownMenu'
import ImageAspect from '@/components/Images/ImageAspect'
import SvgIcon from '@/components/Images/SvgIcon'
import MenuBar from '@/components/MenuBar'
import SchoolSelector from '@/components/Selector/SchoolSelector'
import SiteSelector from '@/components/Selector/SiteSelector'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { WhatsAppSupportLinks } from '@/constants/guides'
import useAuth from '@/hooks/useAuth'
import { useResponsive } from '@/hooks/useResponsive'
import useSiteData from '@/hooks/useSiteData'
import { userState } from '@/stores/userData'
import { userPermissionState, UserRole } from '@/stores/userPermissionData'
import { styled } from '@/styles'
import { cn } from '@/utils/cn'

import SubscriptionPlanInfo from './SubscriptionPlanInfo'

const MobileHeader = styled('header', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$2 $3 $2 $3',
  color: '$primary',
  height: '100%',
})

const DesktopHeader = styled('header', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$2 $4',
  color: '$primary',
  height: '100%',
})

const MenuBarLayer = styled('div', {
  width: '18rem',
  boxShadow: '$2',
  backgroundColor: '$backgroundLayer2',
})

const MenuBarContainer = styled('div', {
  position: 'fixed',
  top: '0',
  left: '0',
  width: '100vw',
  height: '100vh',

  '.menubar-enter': {
    transform: 'translateX(-100%)',
  },
  '.menubar-enter-active': {
    transform: 'translateX(0)',
    transition: 'transform 300ms',
  },
  '.menubar-exit': {
    transform: 'translateX(0)',
  },
  '.menubar-exit-active': {
    transform: 'translateX(-100%)',
    transition: 'transform 300ms',
  },
})

const AppHeader: React.FC = () => {
  const { isMobile } = useResponsive()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const nodeRef = useRef(null)
  const navigate = useNavigate()

  const { logout } = useAuth()
  const { t } = useTranslation()

  const { siteData } = useSiteData()

  const { currentSite } = siteData
  // eslint-disable-next-line no-restricted-globals
  const isSitePage = location.pathname.includes('/site')

  const userPermission = useRecoilValue(userPermissionState)
  const userData = useRecoilValue(userState)

  const handleNavigate = () => {
    if (userPermission === UserRole.MasterAdmin) {
      navigate('/site', { replace: true })
    }
    if (userPermission === UserRole.Instructor) {
      navigate(`/settings/users/profile?userId=${userData.id}&view=profile`, {
        replace: true,
      })
    }
    if (
      userPermission !== UserRole.MasterAdmin &&
      userPermission !== UserRole.Instructor
    ) {
      navigate('/home', { replace: true })
    }
  }

  const accountMenuItems: DropDownMenuItemType[] = [
    {
      type: 'item',
      content: (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div
          className="flex items-center gap-2"
          onClick={() => {
            window.open(WhatsAppSupportLinks.whatsappHelp, '_blank')
          }}
        >
          <FaWhatsapp className="text-success mr-4 text-2xl" />
          <p>{t('component:menubar.support')}</p>
        </div>
      ),
    },

    {
      type: 'separator',
    },
    {
      type: 'item',
      content: (
        <>
          <LuPen className="text-2xl mr-4" />
          <Text>{t('component:menubar.profile')}</Text>
        </>
      ),
      onClick: () => {
        navigate('/account')
      },
    },

    {
      type: 'language',
    },

    {
      type: 'separator',
    },

    {
      type: 'item',
      content: (
        <>
          <LuLogOut className="text-warn mr-4 text-2xl" />

          <Text className="text-warn">{t('component:menubar.logout')}</Text>
        </>
      ),
      onClick: async () => {
        await logout()
        navigate('/login')
        window.location.reload()
      },
    },
  ]

  const subscriptionMenuItems: DropDownMenuItemType[] = [
    {
      type: 'item',
      content: (
        <>
          <LuRocket className="mr-4 text-2xl" />

          <p>{t('component:menubar.visitSubscription')}</p>
        </>
      ),
      onClick: () => {
        navigate('/subscription')
      },
    },
    {
      type: 'item',
      content: <SubscriptionPlanInfo />,
    },
  ]

  const RightHeader = (): JSX.Element => {
    if (isMobile) {
      return (
        <div className="box-row-full gap-3 justify-end mr-1">
          <DropdownMenu
            menuItems={subscriptionMenuItems}
            contentProps={{ minWidth: '16rem', zIndex: 999 }}
            trigger={<LuCreditCard className="text-2xl text-text-subtle" />}
          />

          <DropdownMenu
            menuItems={accountMenuItems}
            contentProps={{ minWidth: '16rem', zIndex: 999 }}
            trigger={<LuUser className="text-2xl text-text-subtle" />}
          />
        </div>
      )
    }

    return (
      <Box
        justify="end"
        className={cn({
          'gap-0': isMobile,
          'gap-4': !isMobile,
        })}
      >
        {(userPermission === UserRole.MasterAdmin ||
          userPermission === UserRole.SiteAdmin) && (
          <Button
            iconBefore={<LuCreditCard size={18} />}
            variant="ghost"
            onClick={() => navigate('/subscription')}
          >
            {t('subscription:headerBtnViewSubscription')}
          </Button>
        )}
        <DropdownMenu
          data-testid="account-top-right-menu"
          menuItems={accountMenuItems}
          contentProps={{ minWidth: '16rem', zIndex: 999 }}
          trigger={
            <span className="flex gap-x-2 items-center">
              <MdAccountCircle size="1.7rem" />
              <span className="text-gray-700 dark:text-white">
                {' '}
                {userData.firstName}
              </span>
            </span>
          }
        />
      </Box>
    )
  }

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev)
  }

  if (!isMobile) {
    return (
      <DesktopHeader>
        <Box align="center" justify="start">
          {currentSite?.logo ? (
            <ImageAspect
              onClick={() => handleNavigate()}
              className="cursor-pointer"
              s3="public"
              width="3rem"
              ratio={1 / 1}
              src={currentSite.logo}
              alt="School"
            />
          ) : (
            <ImageAspect
              onClick={() => handleNavigate()}
              className="cursor-pointer"
              width="8rem"
              ratio={5.4 / 1}
              src={flowclassLogo}
              alt="Flowclass Logo"
            />
          )}

          {isSitePage ? (
            <SiteSelector />
          ) : (
            <>
              <SchoolSelector triggerVariant="compact" />
              {(userPermission === UserRole.MasterAdmin ||
                userPermission === UserRole.SiteAdmin) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate('/site')
                  }}
                  iconBefore={<LuSchool />}
                >
                  {t('school:headings.allSchools')}
                </Button>
              )}
            </>
          )}

          <ViewSiteButton variant="primary-outline" size="sm" />
        </Box>
        <RightHeader />
      </DesktopHeader>
    )
  }
  return (
    <>
      <MobileHeader>
        <ImageAspect
          src={flowclassLogo}
          alt="Flowclass"
          width="10rem"
          ratio={5.4 / 1}
          onClick={() => handleNavigate()}
        />
        <Box justify="end">
          <RightHeader />

          <SvgIcon onClick={toggleMenu} css={{ cursor: 'pointer' }}>
            <MenuIcon />
          </SvgIcon>
        </Box>
      </MobileHeader>
      <CSSTransition
        in={isMenuOpen}
        nodeRef={nodeRef}
        timeout={300}
        classNames="menubar"
        unmountOnExit
      >
        <MenuBarContainer onClick={toggleMenu}>
          <MenuBarLayer ref={nodeRef}>
            <MenuBar />
          </MenuBarLayer>
        </MenuBarContainer>
      </CSSTransition>
    </>
  )
}

export default AppHeader
