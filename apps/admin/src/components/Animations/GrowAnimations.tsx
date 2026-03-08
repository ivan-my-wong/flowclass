import { motion } from 'framer-motion'

export const GrowAnimation = ({
  children,
  style,
}: {
  children: JSX.Element | JSX.Element[]
  style?: React.CSSProperties
}) => {
  return (
    <motion.div
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        position: 'relative',
        display: 'inline-block',
        cursor: 'pointer',
        ...style,
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          background:
            'linear-gradient(to right, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0))',
          zIndex: 1,
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.5)',
            zIndex: 2,
          }}
        />
        {children}
      </div>
    </motion.div>
  )
}
