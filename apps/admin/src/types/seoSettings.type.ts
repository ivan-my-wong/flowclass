export interface SEOContent {
  metaTitle: string
  metaDescription: string
}
export interface CreateSEOSettingsTypes extends SEOContent {
  institutionId: number
  metaPixelId?: string
  googleAdsConversionId?: string
}
export interface UpdateCourseSEOSettingsTypes extends SEOContent {
  courseId: number
}
export type CreateSEOSettingsResponse = {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string
  createdBy: string
  updatedBy: string
  siteId: number
  institutionId: number
  courseId: number
  metaPixelId: string
  googleAdsConversionId: string
  seoContent: SEOContent
}
