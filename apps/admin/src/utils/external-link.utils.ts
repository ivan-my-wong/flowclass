import { t } from 'i18next'
import { toast } from 'sonner'

// eslint-disable-next-line import/prefer-default-export
export const goToExternalLink = (link: string, isSafari?: boolean): void => {
  try {
    // Validate the URL using the URL constructor
    const validatedUrl = new URL(link)

    // Proceed if the URL is valid
    if (isSafari) {
      // Safari-specific code
      window.location.href = validatedUrl.href
    } else {
      window.open(validatedUrl.href, '_blank', 'noopener,noreferrer')
    }
  } catch (error) {
    if (error instanceof Error) {
      // Use `react-toastify` to show a friendly error message
      toast.error(t('common:error.invalidUrl'))
    } else {
      // Handle unexpected error type
      toast.error(t('common:error.UNKNOWN_ERROR'))
    }
  }
}
