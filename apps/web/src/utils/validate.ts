import { StripeConnectionResponse, StripeConnectStatus } from '@/types/enrol'

export const validateAbsolutePath = (s?: string): boolean => {
  if (s) {
    const absolutePathRegex = /^\/([a-zA-Z0-9-_]+\/)*[a-zA-Z0-9-_]+\.[a-zA-Z0-9]+$/
    return absolutePathRegex.test(s)
  } else {
    return false
  }
}

export const validateEmail = (email: string): boolean => {
  if (!email || email === '') {
    return false
  }
  const emailRegex =
    /^(?=.{1,64}@)(?=.{1,254}$)[a-zA-Z0-9]+([._%+-][a-zA-Z0-9]+)*@([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/

  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  if (!phone || phone === '') {
    return false
  }

  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,9}$/
  return phoneRegex.test(phone)
}

export const validateDomain = (s?: string): boolean => {
  if (s) {
    const validDomain = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/
    const validSubdomain =
      /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.staging)?(\.flowclass\.io|\.course\.site|\.flowclass\.site|\.educator\.site)$/

    const healthCheckDomain = /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/
    const localhostDomain = /^localhost(:\d+)?$/

    return (
      validDomain.test(s) ||
      validSubdomain.test(s) ||
      healthCheckDomain.test(s) ||
      localhostDomain.test(s)
    )
  } else {
    return false
  }
}

export const isFlowclassSubDomain = (s?: string): boolean => {
  if (s) {
    const validSubdomain =
      /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.staging)?(\.flowclass\.io|\.course\.site|\.flowclass\.site|\.educator\.site)$/

    return validSubdomain.test(s)
  } else {
    return false
  }
}

export const isFlowclassRootDomain = (s?: string): boolean => {
  if (s) {
    const validSubdomain =
      /^(staging\.)?(flowclass\.io|course\.site|flowclass\.site|educator\.site)$/

    return validSubdomain.test(s)
  } else {
    return false
  }
}

export const validateColor = (color: string): boolean => {
  if (!color || color === '') {
    return false
  }
  const colorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/
  return colorRegex.test(color)
}

export const validateHttpsPath = (s?: string): boolean => {
  if (s) {
    const imagePathRegex = /^https:\/\//
    return imagePathRegex.test(s)
  } else {
    return false
  }
}

export const validateStripeConnection = (result: StripeConnectionResponse) => {
  if (
    result &&
    result.stripeAccountId &&
    result.stripeAccountId !== '' &&
    result.status &&
    result.status === StripeConnectStatus.COMPLETE &&
    result.enabled
  ) {
    return true
  }
  return false
}

export const isValidTime = (time: string) => {
  const date = new Date(time)
  return !isNaN(date.getTime())
}

export const validateLessonString = (timeString: string) => {
  if (!timeString || timeString === '' || timeString === ' ') return false

  const ISO_8601_REGEX =
    /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(\.\d+)?(Z|[+-]([01]\d|2[0-3]):?[0-5]\d)$/

  const [time1, time2] = timeString.split(' ')

  if (!ISO_8601_REGEX.test(time1) || !ISO_8601_REGEX.test(time2)) {
    return false
  }

  return true
}
