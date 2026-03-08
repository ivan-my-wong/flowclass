import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayUnique, IsArray, IsEnum, IsInt } from 'class-validator'

export enum SiteFeature {
  BulkSendDocuments = 'bulkSendDocuments',
  CertificateTemplates = 'certificateTemplates',
  PaymentCampaign = 'paymentCampaign',
  ReceiptTemplates = 'receiptTemplates',
  LessonMatrix = 'lessonMatrix',
  BundleDiscounts = 'bundleDiscounts',
  ClassMaterials = 'classMaterials',
}

export class SiteFeatureEnabledDto {
  @ApiProperty({
    type: [Number],
    required: true,
  })
  @IsArray()
  @Type(() => Number)
  @ArrayUnique()
  @IsInt({ each: true })
  siteIds: number[]

  @ApiProperty({
    required: true,
    type: String,
    enum: SiteFeature,
  })
  @IsEnum(SiteFeature)
  feature: SiteFeature
}
