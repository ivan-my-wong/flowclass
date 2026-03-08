import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class StudentUserRoleResponse {
  @Expose()
  email: string

  @Expose()
  firstName: string

  @Expose()
  lastName: string

  @Expose()
  permissions: StudentPermission[]
}

export class StudentPermission {
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
