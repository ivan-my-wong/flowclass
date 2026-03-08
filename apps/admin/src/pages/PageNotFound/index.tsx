import React from 'react'
import { useNavigate } from 'react-router-dom'

import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { LuArrowLeft } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'

const PageNotFound: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="w-full text-center flex flex-col items-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-full h-full flex flex-col items-center justify-center"
        >
          <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-text-primary mb-3">
            {t('common:errorPage.notFoundTitle')}
          </h2>
          <p className="text-text-secondary mb-8">
            {t('common:errorPage.notFoundDescription')}
          </p>
          <Button
            variant="default"
            size="lg"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1)
              } else {
                navigate('/')
              }
            }}
            iconBefore={<LuArrowLeft className="h-5 w-5" />}
          >
            {t('common:action.back')}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default PageNotFound
