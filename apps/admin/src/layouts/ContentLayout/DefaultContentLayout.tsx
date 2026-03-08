import React from 'react'
import { Outlet } from 'react-router-dom'

import { motion } from 'framer-motion'

import LeftLoginScreen from '@/components/Animations/LeftLoginScreen'
import Box from '@/components/ui/Box'

import BackToHomeLogo from './BackToHomeLogo'

type DefaultContentLayoutProps = {
  children?: React.ReactNode
}
const DefaultContentLayout = ({
  children,
}: DefaultContentLayoutProps): JSX.Element => {
  return (
    <Box
      align="start"
      justify="start"
      responsive
      gap="0"
      className="md:flex-row flex-col-reverse md:h-dvh overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="md:w-1/2 w-full h-full flex items-center justify-center bg-background-subtle"
        exit={{ opacity: 0 }}
      >
        <LeftLoginScreen />
      </motion.div>
      <Box
        direction="col"
        justify="start"
        align="start"
        className="md:p-0 p-8 md:w-1/2 w-full h-full flex items-center justify-center bg-white overflow-y-auto"
      >
        <Box direction="col" className="w-full max-w-md">
          <BackToHomeLogo className="self-center mb-4" />
          <Box direction="col" className="pt-4">
            <Outlet />
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default DefaultContentLayout
