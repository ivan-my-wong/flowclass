import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import AnimatedCheckCircle from '@/components/ui/AnimatedCheckCircle'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const PaymentCompleted = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showCelebration, setShowCelebration] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Start celebration animation immediately
    setShowCelebration(true)

    // Show content after a brief delay
    const contentTimer = setTimeout(() => {
      setShowContent(true)
    }, 1000)

    return () => clearTimeout(contentTimer)
  }, [])

  const handleGoToDashboard = () => {
    navigate('/home')
  }

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4 relative overflow-hidden">
      {/* Celebration confetti background */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => {
              const confettiId = `confetti-${i}-${Math.random()
                .toString(36)
                .substr(2, 9)}`
              return (
                <div
                  key={confettiId}
                  className="confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                    backgroundColor: [
                      '#4ade80',
                      '#22c55e',
                      '#16a34a',
                      '#15803d',
                      '#166534',
                    ][Math.floor(Math.random() * 5)],
                  }}
                />
              )
            })}
          </div>
        </div>
      )}

      <Card className="p-8 w-full lg:w-[500px] border-none shadow-2xl bg-white flex flex-col items-center relative z-10 transform transition-all duration-1000">
        {/* Animated check circle with celebration */}
        <div className="relative">
          <AnimatedCheckCircle
            isCompleted
            size="lg"
            color="#4ade80"
            className={`scale-[2] mt-5 transition-all duration-1000 ${
              showCelebration ? 'animate-bounce' : ''
            }`}
          />
          {/* Celebration ring */}
          {showCelebration && (
            <div className="absolute inset-0 scale-[2.5] mt-5">
              <div className="w-full h-full rounded-full border-4 border-green-300 animate-ping opacity-75" />
            </div>
          )}
        </div>

        {/* Content with fade-in animation */}
        <div
          className={`transition-all duration-1000 ${
            showContent
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="mt-10 text-3xl font-bold text-green-800 text-center">
            {t('subscription:payment.upgradeSuccessTitle')}
          </div>

          <div className="text-center text-lg text-green-700 mt-4 leading-relaxed">
            {t('subscription:payment.upgradeSuccessDesc')}
          </div>

          <div className="text-center text-sm text-gray-600 mt-3 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
            {t('subscription:payment.featuresReadySoon')}
          </div>

          {/* Feature highlights */}
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>
                {t('subscription:payment.featureHighlights.advancedFeatures')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>
                {t('subscription:payment.featureHighlights.higherLimits')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>
                {t('subscription:payment.featureHighlights.prioritySupport')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>
                {t('subscription:payment.featureHighlights.enhancedTools')}
              </span>
            </div>
          </div>

          <Button
            aria-label={t('subscription:payment.goToDashboard') as string}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-8 py-3 mt-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={handleGoToDashboard}
          >
            {t('subscription:payment.goToDashboard')}
          </Button>
        </div>
      </Card>

      {/* CSS for confetti animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .confetti-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          
          .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            animation: confetti-fall linear infinite;
          }
          
          @keyframes confetti-fall {
            0% {
              transform: translateY(-100vh) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
        `,
        }}
      />
    </div>
  )
}

export default PaymentCompleted
