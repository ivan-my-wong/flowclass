import React, { ReactElement, useRef } from 'react'

import { styled } from '../../styles'

type Props = {
  children: ReactElement
  open: boolean
  onClose?: () => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Drawer = ({ children, open, onClose }: Props) => {
  const refDrawer = useRef<HTMLDivElement>(null)

  return (
    <Wrap status={`${open ? 'show' : 'hidden'}`}>
      <DrawerMark />
      <Content ref={refDrawer}>{children}</Content>
    </Wrap>
  )
}

const Wrap = styled('div', {
  height: '100vh',
  position: 'fixed',
  top: 0,
  width: '100vw',
  right: 0,
  zIndex: '$drawer',
  transition: 'visibility 0s, opacity 0.15s ease-out',
  variants: {
    status: {
      show: {
        visibility: 'visible',
        opacity: 1,
      },
      hidden: {
        visibility: 'hidden',
        opacity: 0,
      },
    },
  },
})
const DrawerMark = styled('div', {
  position: 'absolute',
  backgroundColor: '$textSubtle',
  opacity: 0.5,
  width: '100vw',
  height: '100vh',
})
const Content = styled('div', {
  position: 'absolute',
  backgroundColor: '$backgroundLayer2',
  boxShadow: '$1',
  top: 0,
  right: 0,
  maxWidth: 500,
  padding: '$2 $8',
  height: '100vh',

  minWidth: 600,

  '@sm': {
    minWidth: '95%',
  },
  '@xs': {
    padding: 20,
  },
  overflowY: 'auto',
})

export default Drawer
