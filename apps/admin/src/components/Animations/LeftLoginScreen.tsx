import React, { useEffect } from 'react'

import { motion, useAnimationControls } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { LuArrowUpRight, LuBookOpen } from 'react-icons/lu'

import backgroundImage from '@/assets/backgrounds/blue_purple_abstract.jpg'
import { Button } from '@/components/ui/Button'
import { LastUpdatedDate, LinkToGuides, UpdateNotes } from '@/constants/guides'

const currentVersion = 'v2_2_0'

const LeftLoginScreen: React.FC = () => {
  const { t } = useTranslation('login')
  const backgroundControls = useAnimationControls()

  useEffect(() => {
    backgroundControls.start({
      scale: [1, 1.05, 1],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    })
  }, [backgroundControls])

  const updateLink = UpdateNotes[currentVersion]

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center p-8 text-white">
      <motion.div
        className="absolute inset-0 w-full h-full"
        animate={backgroundControls}
        style={{ originX: 0.5, originY: 0.5 }}
      >
        <img
          src={backgroundImage}
          alt="Abstract background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </motion.div>

      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {t(`updateShowcase.${currentVersion}.title`)}
        </h2>
        <p className="text-base md:text-lg mb-8 text-gray-200 whitespace-pre-line">
          {t(`updateShowcase.${currentVersion}.description`)}
        </p>

        {/* Add last updated date text */}
        <p className="text-sm text-gray-400 mb-6">
          {t('lastUpdate.dateText', { date: LastUpdatedDate[currentVersion] })}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="default"
            size="lg"
            iconAfter={<LuArrowUpRight className="h-4 w-4" />}
            onClick={() => {
              window.open(updateLink, '_blank')
            }}
          >
            {t('updateShowcase.updateNotesButton')}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            iconBefore={<LuBookOpen className="h-4 w-4" />}
            onClick={() => {
              window.open(LinkToGuides.mainDocumentation, '_blank')
            }}
          >
            {t('updateShowcase.documentationButton')}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default LeftLoginScreen
