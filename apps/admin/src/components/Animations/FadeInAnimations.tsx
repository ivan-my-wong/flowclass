// src/components/FadeInUpWrapper.js
import React from 'react'

import { motion } from 'framer-motion'

export const FadeInAndUpAnimation = ({
  children,
  style,
}: {
  children: JSX.Element | JSX.Element[]
  style?: React.CSSProperties
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

export const FadeInAndLeftAnimation = ({
  children,
  delay,
  style,
}: {
  children: JSX.Element | JSX.Element[]
  delay?: number
  style?: React.CSSProperties
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      style={style}
    >
      {children}
    </motion.div>
  )
}
