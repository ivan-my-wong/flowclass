import { BadGatewayException, HttpException } from '@nestjs/common'
import { AxiosError } from 'axios'

export interface IMetaErrorResponse {
  error?: {
    message?: string
    type?: string
    code?: number
    error_data?:
      | string
      | {
          messaging_product?: string
          details?: string
          error_message?: string
          [key: string]: unknown
        }
      | Record<string, unknown>
    error_subcode?: number
    error_user_msg?: string
    error_user_title?: string
    fbtrace_id?: string
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

export function formatMetaGraphApiErrorMessage(
  graphError: IMetaErrorResponse['error'],
  fallbackMessage: string
): string {
  if (!graphError) return fallbackMessage

  let details: string | undefined
  if (typeof graphError.error_data === 'string') {
    details = graphError.error_data
  } else if (typeof graphError.error_data === 'object' && graphError.error_data !== null) {
    const dataObj = graphError.error_data as Record<string, unknown>
    if (typeof dataObj.details === 'string') {
      details = dataObj.details
    } else if (typeof dataObj.error_message === 'string') {
      details = dataObj.error_message
    }
  }

  const userMsg = graphError.error_user_msg || graphError.error_user_title
  const rawMessage = graphError.message

  let mainMessage = ''
  if (details && rawMessage && !details.includes(rawMessage) && !rawMessage.includes(details)) {
    mainMessage = `${rawMessage}: ${details}`
  } else {
    mainMessage = details || userMsg || rawMessage || fallbackMessage
  }

  let finalMessage = decodeHtmlEntities(mainMessage.trim())

  const code = graphError.code
  if (code && !finalMessage.includes(`(#${code})`)) {
    finalMessage = `(#${code}) ${finalMessage}`
  }

  return finalMessage
}

export function throwMetaGraphApiError(error: unknown, fallbackMessage: string): never {
  if (error instanceof HttpException) {
    throw error
  }

  const axiosError = error as AxiosError<IMetaErrorResponse>
  const graphData = axiosError.response?.data
  const graphError = graphData?.error

  if (graphError) {
    console.error('[Meta Graph API Error]', JSON.stringify(graphError, null, 2))
    const finalMessage = formatMetaGraphApiErrorMessage(graphError, fallbackMessage)
    throw new BadGatewayException(finalMessage)
  }

  throw new BadGatewayException(fallbackMessage)
}
