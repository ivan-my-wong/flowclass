import { motion } from 'framer-motion'

const PulseEffect = ({
  children,
}: {
  children: JSX.Element | JSX.Element[]
}) => {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        opacity: [1, 0.5, 1],
      }}
      transition={{
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'loop',
      }}
    >
      {children}
    </motion.div>
  )
}

export default PulseEffect
