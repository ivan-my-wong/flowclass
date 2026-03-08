import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class StudentUserDetailDto {
  @Expose()
  id: number

  @Expose()
  email: string

  @Expose()
  firstName: string

  @Expose()
  lastName: string

  @Expose()
  isEmailVerified: boolean

  @Expose()
  phone: string

  @Expose()
  lastActiveTime: Date

  @Expose()
  avatarUrl: string

  @Expose()
  company: string

  @Expose()
  position: string

  @Expose()
  social: string

  @Expose()
  country: string

  @Expose()
  deletedAt: Date

  @Expose()
  visibility: string
}
