import { useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'

import { UNIQUE_LOGOS } from '../constants'

interface TrustedByProps {
  onBookDemo: () => void
  hasActionButton?: boolean
}

const TrustedBy = ({
  onBookDemo,
  hasActionButton = true,
}: TrustedByProps): JSX.Element => {
  const { t } = useTranslation('onboarding')
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  // Continuous infinite scroll animation
  const animateCarousel = () => {
    if (!carouselRef.current) return

    const carousel = carouselRef.current
    const { scrollWidth } = carousel
    const { clientWidth } = carousel

    // If we've scrolled to the end, reset to beginning seamlessly
    if (carousel.scrollLeft >= scrollWidth - clientWidth) {
      carousel.scrollLeft = 0
    } else {
      carousel.scrollLeft += 1 // Smooth continuous movement
    }

    animationRef.current = requestAnimationFrame(animateCarousel)
  }

  // Start continuous animation on load
  useEffect(() => {
    if (isAutoPlaying) {
      animationRef.current = requestAnimationFrame(animateCarousel)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAutoPlaying])

  const handleMouseEnter = () => {
    setIsAutoPlaying(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  const handleMouseLeave = () => {
    setIsAutoPlaying(true)
    animationRef.current = requestAnimationFrame(animateCarousel)
  }

  return (
    <div className="bg-white [&_#logo-carousel::-webkit-scrollbar]:hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('pricingPublic.trustedBy.title')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('pricingPublic.trustedBy.subtitle')}
          </p>
        </div>

        {/* Logo Carousel */}
        <div
          className="relative max-w-6xl mx-auto mb-12"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Carousel Container */}
          <div
            ref={carouselRef}
            id="logo-carousel"
            className="overflow-x-hidden"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <div className="flex space-x-12 py-8 min-w-max">
              {/* Duplicate logos for infinite scroll effect */}
              {[...UNIQUE_LOGOS, ...UNIQUE_LOGOS, ...UNIQUE_LOGOS].map(
                (logo, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 flex items-center justify-center"
                  >
                    <div className="max-w-xs mx-4">
                      <img
                        src={logo}
                        alt={`${t('pricingPublic.trustedBy.logoAlt')} ${
                          index + 1
                        }`}
                        className="max-h-20 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110"
                        onError={e => {
                          // Fallback for failed images
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {hasActionButton && (
          <div className="text-center">
            <Button
              size="lg"
              onClick={onBookDemo}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold"
            >
              {t('pricingPublic.trustedBy.cta')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrustedBy
