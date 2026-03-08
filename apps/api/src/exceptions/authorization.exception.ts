import { UnauthorizedException } from '@nestjs/common'

import { AuthErrorMessage } from '@/exceptions/error-message/auth'

export class AuthorizationException extends UnauthorizedException {
  constructor(objectOrError?: string | object | any, description?: string) {
    super(objectOrError, description)
  }

  public static unauthorizedException(): AuthorizationException {
    return new AuthorizationException(AuthErrorMessage.ACCOUNT_NOT_FOUND)
  }

  public static notRegistered(): AuthorizationException {
    return new AuthorizationException(AuthErrorMessage.NOT_REGISTERED)
  }

  public static tokenExpiredException(): AuthorizationException {
    return new AuthorizationException(AuthErrorMessage.TOKEN_EXPIRED)
  }

  public static tokenInvalidException(message: string): AuthorizationException {
    return new AuthorizationException(message)
  }

  public static tokenDoesNotExistException(): AuthorizationException {
    return new AuthorizationException(AuthErrorMessage.TOKEN_DOES_NOT_EXIST)
  }

  public static tempLoginNotValid(): AuthorizationException {
    return new AuthorizationException(AuthErrorMessage.TEMP_LOGIN_NOT_VALID)
  }

  public static cannotDeleteException(): AuthorizationException {
    return new AuthorizationException(AuthErrorMessage.CAN_NOT_DELETE)
  }
}
