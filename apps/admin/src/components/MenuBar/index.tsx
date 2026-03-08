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
import { cn } from '@/utils/cn'

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

  const isSitePage = location.pathname.includes('/site')

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

    const isSubscribedwhatsAppOfficial =
      activePlan?.notificationChannels?.TWILIO_WHATSAPP
    const isSubscribedwhatsAppUnOfficial =
      activePlan?.notificationChannels?.UNOFFICIAL_WHATSAPP

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
      return (
        item.permissions.length === 0 ||
        item.permissions.includes(userPermission)
      )
    })
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
      if (localPath.endsWith(path)) {
        return localPath.includes(path)
      }
      if (localPath.includes('/settings/payment') && path === '/settings') {
        return false
      }
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
      <nav className="w-[15.5rem] bg-background-layer-2 border-r-2 border-background-layer-3 h-full overflow-y-auto pl-2 pr-2 pb-4 flex flex-col items-center justify-start sm:w-full sm:h-screen sm:pb-16">
        {menuItems.map(item => (
          <SkeletonLoader
            key={item.label}
            boxClassName="self-center w-[70%]"
            boxCSS={{
              height: item.path === '#' ? '1rem' : '3rem',
              marginTop: item.path === '#' ? '1rem' : '0.5rem',
            }}
            height="100%"
          />
        ))}
      </nav>
    )

  return (
    <nav className="w-[15.5rem] bg-background-layer-2 border-r-2 border-background-layer-3 h-full overflow-y-auto pl-2 pr-2 pb-4 flex flex-col items-center justify-start sm:w-full sm:h-screen sm:pb-16">
      {isMobile && (
        <div
          className="flex items-center mt-3 w-[90%] p-2 cursor-pointer text-center whitespace-nowrap rounded-lg text-sm md:w-[95%] flex-col gap-2"
          onClick={e => e.stopPropagation()}
        >
          <SchoolSelector triggerVariant="fullWidth" />
          <ViewSiteButton />
        </div>
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
              className="w-[90%] mt-4"
              key={item.label}
            >
              {t(`component:menubar.${item.label}`)}
            </Text>
          )
        }

        return (
          <div
            id={item.label}
            key={item.label}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`${itemPath}`)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                navigate(`${itemPath}`)
              }
            }}
            className={cn(
              'flex items-center mt-3 w-[90%] p-2 no-underline transition-colors cursor-pointer text-center whitespace-nowrap rounded-lg text-sm md:w-[95%]',
              'hover:text-primary [&:hover_svg]:stroke-primary [&:hover_svg]:text-primary [&:hover_#whatsappTemplate_svg]:fill-primary [&:hover_#whatsappTemplate_svg]:stroke-none',
              checkIsActive(itemPath) && 'bg-white text-primary'
            )}
          >
            <SvgIcon
              id={`icon-${item.label}`}
              active={checkIsActive(itemPath)}
              style={{ width: '1rem' }}
              baseColor={
                item.label === 'whatsappTemplate'
                  ? 'var(--color-text)'
                  : 'transparent'
              }
              stroke={
                checkIsActive(itemPath)
                  ? 'var(--color-primary)'
                  : 'var(--color-text)'
              }
              activeColor={
                item.label === 'whatsappTemplate'
                  ? 'var(--color-primary)'
                  : 'transparent'
              }
            >
              <item.icon />
            </SvgIcon>
            <span className="text-sm leading-4 ml-4">
              {t(`component:menubar.${item.label}`)}
            </span>
          </div>
        )
      })}
    </nav>
  )
}

export default MenuBar
