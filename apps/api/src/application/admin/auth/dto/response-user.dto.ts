import { Expose } from 'class-transformer'

export class ResponseUserDto {
  id?: number

  email: string

  firstName: string

  lastName: string

  sites: SiteDto[]

  permissions: Permission[]
}

export class SiteDto {
  siteId: number

  url: string

  email: string

  phone: string

  banner: string

  logo: string

  institutions: InstitutionDto[]
}

export class InstitutionDto {
  institutionId: number

  email: string

  phone: string

  siteId: number

  name: string

  url: string

  gallery: string
}

export class Permission {
  @Expose()
  siteId: number

  @Expose()
  institutionId: number

  @Expose()
  isMasterAdmin: boolean

  @Expose()
  isSiteManager: boolean

  @Expose()
  isInstitutionManager: boolean

  @Expose()
  isInstructor: boolean

  @Expose()
  isOperator: boolean
}
