import {
  type ComponentProps,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { FaTasks } from 'react-icons/fa'
import { ImCross } from 'react-icons/im'

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
        className="w-fit cursor-pointer justify-self-end self-end p-1"
        onClick={handleButtonClick}
      >
        <span className="text-foreground">
          <ImCross color="currentColor" />
        </span>
      </Box>
    )
  }

  return (
    <Box className="fixed bottom-[15%] right-[1.5%] w-fit" {...boxProps}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleButtonClick}
        id="floating-button"
        className="z-[9999] bg-background border-2 border-primary outline-none rounded-full w-16 h-16 shadow-md cursor-pointer flex justify-center items-center transition-colors duration-300 hover:bg-background-layer-3"
      >
        <span className="text-primary-highlight">
          <FaTasks size="70%" color="currentColor" />
        </span>
      </motion.button>
      <AnimatePresence>
        {showInfo && (
          <motion.div
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
            className="absolute flex flex-col bottom-full right-0 max-w-[80vw] min-w-[30rem] w-fit bg-background p-2 rounded-md shadow-lg md:min-w-[90vw]"
          >
            <CloseButton />
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
})
