import apiClient from '.'

// Quote submission types
export interface SubmitQuoteDto {
  name: string
  email: string
  phone: string
  company?: string
  website?: string
  totalPrice: string
  recommendedPlan: string
  currency: string
  duration: string
  // Quiz data fields
  studentCount: string
  schoolCount: string
  setupAssistance: boolean
  adminStaff: string
  tutorCount: string
  classTypes: string[]
  premiumFeatures: string[]
  notificationChannels: string[]
  promotionFeatures: string[]
}

export interface SubmitQuoteResponse {
  success: boolean
  message: string
}

// Quote submission API
export const submitQuote = async (
  payload: SubmitQuoteDto
): Promise<SubmitQuoteResponse> => {
  const res = await apiClient.post({
    url: '/student/pricing-page/submit-quote',
    data: payload,
  })
  return (
    res?.data?.data ?? { success: false, message: 'Failed to submit quote' }
  )
}
