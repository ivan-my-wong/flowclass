import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import { useResponsive } from '@/hooks/useResponsive'
import useSiteData from '@/hooks/useSiteData'
import useSitesFeatureEnabled from '@/hooks/useSiteFeatureEnableData'
import { schoolSubscriptionState } from '@/stores/schoolSubscriptionData'
import { userState } from '@/stores/userData'
import { userPermissionState, UserRole } from '@/stores/userPermissionData'
import { styled, theme } from '@/styles'

import ViewSiteButton from '../Buttons/ViewSite'
import SvgIcon from '../Images/SvgIcon'
import SkeletonLoader from '../Loaders/SkeletonLoader'
import SchoolSelector from '../Selector/SchoolSelector'
import Text from '../Texts/Text'

import menuItems, {
  buildMenuItems,
  FeatureMenu,
  FeatureSiteMap,
} from './menuBarItems'
import { siteMenuItems } from './menuBarSiteItems'

const MenuBarContainer = styled('nav', {
  width: '15.5rem',
  backgroundColor: '$backgroundLayer2',
  borderRight: `2px solid $colors$backgroundLayer3`,
  height: '100%',
  overflowY: 'auto',
  paddingLeft: '$2',
  paddingRight: '$2',
  paddingBottom: '$4',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',

  '@sm': {
    width: '100%',
    height: '100vh',
    paddingBottom: '$16',
  },
})

const MenuItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  marginTop: '$3',
  width: '90%',

  padding: '$2',
  textDecoration: 'none',
  transition: 'background-color 0.2s ease',

  cursor: 'pointer',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  borderRadius: '0.5rem',

  fontSize: '0.95rem',

  '.menuItemText': {
    fontSize: '0.95rem',
    lineHeight: '$4',
    marginLeft: '$4',
  },

  '&:hover': {
    color: '$primary',
    svg: {
      stroke: '$primary',
      color: '$primary',
    },
    '#whatsappTemplate svg': {
      fill: '$primary',
      stroke: 'none',
    },
  },

  '@md': {
    width: '95%',
  },

  variants: {
    active: {
      true: {
        backgroundColor: 'white',
        color: '$primary',
      },
    },
    noHover: {
      true: {
        '&:hover': {
          backgroundColor: 'unset',
          color: 'unset',
        },
      },
    },
  },
})

const MenuBar: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { siteData, useFetchAllSiteData } = useSiteData()
  const { isLoading } = useFetchAllSiteData()
  const { isMobile } = useResponsive()
  const { useFetchSitesFeatureEnabled } = useSitesFeatureEnabled()
  const { data: sitesFeatureEnabled } = useFetchSitesFeatureEnabled()
  const userPermission = useRecoilValue(userPermissionState)
  const currentUser = useRecoilValue(userState)
  const { activePlan } = useRecoilValue(schoolSubscriptionState)

  // This allows the switch from school to site
  const isSitePage = location.pathname.includes('/site')

  // const isSitePage = false

  const featureSitesMap = useMemo<FeatureSiteMap>(() => {
    if (!sitesFeatureEnabled) return new Map()
    const newMap = new Map()
    sitesFeatureEnabled.forEach(d => {
      newMap.set(d.feature, d.siteIds)
    })
    return newMap
  }, [sitesFeatureEnabled])
  const filteredMenuItems = useMemo(() => {
    if (isSitePage) {
      return siteMenuItems.filter(
        item =>
          item.permissions.length === 0 ||
          item.permissions.includes(userPermission)
      )
    }

    return buildMenuItems(featureSitesMap).filter(item => {
      const limitedFeatures = Object.values(FeatureMenu)
      if (userPermission === UserRole.MasterAdmin) {
        return true
      }
      if (
        limitedFeatures.includes(item.label as FeatureMenu) &&
        item.availableSites
      ) {
        return item.availableSites.includes(siteData.currentSite?.id ?? 0)
      }
      if (item.path === '#' && item.permissions.length === 0) {
        return true
      }

      // No need hide the path right now. Instead, I will show a screen to tell user to subscribe to whatsapp
      // if (item.path === '/custom-messages') {
      //   return isSubscribedwhatsAppOfficial || isSubscribedwhatsAppUnOfficial
      // }
      return (
        item.permissions.length === 0 ||
        item.permissions.includes(userPermission)
      )
    })
    // return menuItems
  }, [
    activePlan,
    isSitePage,
    siteData.currentSite?.id,
    userPermission,
    featureSitesMap,
  ])

  const checkIsActive = (path: string) => {
    const localPath = location.pathname

    if (!localPath.includes('/site')) {
      // if (!localPath.includes('/site') && !localPath.includes('/student')) {
      if (localPath.endsWith(path)) {
        return localPath.includes(path)
      }

      // Hard code bacuase lazy for /settings/payment
      if (localPath.includes('/settings/payment') && path === '/settings') {
        return false
      }

      // Hard code for profile
      if (
        localPath.includes('/settings/users/profile') &&
        path.includes('/settings/users/profile')
      ) {
        return true
      }

      return localPath.includes(`${path}/`)
    }

    return localPath === path
  }

  if (isLoading)
    return (
      <MenuBarContainer>
        {menuItems.map(item => (
          <SkeletonLoader
            key={item.label}
            boxCSS={{
              alignSelf: 'center',
              width: '70%',
              height: item.path === '#' ? '1rem' : '3rem',
              marginTop: item.path === '#' ? '$4' : '$2',
            }}
            height="100%"
          />
        ))}
      </MenuBarContainer>
    )
  return (
    <MenuBarContainer>
      {/* This element allows switching to the site sidebar. Disabled for now.
      
      <MenuItem
        noHover
        onClick={() => {
          if (!isSitePage) {
            navigate('/site')
          } else {
            navigate('/school')
          }
        }}
      >
        <FaChevronLeft />
        <span className="menuItemText">
          {isSitePage
            ? t(`component:menubar.backToSchool`)
            : t(`component:menubar.siteSettings`)}
        </span>
      </MenuItem> */}
      {isMobile && (
        <MenuItem
          onClick={e => e.stopPropagation()}
          noHover
          css={{
            flexDirection: 'column',
            gap: '$2',
          }}
        >
          <SchoolSelector triggerVariant="fullWidth" />
          <ViewSiteButton />
        </MenuItem>
      )}

      {filteredMenuItems.map(item => {
        let itemPath = item.path

        if (item.variables) {
          Object.keys(item.variables).forEach(key => {
            switch (key) {
              case '$userId':
                itemPath = itemPath.replace(key, currentUser.id.toString())
                break
              default:
                break
            }
          })
        }

        if (itemPath === '#') {
          return (
            <Text
              align="left"
              bold
              type="subtle"
              css={{ width: '90%', marginTop: '$4' }}
              key={item.label}
            >
              {t(`component:menubar.${item.label}`)}
            </Text>
          )
        }
        return (
          <MenuItem
            id={item.label}
            key={item.label}
            onClick={() => {
              navigate(`${itemPath}`)
            }}
            active={checkIsActive(itemPath)}
          >
            <SvgIcon
              id={`icon-${item.label}`}
              active={checkIsActive(itemPath)}
              style={{ width: '$4' }}
              baseColor={
                item.label === 'whatsappTemplate'
                  ? theme.colors.text.toString()
                  : 'transparent'
              }
              stroke={
                checkIsActive(itemPath)
                  ? theme.colors.primary.toString()
                  : theme.colors.text.toString()
              }
              activeColor={
                item.label === 'whatsappTemplate'
                  ? theme.colors.primary.toString()
                  : 'transparent'
              }
            >
              <item.icon />
            </SvgIcon>
            <span className="menuItemText">
              {t(`component:menubar.${item.label}`)}
            </span>
          </MenuItem>
        )
      })}
    </MenuBarContainer>
  )
}

export default MenuBar
