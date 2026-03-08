import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuPause, LuPlay, LuVolume2, LuVolumeX, LuX } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'

interface FeatureModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  videoUrl?: string
  steps: string[]
  tips?: string[]
}

const FeatureModal = ({
  isOpen,
  onClose,
  title,
  description,
  videoUrl,
  steps,
  tips,
}: FeatureModalProps): JSX.Element | null => {
  const { t } = useTranslation('onboarding')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  if (!isOpen) return null

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onKeyDown={e => {
        if (e.key === 'Escape') onClose()
      }}
      tabIndex={-1}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            onClose()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={t('featureModal.closeModal') as string}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Description */}
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">{description}</p>
          </div>

          {/* Video Section */}
          {videoUrl && (
            <div className="mb-6">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-800">
                  {videoUrl.includes('scribehow.com') ? (
                    <iframe
                      src={videoUrl}
                      width="100%"
                      height="100%"
                      allow="fullscreen"
                      style={{
                        aspectRatio: '16 / 9',
                        border: 0,
                        minHeight: '480px',
                      }}
                      title={`${title} Tutorial`}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-white">
                        <div className="mb-4">
                          <LuPlay className="w-16 h-16 mx-auto mb-2" />
                          <p className="text-lg font-medium">
                            {t('featureModal.videoTutorial')}
                          </p>
                          <p className="text-sm text-gray-300">
                            {t('featureModal.clickToPlay')}
                          </p>
                        </div>
                        <div className="flex items-center justify-center space-x-4">
                          <button
                            type="button"
                            onClick={handlePlayPause}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                          >
                            {isPlaying ? (
                              <LuPause className="w-4 h-4" />
                            ) : (
                              <LuPlay className="w-4 h-4" />
                            )}
                            <span>
                              {isPlaying
                                ? t('featureModal.pause')
                                : t('featureModal.play')}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={handleMuteToggle}
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            {isMuted ? (
                              <LuVolumeX className="w-4 h-4" />
                            ) : (
                              <LuVolume2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Steps */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('featureModal.howToGetStarted')}
            </h3>
            <ol className="space-y-3">
              {steps.map((step, index) => (
                <li
                  key={`step-${step.slice(0, 20)}-${index}`}
                  className="flex items-start space-x-3"
                >
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <p className="text-gray-700">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          {tips && tips.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                {t('featureModal.proTips')}
              </h4>
              <ul className="space-y-1">
                {tips.map((tip, index) => (
                  <li
                    key={`tip-${tip.slice(0, 20)}-${index}`}
                    className="text-sm text-blue-800"
                  >
                    • {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={onClose}
            variant="outline"
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('featureModal.close')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FeatureModal
