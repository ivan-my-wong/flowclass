import {
  ComponentProps,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { FaTasks } from 'react-icons/fa'
import { ImCross } from 'react-icons/im'

import { styled, theme } from '../../styles'
import Box from '../Containers/Box'

type FloatingButtonProps = {
  content: JSX.Element
  boxProps?: Omit<ComponentProps<typeof Box>, 'children'>
}

export type FloatingButtonHandle = {
  handleButtonClick: () => void
}

export const FloatingButton = forwardRef<
  FloatingButtonHandle,
  FloatingButtonProps
>(({ content, boxProps }, ref) => {
  const [showInfo, setShowInfo] = useState(false)

  const handleButtonClick = () => {
    setShowInfo(!showInfo)
  }

  useImperativeHandle(ref, () => ({
    handleButtonClick,
  }))

  const CloseButton = (): JSX.Element => {
    return (
      <Box
        css={{
          width: 'fit-content',
          cursor: 'pointer',
          justifySelf: 'flex-end',
          alignSelf: 'flex-end',
          padding: '$1',
        }}
        onClick={handleButtonClick}
      >
        <ImCross color={theme.colors.text.toString()} />
      </Box>
    )
  }

  return (
    <Box
      css={{
        position: 'fixed',
        bottom: '15%',
        right: '1.5%',
        width: 'fit-content',
      }}
      {...boxProps}
    >
      <MotionButton
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleButtonClick}
        id="floating-button"
      >
        <FaTasks size="70%" color={theme.colors.primaryHighlight.toString()} />
      </MotionButton>
      <AnimatePresence>
        {showInfo && (
          <MotionContent
            id="floating-content"
            initial={{ opacity: 0, y: '20%', x: '30%', filter: 'blur(10px)' }}
            animate={{
              opacity: 1,
              x: '0%',
              y: '-5%',
              filter: 'blur(0px)',
            }}
            exit={{ opacity: 0, y: '15%', x: '15%', filter: 'blur(10px)' }}
            transition={{ duration: 0.3 }}
          >
            <CloseButton />
            {content}
          </MotionContent>
        )}
      </AnimatePresence>
    </Box>
  )
})

const MotionContent = styled(motion.div, {
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  bottom: '100%',
  right: '0px',
  maxWidth: '80vw',
  minWidth: '30rem',
  width: 'fit-content',
  backgroundColor: '$background',
  padding: '$2',
  borderRadius: '$1',
  boxShadow: '$3',
  // border: '1px solid $borderColor',
  '@sm': {
    minWidth: '90vw',
  },
})

const MotionButton = styled(motion.button, {
  zIndex: '9999',
  background: '$background',
  border: '2px solid $primary',
  outline: 'none',
  borderRadius: '50%',
  width: '4rem',
  height: '4rem',
  boxShadow: '$3',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'background-color 0.3s ease',
  '&:hover': {
    background: '$backgroundLayer3',
  },
})
