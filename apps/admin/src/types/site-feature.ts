export enum SiteFeature {
  BulkSendDocuments = 'bulkSendDocuments',
  CertificateTemplates = 'certificateTemplates',
  PaymentCampaign = 'paymentCampaign',
  // ReceiptTemplates = 'receiptTemplates',
  TemplateManagement = 'templateManagement',
  LessonMatrix = 'lessonMatrix',
  BundleDiscounts = 'bundleDiscounts',
  ClassMaterials = 'classMaterials',
}

export interface SiteFeatureRecord {
  id?: number
  created_at?: string
  updated_at?: string
  deleted_at?: string
  created_by?: number
  updated_by?: number
  feature: SiteFeature
  siteIds: number[]
}

export interface Site {
  id: number
  name: string
  url?: string
}
