import { TFunction } from 'i18next'
import { toast } from 'sonner'

export class ApiError implements Error {
  message!: any

  name!: string

  statusCode!: number

  constructor(message: string, statusCode: number) {
    this.message = message
    this.statusCode = statusCode
    this.name = 'ApiError'
  }
}

export default ApiError

export const handleApiError = ({
  error,
  t,
  showToast = false,
}: {
  error: any
  t: TFunction
  showToast?: boolean
}): string => {
  let errorMessage = t('common:errors.SERVER_ERROR')
  if (!(error instanceof ApiError)) {
    errorMessage = error.toString()
    toast.error(t(errorMessage))

    return errorMessage
  }

  switch (error.statusCode) {
    case 422:
      if (Array.isArray(error.message)) {
        errorMessage = ''
        error.message.forEach((messageObject: Record<any, string[]>) => {
          const errorKey = Object.keys(messageObject)[0]
          const errorValue = messageObject[errorKey].join(', ')
          errorMessage += `${errorKey}: ${errorValue}\n`
        })
      } else {
        errorMessage = error.message
      }

      if (errorMessage) {
        toast.error(t(errorMessage))
      }
      return errorMessage
    case 413:
      toast.error(`${t('common:errors.PAYLOAD_TOO_LARGE')}`)

      break
    case 403:
      if (showToast) {
        toast.error(`${t('common:errors.NOT_AUTHENTICATE')}`)
      }
      break
    case 400:
      errorMessage = ''
      if (Array.isArray(error.message)) {
        error.message.forEach((messageObject: Record<string, string>) => {
          Object.keys(messageObject).forEach(key => {
            errorMessage += `${messageObject[key]} \n`
          })
        })
      } else {
        errorMessage = error.message
      }

      errorMessage = errorMessage.replace(/[.:]/g, '')
      errorMessage = errorMessage.replace(' ', '_')

      toast.error(t(`common:errors.${errorMessage}`))
      return errorMessage
    default:
      break
  }

  return errorMessage
}
