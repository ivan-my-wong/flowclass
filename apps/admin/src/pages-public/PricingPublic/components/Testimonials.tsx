import { useCallback, useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

import blackCat from '@/assets/pricing/testimonials/black-cat.png'
import jennyTo from '@/assets/pricing/testimonials/jenny-to.jpeg'
import judyYiu from '@/assets/pricing/testimonials/judy-yiu.jpg'
import mayLee from '@/assets/pricing/testimonials/may-lee.jpeg'
import yukiLuo from '@/assets/pricing/testimonials/yuki-luo.jpg'
import ImageAspect from '@/components/Images/ImageAspect'
import { Button } from '@/components/ui/Button'

interface Testimonial {
  id: number
  quote: string
  name: string
  title: string
  company: string
  rating: number
  profilePicture: string
}

interface TestimonialsProps {
  onBookDemo: () => void
  hasActionButton?: boolean
}

const Testimonials = ({
  onBookDemo,
  hasActionButton = true,
}: TestimonialsProps): JSX.Element => {
  const { t: tOnboarding } = useTranslation('onboarding')
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  // Get testimonials from translations
  const getTestimonials = (): Testimonial[] => {
    const testimonialList = tOnboarding(
      'pricingPublic.testimonials.testimonialList',
      { returnObjects: true }
    ) as Array<{
      id: number
      quote: string
      name: string
      title: string
      company: string
    }>

    return testimonialList.map((item, index) => ({
      id: item.id,
      quote: item.quote,
      name: item.name,
      title: item.title,
      company: item.company,
      profilePicture: [jennyTo, blackCat, mayLee, yukiLuo, judyYiu][index],
      rating: 5,
    }))
  }

  const testimonials = getTestimonials()

  // Continuous infinite scroll animation
  const animateCarousel = useCallback(() => {
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
  }, [])

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
  }, [isAutoPlaying, animateCarousel])

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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  return (
    <div className="bg-white py-8 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-16 px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            {tOnboarding('pricingPublic.testimonials.title')}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-md md:max-w-3xl mx-auto leading-relaxed">
            {tOnboarding('pricingPublic.testimonials.subtitle')}
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div
          className="relative max-w-6xl mx-auto mb-8 md:mb-12"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Carousel Container */}
          <div
            ref={carouselRef}
            className="overflow-x-hidden"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <div className="flex space-x-4 md:space-x-6 py-4 md:py-8 min-w-max">
              {/* Duplicate testimonials for infinite scroll effect */}
              {[...testimonials, ...testimonials, ...testimonials].map(
                (testimonial, index) => (
                  <div
                    key={`${testimonial.id}-${Math.floor(
                      index / testimonials.length
                    )}-${index % testimonials.length}`}
                    className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[400px] bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-200"
                  >
                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      {renderStars(testimonial.rating)}
                      <span className="ml-2 text-sm text-gray-600">
                        {testimonial.rating}.0{' '}
                        {tOnboarding('pricingPublic.testimonials.rating')}
                      </span>
                    </div>

                    {/* Quote */}
                    <blockquote className="text-gray-700 text-sm md:text-lg leading-relaxed italic mb-4 md:mb-6">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>

                    {/* Author Info */}
                    <div className="flex items-center">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mr-3 md:mr-4">
                        <ImageAspect
                          src={testimonial.profilePicture}
                          alt={testimonial.name}
                          ratio={1}
                          className="rounded-full"
                          width="40"
                          height="40"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm md:text-lg font-semibold text-gray-900 truncate">
                          {testimonial.name}
                        </h4>
                        <p className="text-blue-600 font-medium text-xs md:text-sm truncate">
                          {testimonial.title}
                        </p>
                        <p className="text-gray-600 text-xs md:text-sm truncate">
                          {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        {hasActionButton && (
          <div className="text-center px-4">
            <Button
              size="lg"
              onClick={onBookDemo}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
            >
              {tOnboarding('pricingPublic.testimonials.cta')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Testimonials
