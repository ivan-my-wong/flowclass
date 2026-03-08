import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Observable } from 'rxjs'
/**
 * Guard that protects routes from unauthorized access by validating the
 * 'x-flowclass__api_token' header against the configured API token.
 *
 * Used primarily to secure webhook endpoints for workflow automation.
 */
@Injectable()
export class WebHookGuard implements CanActivate {
  /**
   * Validates the incoming request's API token.
   * @param context The execution context
   * @returns True if the API token is valid, otherwise throws UnauthorizedException
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const headers = request.headers
    const apiToken = headers['x-flowclass__api_token']
    if (!apiToken) {
      throw new UnauthorizedException('Invalid API token')
    }
    return apiToken === process.env.FLOWCLASS__API_TOKEN
  }
}
