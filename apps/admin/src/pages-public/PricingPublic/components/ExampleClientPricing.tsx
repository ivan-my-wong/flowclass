import { useTranslation } from 'react-i18next'
import { LuCheck } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import { formatCurrencyWithName } from '@/utils/currency'

interface ExampleClientPricingProps {
  selectedCurrency: 'HKD' | 'USD'
  selectedDuration: 'month' | 'year'
}

const ExampleClientPricing = ({
  selectedCurrency,
  selectedDuration,
}: ExampleClientPricingProps): JSX.Element => {
  const { t: tOnboarding } = useTranslation('onboarding')

  // Calculate display price based on currency and duration
  const getDisplayPrice = (basePrice: number): string => {
    let price = basePrice

    // Convert to USD if needed (approximate conversion rate)
    if (selectedCurrency === 'USD') {
      price = Math.round(price * 0.128) // Approximate HKD to USD conversion
    }

    // Convert to monthly if needed
    if (selectedDuration === 'month') {
      price = Math.round(price / 12)
    }

    const durationText = selectedDuration === 'month' ? 'month' : 'year'

    return `${formatCurrencyWithName(price, selectedCurrency)}/${durationText}`
  }

  return (
    <div className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {tOnboarding('pricingPublic.exampleClientPricing.title')}
          </h2>
          <p className="text-xl text-gray-600">
            {tOnboarding('pricingPublic.exampleClientPricing.subtitle')}
          </p>
        </div>

        {/* Example Pricing Table */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      {tOnboarding(
                        'pricingPublic.exampleClientPricing.tableHeaders.item'
                      )}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      {tOnboarding(
                        'pricingPublic.exampleClientPricing.tableHeaders.quantity'
                      )}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      {tOnboarding(
                        'pricingPublic.exampleClientPricing.tableHeaders.pricing'
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Base Users - 500 students */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {tOnboarding(
                        'pricingPublic.exampleClientPricing.items.baseUsers'
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {tOnboarding(
                        'pricingPublic.exampleClientPricing.quantities.baseUsers'
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                      {getDisplayPrice(2800)}
                    </td>
                  </tr>

                  {/* Additional Schools - 2 additional schools (3 total, first included) */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {tOnboarding(
                        'pricingPublic.exampleClientPricing.items.multipleSchools'
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {tOnboarding(
                        'pricingPublic.exampleClientPricing.quantities.multipleSchools'
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                      {getDisplayPrice(1000)}
                    </td>
                  </tr>

                  {/* Additional Admins - 2 additional admins (3 total, first included) */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {tOnboarding(
                        'pricingPublic.exampleClientPricing.items.multipleAdmins'
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {tOnboarding(
                        'pricingPublic.exampleClientPricing.quantities.multipleAdmins'
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                      {getDisplayPrice(600)}
                    </td>
                  </tr>

                  {/* Additional Tutors - 3 additional tutors (5 total, first 2 included) */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {tOnboarding(
                        'pricingPublic.exampleClientPricing.items.multipleTutors'
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {tOnboarding(
                        'pricingPublic.exampleClientPricing.quantities.multipleTutors'
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                      {getDisplayPrice(600)}
                    </td>
                  </tr>

                  {/* Class Types - All types */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {tOnboarding(
                        'pricingPublic.exampleClientPricing.items.classTypes'
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {tOnboarding(
                        'pricingPublic.exampleClientPricing.quantities.classTypes'
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                      {getDisplayPrice(2400)}
                    </td>
                  </tr>

                  {/* Student Portal */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {tOnboarding(
                        'pricingPublic.exampleClientPricing.items.studentPortal'
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      <LuCheck className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                      {getDisplayPrice(800)}
                    </td>
                  </tr>

                  {/* QR Code Attendance */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {tOnboarding(
                        'pricingPublic.exampleClientPricing.items.qrAttendance'
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      <LuCheck className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                      {getDisplayPrice(800)}
                    </td>
                  </tr>

                  {/* WhatsApp Notifications */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {tOnboarding(
                        'pricingPublic.exampleClientPricing.items.emailWhatsApp'
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      <LuCheck className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                      {getDisplayPrice(800)}
                    </td>
                  </tr>

                  {/* Advanced Promotions */}
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {tOnboarding(
                        'pricingPublic.exampleClientPricing.items.advancedPromotions'
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      <LuCheck className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                      {getDisplayPrice(1800)}
                    </td>
                  </tr>

                  <tr className="bg-primary-50 border-t-2">
                    <td className="px-6 py-4 text-lg font-bold text-gray-900">
                      {tOnboarding('pricingPublic.exampleClientPricing.total')}
                    </td>
                    <td className="px-6 py-4 text-center" />
                    <td className="px-6 py-4 text-center text-lg font-bold text-primary">
                      {getDisplayPrice(10600)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-8">
            <p className="text-lg text-gray-700 mb-4">
              <strong>
                {tOnboarding(
                  'pricingPublic.exampleClientPricing.additionalInfo.title',
                  'Example: Growing Education Centre'
                )}
              </strong>
            </p>
            <p className="text-lg text-gray-700 mb-4">
              {tOnboarding(
                'pricingPublic.exampleClientPricing.additionalInfo.description',
                'This example shows pricing for a growing education centre with 500 students, 3 schools, 3 admins, 5 tutors, and all advanced features. First school, first admin, and first 2 tutors are included in base pricing.'
              )}
            </p>

            <Button
              onClick={e => {
                e.stopPropagation()
                window.open('https://flowclass.io/contact', '_blank')
              }}
            >
              {tOnboarding('pricingPublic.featureBreakdown.contactSales')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExampleClientPricing
