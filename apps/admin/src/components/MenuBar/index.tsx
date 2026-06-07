import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import { useResponsive } from '@/hooks/useResponsive'
import useSiteData from '@/hooks/useSiteData'
import { userState } from '@/stores/userData'
import { userPermissionState, UserRole } from '@/stores/userPermissionData'
import { cn } from '@/utils/cn'

import ViewSiteButton from '../Buttons/ViewSite'
import SvgIcon from '../Images/SvgIcon'
import SkeletonLoader from '../Loaders/SkeletonLoader'
import SchoolSelector from '../Selector/SchoolSelector'
import Text from '../Texts/Text'

import menuItems, { buildMenuItems } from './menuBarItems'
import { siteMenuItems } from './menuBarSiteItems'

const MenuBar: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { useFetchAllSiteData } = useSiteData()
  const { isLoading } = useFetchAllSiteData()
  const { isMobile } = useResponsive()
  const userPermission = useRecoilValue(userPermissionState)
  const currentUser = useRecoilValue(userState)

  const isSitePage = location.pathname.includes('/site')

  // const isSitePage = false

  const filteredMenuItems = useMemo(() => {
    if (isSitePage) {
      return siteMenuItems.filter(
        item =>
          item.permissions.length === 0 ||
          item.permissions.includes(userPermission)
      )
    }

    return buildMenuItems(new Map()).filter(item => {
      if (userPermission === UserRole.MasterAdmin) {
        return true
      }
      if (item.path === '#' && item.permissions.length === 0) {
        return true
      }
      return (
        item.permissions.length === 0 ||
        item.permissions.includes(userPermission)
      )
    })
  }, [isSitePage, userPermission])

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
      <nav className="w-[15.5rem] bg-background-layer-2 border-r-2 border-background-layer-3 h-full overflow-y-auto pl-2 pr-2 pb-4 flex flex-col items-center justify-start sm:w-full sm:pb-16">
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
    <nav className="w-[15.5rem] bg-background-layer-2 border-r-2 border-background-layer-3 h-full overflow-y-auto pl-2 pr-2 pb-4 flex flex-col items-center justify-start sm:w-full sm:pb-16">
      {isMobile && (
        <div
          role="group"
          className="flex items-center mt-3 w-[90%] p-2 cursor-pointer text-center whitespace-nowrap rounded-lg text-sm md:w-[95%] flex-col gap-2"
          onClick={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
        >
          <SchoolSelector />
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
