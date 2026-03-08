import { Exclude, Expose } from 'class-transformer'

import { TextVersion, WebsiteTemplate } from '@/models/enums'
import { SocialMedia } from '@/models/setting-webpage-institutions.entity'

@Exclude()
export class SettingWebpageInstitutionDetailDto {
  @Expose()
  id: number

  @Expose()
  siteId: number

  @Expose()
  institutionId: number

  @Expose()
  bannerImage: string

  @Expose()
  name: string

  @Expose()
  themeColor: string

  @Expose()
  templates: WebsiteTemplate

  @Expose()
  secondaryColor: string

  @Expose()
  highlightColor: string

  @Expose()
  socialMedia: SocialMedia[]

  @Expose()
  termsCondition: string

  @Expose()
  studentLogin: boolean

  @Expose()
  textVersion?: TextVersion
}
