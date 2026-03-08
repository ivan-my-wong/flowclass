import React from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { FaChevronRight } from 'react-icons/fa'
import { useRecoilValue } from 'recoil'

import flowclassLogo from '@/assets/logos/flowclass.png'
import ImageAspect from '@/components/Images/ImageAspect'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { userState } from '@/stores/userData'
import { cn } from '@/utils/cn'

import NavMenu from './NavMenu'

type HeaderProps = {
  homepage: string
  leftHeader?: React.ReactNode
  isCustomStylesApply?: boolean
  leftHeaderCSS?: any
  rightHeaderCSS?: any
}

const PublicLayoutHeader = ({
  homepage,
  leftHeader,
  leftHeaderCSS,
  rightHeaderCSS,
  isCustomStylesApply,
}: HeaderProps) => {
  const navigate = useNavigate()
  const leftAndCustomStyles = cn(
    'flex flex-row content-center font-bold gap-2',
    isCustomStylesApply &&
      'w-[90%] xl:w-[80%] lg:w-[78%] md:w-[68%] sm:w-[90%]',
    leftHeaderCSS
  )
  const rightAndCustomStyles = cn('ml-auto flex flex-row gap-2', rightHeaderCSS)

  const { t } = useTranslation()
  const userData = useRecoilValue(userState)

  return (
    <header className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className={leftAndCustomStyles} style={{ cursor: 'pointer' }}>
            <ImageAspect
              onClick={() => {
                navigate(homepage, { replace: true })
              }}
              width="8rem"
              ratio={5.4 / 1}
              src={flowclassLogo}
              alt="Flowclass Logo"
            />
            <div className="flex items-center flex-wrap">{leftHeader}</div>
          </div>
          <Box justify="end">
            <NavMenu
              routes={[
                {
                  label: t('component:menubar.aiTools.descriptionGenerator'),
                  url: '/c/ai',
                },
                {
                  label: 'Pricing',
                  url: '/c/pricing',
                },
              ]}
            />
          </Box>
          <div className={rightAndCustomStyles} style={{ flexShrink: 0 }}>
            {!userData.isLogin ? (
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = '/login'
                }}
              >
                {t('login:login')}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  window.location.href = '/home'
                }}
              >
                {t('login:goToRegister')}
              </Button>
            )}

            <Button
              onClick={() => {
                if (!userData.isLogin) {
                  window.location.href = '/register'
                } else {
                  window.location.href = '/subscription/create-subscription'
                }
              }}
              iconAfter={<FaChevronRight />}
            >
              {t('component:menubar.aiTools.getMoreCredits')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

const ContentLayout = ({
  homepage,
  leftHeader,
  leftHeaderCSS,
  rightHeaderCSS,
  children,
  isCustomStylesApply,
}: HeaderProps & { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicLayoutHeader
        homepage={homepage}
        leftHeader={leftHeader}
        leftHeaderCSS={leftHeaderCSS}
        rightHeaderCSS={rightHeaderCSS}
        isCustomStylesApply={isCustomStylesApply}
      />

      <main className="flex-grow pt-16">{children}</main>
    </div>
  )
}

export default ContentLayout
