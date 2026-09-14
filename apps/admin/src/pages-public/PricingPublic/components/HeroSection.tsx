import { useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

// Import the Google logo image
import googleLogo from '@/assets/companies/google.png'
// Import the second teacher image
import { Button } from '@/components/ui/Button'

const HeroSection = (): JSX.Element => {
  const { t } = useTranslation('onboarding')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 })
  const [isClicking, setIsClicking] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setClickPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
        setIsClicking(true)

        // Reset click effect after animation
        setTimeout(() => setIsClicking(false), 600)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mousedown', handleMouseDown)

      return () => {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mousedown', handleMouseDown)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-white min-h-screen bg-contain bg-right bg-no-repeat md:bg-contain sm:bg-cover sm:bg-center"
      style={
        {
          // backgroundImage: `url(${teacherImage2})`,
        }
      }
    >
      {/* Background overlay with white tint */}
      <div className="absolute inset-0 bg-white/90 md:bg-white/80" />

      {/* Interactive gradient effects */}
      <div
        className="absolute pointer-events-none transition-opacity duration-300"
        style={{
          left: mousePosition.x - 100,
          top: mousePosition.y - 100,
          width: 200,
          height: 200,
          background:
            'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          opacity: 0.6,
          zIndex: 1,
        }}
      />

      {isClicking && (
        <div
          className="absolute pointer-events-none animate-ping"
          style={{
            left: clickPosition.x - 75,
            top: clickPosition.y - 75,
            width: 150,
            height: 150,
            background:
              'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
            zIndex: 2,
          }}
        />
      )}

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center z-10">
        {/* Language Toggle */}
        {/* <div className="box-col-full mb-4">
          <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
            <button
              type="button"
              onClick={() => switchLanguage('en')}
              className={`text-sm font-medium transition-colors px-2 py-1 rounded ${
                currentLang === 'en'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => switchLanguage('zh')}
              className={`text-sm font-medium transition-colors px-2 py-1 rounded ${
                currentLang === 'zh'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              中文
            </button>
          </div>
        </div> */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
          {t('pricingPublic.hero.title')}
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
          {t('pricingPublic.hero.subtitle')}
        </p>

        {/* Starting Price Badge */}
        <div className="inline-block bg-blue-100 border border-blue-300 rounded-full px-6 py-3 mb-8">
          <span className="text-blue-700 text-lg font-semibold">
            {t('pricingPublic.hero.startingPrice')}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              // Redirect to registration page
              window.open('https://app.flowclass.io/register', '_blank')
            }}
          >
            {t('pricingPublic.hero.cta.bookDemo')}
          </Button>
          <Button
            size="lg"
            onClick={() => {
              // Scroll to the preset plans section
              const presetPlansSection = document.getElementById('preset-plans')
              if (presetPlansSection) {
                presetPlansSection.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                })
              }
            }}
          >
            {t('pricingPublic.hero.cta.viewPlans')}
          </Button>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 text-gray-800 max-w-4xl mx-auto mb-8 sm:mb-12 px-4">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl mb-2">💰</div>
            <div className="text-xs sm:text-sm font-semibold">
              {t('pricingPublic.hero.features.flexiblePricing.title')}
            </div>
            <div className="text-xs text-gray-600 px-2">
              {t('pricingPublic.hero.features.flexiblePricing.description')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl mb-2">🔓</div>
            <div className="text-xs sm:text-sm font-semibold">
              {t('pricingPublic.hero.features.cancelAnytime.title')}
            </div>
            <div className="text-xs text-gray-600 px-2">
              {t('pricingPublic.hero.features.cancelAnytime.description')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl mb-2">✅</div>
            <div className="text-xs sm:text-sm font-semibold">
              {t('pricingPublic.moneyBackGuarantee.title')}
            </div>
            <div className="text-xs text-gray-600 px-2">
              {t('pricingPublic.moneyBackGuarantee.description')}
            </div>
          </div>
        </div>

        {/* Google Reviews Section */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
            {/* Google Logo */}
            <div className="flex items-center">
              <img src={googleLogo} alt="Google Logo" className="w-6 h-6" />
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <svg
                  key={`star-${i + 1}`}
                  className="w-4 h-4 text-yellow-500 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            {/* Rating Text */}
            <div className="text-sm font-medium text-gray-700">
              5.0 out of 5
            </div>
          </div>
        </div>

        {/* Dynamic Date */}
        <div className="text-center mt-3">
          <span className="text-xs text-gray-500">
            as of{' '}
            {new Date().toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default HeroSection
