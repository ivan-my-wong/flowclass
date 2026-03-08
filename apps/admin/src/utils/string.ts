import { t } from 'i18next'

import { CustomMessageVariable } from '../constants/common'

import { validateCustomDomain } from './validate'

export const randomCode = (length: number): string => {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}

export const siteDomainIfCustom = (
  customDomain: string | undefined,
  originalDomain: string | undefined
): string | undefined => {
  if (!customDomain || customDomain === '') return originalDomain
  if (!validateCustomDomain(customDomain)) return originalDomain
  return customDomain
}

export const downloadFile = (data: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(data)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()

  window.URL.revokeObjectURL(url)
  anchor.remove()
}

export const generateChangeString = (oldObj: any, newObj: any): string => {
  if (!oldObj || !newObj) return ''
  let changeString = ' '
  let isChangesDetected = false

  Object.keys(newObj).forEach(key => {
    if (oldObj[key] !== newObj[key]) {
      if (isChangesDetected) {
        changeString += ', '
      }
      changeString += `${t('student:activity.from')} ${key} ${oldObj[key]} ${t(
        'student:activity.to'
      )} ${newObj[key]}`
      isChangesDetected = true
    }
  })
  if (!isChangesDetected) {
    return ''
  }
  return changeString
}

type DynamicMessageProps = {
  studentName?: string
  paymentLink?: string
  institutionName?: string
  courseName?: string
  className?: string
  classLessonDate?: string
  newClassLessonDate?: string
}

export const generateDynamicMessage = (
  originalMessage: string,
  data: DynamicMessageProps
): string => {
  let msg = originalMessage ?? ''

  const replaceMessageVariable = (
    variable: string,
    value: string | undefined
  ) => {
    const regex = new RegExp(variable, 'g')
    msg = msg.replace(regex, value || '')
  }

  replaceMessageVariable(CustomMessageVariable.STUDENT_NAME, data.studentName)
  replaceMessageVariable(CustomMessageVariable.PAYMENT_LINK, data.paymentLink)
  replaceMessageVariable(
    CustomMessageVariable.SCHOOL_NAME,
    data.institutionName
  )
  replaceMessageVariable(CustomMessageVariable.COURSE_NAME, data.courseName)
  replaceMessageVariable(CustomMessageVariable.CLASS_NAME, data.className)

  return msg
}

export const generateMessage = (
  presetMessage: string,
  messageParams: Record<string, any>,
  defaultMessage: string
): string => {
  if (!presetMessage || typeof presetMessage !== 'string') {
    return defaultMessage
  }

  return generateDynamicMessage(presetMessage, messageParams) || defaultMessage
}

export const replaceLinksWithAnchorTags = (text: string): string => {
  // Define a regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.replace(urlRegex, url => {
    return `<a class="text-blue-400" href="${url}" target="_blank" rel="noopener noreferrer">Link here</a>`
  })
}

export const countPlaceholder = (text: string, placeholder: string): number => {
  if (!text || !placeholder) {
    return 0
  }

  const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(escapedPlaceholder, 'g')
  const matches = text.match(regex)
  return matches ? matches.length : 0
}

// Helper to extract fieldId, matching EnrollmentForm.tsx logic
export const extractFieldId = (id: string | number): string => {
  if (typeof id === 'string') {
    const [flag, , fieldId] = id.split('.')
    return fieldId || flag
  }
  return id?.toString()
}

export const arrayStringToCommaSeparated = (
  arrayString: string | string[]
): string => {
  if (Array.isArray(arrayString)) {
    return arrayString.join(', ')
  }
  if (
    typeof arrayString === 'string' &&
    arrayString.trim().startsWith('[') &&
    arrayString.trim().endsWith(']')
  ) {
    try {
      const parsed = JSON.parse(arrayString)
      if (Array.isArray(parsed)) {
        return parsed.join(', ')
      }
      return arrayString
    } catch {
      return arrayString
    }
  }
  return arrayString?.toString() ?? ''
}
