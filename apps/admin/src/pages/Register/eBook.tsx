import React from 'react'
import { Navigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import mobileChineseImage from '@/assets/loginBanners/banner_mobile_chinese.jpg'
import mobileEnglishImage from '@/assets/loginBanners/banner_mobile_english.jpg'
import sideChineseImage from '@/assets/loginBanners/banner_side_chinese.jpg'
import sideEnglishImage from '@/assets/loginBanners/banner_side_english.jpg'
import Box from '@/components/Containers/Box'
import ImageAspect from '@/components/Images/ImageAspect'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import LanguageToggle from '@/components/Toggle/LanguageToggle'
import useAuth from '@/hooks/useAuth'
import { useResponsive } from '@/hooks/useResponsive'
import BackToHomeLogo from '@/layouts/ContentLayout/BackToHomeLogo'
import RegisterForm from '@/pages/Register/RegisterForm'
import { displayLanguageState } from '@/stores/displayLanguage'

const RegisterPageEBook: React.FC = () => {
  // const [, setDarkMode] = useRecoilState(darkModeState)
  //
  // useEffect(() => {
  //   setDarkMode(false)
  // }, [])

  const { isLogin } = useAuth()
  const lang = useRecoilValue(displayLanguageState)
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()

  if (isLogin) {
    return <Navigate to="/home" replace />
  }

  let bannerImage = sideEnglishImage
  if (lang === 'zh' && !isDesktop) {
    bannerImage = mobileChineseImage
  } else if (lang === 'en' && !isDesktop) {
    bannerImage = mobileEnglishImage
  } else if (lang === 'zh' && isDesktop) {
    bannerImage = sideChineseImage
  }

  return (
    <Box
      align="flex-start"
      justify="flex-start"
      responsive
      css={{
        gap: 0,
        height: '100vh',
        '@md': {
          flexDirection: 'column-reverse!important',
          height: 'auto',
        },
      }}
    >
      <Box
        direction="column"
        justify="flex-start"
        css={{
          overflowY: 'auto',
          height: '100vh',
          paddingTop: '$4',
          '@md': { height: 'auto', overflowY: 'unset' },
        }}
      >
        <BackToHomeLogo />
        <Box direction="column" css={WrapperStyles}>
          <Box direction="column" css={{ marginBottom: '$4' }}>
            <Text bold align="center">
              {t('login:eBook.description')}
            </Text>
            <Heading bold size="large" align="center">
              {t('login:eBook.title')}
            </Heading>

            <RegisterForm />
          </Box>
        </Box>
        <Box
          justify="space-between"
          css={{
            borderTop: '1px solid $borderColor',
            padding: '$2 0 $2 $4',
          }}
        >
          <LanguageToggle />
        </Box>
      </Box>

      <Box
        css={{
          height: '100vh',
          overflowY: 'hidden',
          '@md': { height: 'auto' },
        }}
      >
        {!isDesktop ? (
          <Box>
            <ImageAspect
              width="100%"
              ratio={21 / 9}
              src={bannerImage}
              alt="Register Left Sidebar Showcase"
              objectFit="contain"
            />
          </Box>
        ) : (
          <Box>
            <ImageAspect
              width="100%"
              ratio={3 / 4}
              src={bannerImage}
              alt="Register Left Sidebar Showcase"
              objectFit="contain"
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default RegisterPageEBook

const WrapperStyles = {
  marginTop: '$4',
  width: '65%!important',
  '@md': {
    width: '75%!important',
  },
  '@sm': {
    width: '85%!important',
  },
}
