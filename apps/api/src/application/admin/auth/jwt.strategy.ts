import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { TAppConfig } from '@/config/config.schema'
import { AuthService } from '@/domain/service/auth.service'
import { AuthorizationException } from '@/exceptions/authorization.exception'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'ADMIN') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<TAppConfig>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    })
  }

  async validate({ id }) {
    const user = await this.authService.validateUser(id)

    if (!user) {
      throw AuthorizationException.unauthorizedException()
    }

    return user
  }
}
