import { Expose } from 'class-transformer'

import { InviteMember } from '@/models/invite-member.entity'

export class InviteUserResponse extends InviteMember {
  @Expose()
  isExistingUser: boolean
}
