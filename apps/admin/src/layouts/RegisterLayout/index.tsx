import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import flowclassLogo from '@/assets/logos/flowclass.png'
import ImageAspect from '@/components/Images/ImageAspect'
import { LinkToGuides } from '@/constants/guides'

interface RegisterLayoutProps {
  children: React.ReactNode
}

const RegisterLayout: React.FC<RegisterLayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [currentLang, setCurrentLang] = useState(i18n.language)

  const switchLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
    setCurrentLang(lang)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full px-6 py-4 flex items-center justify-between"
      >
        {/* Logo/Brand */}
        <div className="flex items-center">
          <ImageAspect
            onClick={() => navigate('/')}
            className="cursor-pointer"
            width="8rem"
            ratio={5.4 / 1}
            src={flowclassLogo}
            alt="Flowclass Logo"
          />
        </div>

        {/* Language Toggle */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => switchLanguage('en')}
            className={`text-sm transition-colors ${
              currentLang === 'en'
                ? 'text-blue-600 font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => switchLanguage('zh')}
            className={`text-sm transition-colors ${
              currentLang === 'zh'
                ? 'text-blue-600 font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            中文
          </button>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex-1 flex items-center justify-center px-6 py-12"
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {children}
        </div>
      </motion.main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full px-6 py-6 text-center"
      >
        <div className="text-sm text-gray-500 space-y-4">
          <p>
            {t('login:register.termsAgreement')}{' '}
            <a
              href={LinkToGuides.termsOfService}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              {t('login:register.terms')}
            </a>{' '}
            {t('common:and')}{' '}
            <a
              href={LinkToGuides.privacyPolicy}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              {t('login:register.privacy')}
            </a>
          </p>
        </div>
      </motion.footer>
    </div>
  )
}

export default RegisterLayout
