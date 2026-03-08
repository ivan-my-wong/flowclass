import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class SettingSiteDetailDto {
  @Expose()
  id: number

  @Expose()
  siteId: number

  @Expose()
  language: string

  @Expose()
  timeZone: string

  @Expose()
  currency: string

  @Expose()
  country: string

  @Expose()
  countryCode: string
}
