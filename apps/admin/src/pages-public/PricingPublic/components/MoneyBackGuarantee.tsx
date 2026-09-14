import { useTranslation } from 'react-i18next'

const MoneyBackGuarantee = (): JSX.Element => {
  const { t: tOnboarding } = useTranslation('onboarding')

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 animate-bounce">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {tOnboarding('pricingPublic.moneyBackGuarantee.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {tOnboarding('pricingPublic.moneyBackGuarantee.description')}
          </p>
          <p className="text-gray-600 mt-4">
            {tOnboarding('pricingPublic.moneyBackGuarantee.onlyForSelfServe')}
          </p>
          {/* Animated Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {tOnboarding(
                  'pricingPublic.moneyBackGuarantee.features.riskFreeTrial.title'
                )}
              </h3>
              <p className="text-gray-600">
                {tOnboarding(
                  'pricingPublic.moneyBackGuarantee.features.riskFreeTrial.description'
                )}
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {tOnboarding(
                  'pricingPublic.moneyBackGuarantee.features.instantSetup.title'
                )}
              </h3>
              <p className="text-gray-600">
                {tOnboarding(
                  'pricingPublic.moneyBackGuarantee.features.instantSetup.description'
                )}
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {tOnboarding(
                  'pricingPublic.moneyBackGuarantee.features.messagingSupport.title'
                )}
              </h3>
              <p className="text-gray-600">
                {tOnboarding(
                  'pricingPublic.moneyBackGuarantee.features.messagingSupport.description'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MoneyBackGuarantee
