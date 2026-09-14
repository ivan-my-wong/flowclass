import { Outlet } from 'react-router-dom'

import ImpersonationBanner from '@/components/ImpersonationBanner'
import MenuBar from '@/components/MenuBar'
import { styled } from '@/styles'

import AppHeader from './AppHeader'

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
})

const HeaderWrapper = styled('div', {
  backgroundColor: '$background',
  borderBottom: `2px solid $colors$backgroundLayer3`,
  height: '3rem',
  '@sm': {
    display: 'block',
    position: 'sticky',
    top: 0,
  },
})

const ContentWrapper = styled('div', {
  display: 'flex',

  maxHeight: 'calc(100vh - 3rem)',
  flex: 1,

  '@sm': {
    maxHeight: 'none',
  },

  variants: {
    isImpersonating: {
      true: {
        maxHeight: 'calc(100vh - 5.5rem)',
      },
    },
  },
})

const Sidebar = styled('aside', {
  '@sm': {
    display: 'none',
  },
})

const MainContent = styled('main', {
  flex: 1,
  overflowY: 'auto',
})

const AppLayout = ({ children }: { children?: React.ReactNode }) => {
  const isImpersonating = !!localStorage.getItem('impersonator-access-token')

  return (
    <Container>
      <ImpersonationBanner />
      <HeaderWrapper className="z-default">
        <AppHeader />
      </HeaderWrapper>
      <ContentWrapper isImpersonating={isImpersonating}>
        <Sidebar>
          <MenuBar />
        </Sidebar>
        <MainContent>
          <Outlet />
          {children}
        </MainContent>
      </ContentWrapper>
    </Container>
  )
}

export default AppLayout
