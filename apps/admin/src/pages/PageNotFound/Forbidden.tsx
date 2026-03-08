import React from 'react'
import { useNavigate } from 'react-router-dom'

import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { LuArrowLeft } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'

const Forbidden: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation(['common']) // Ensure 'common' namespace is loaded

  return (
    <motion.div
      // className removed as layout handles positioning/padding
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
          <h1 className="text-8xl font-bold text-destructive mb-4">403</h1>{' '}
          {/* Changed color to destructive */}
          <h2 className="text-3xl font-semibold text-text-primary mb-3">
            {t('common:errorPage.forbiddenTitle')}
          </h2>
          <p className="text-text-secondary mb-8">
            {t('common:errorPage.forbiddenDescription')}
          </p>
          <Button
            variant="default"
            size="lg"
            onClick={() => navigate(-1)} // Go back to the previous page
            iconBefore={<LuArrowLeft className="h-5 w-5" />}
          >
            {t('common:action.back')}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Forbidden
