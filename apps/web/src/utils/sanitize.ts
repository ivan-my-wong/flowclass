import { GetServerSidePropsContext } from 'next/types'

import moment from 'moment'
import { Translate } from 'next-translate'

import { getSiteByCustomDomain } from '@/api/siteApi'
import { FieldTypes } from '@/constants/common'

import { formatPhoneNumber } from './format'

export type SectionTag =
  | 'COURSE_FEATURES'
  | 'COURSE_DESC'
  | 'COURSE_REVIEW'
  | 'COURSE_SYLLABUS'
  | 'COURSE_ARTICULATION'
  | 'COURSE_INSTRUCTOR'
  | 'COURSE_STUDENT_PERF'
  | 'COURSE_CERTIFICATION'
  | 'COURSE_APPLICATION'
  | 'COURSE_ENQUIRY'

export type SectionEditorState = Record<SectionTag, string>

const specialPrefix = '*SPECIAL_PREFIX*'

const sectionSeparator = '*SECTION_SEPARATOR*'

const sectionTitleSeparator = '*SECTION_TITLE*'

export const clearSeparator = (text?: string): string => {
  if (!text) {
    return ''
  }

  return text
    .replace(specialPrefix, '')
    .replace(sectionSeparator, '')
    .replace(sectionTitleSeparator, '')
}

export const onlyAlphaNumericAndSpace = (s?: string): string => {
  if (!s) return ''
  const cleaned = s.replace(/[^\p{L}\p{N}\s]/gu, '')
  return cleaned.trim() || 'defaultField'
}

export const stripHTML = (s?: string): string => {
  if (s && s !== '') {
    return s.replace(/(<([^>]+)>)/gi, '')
  } else return ''
}

export const removeLineSpace = (s: string): string => {
  if (s) {
    return s.replace(/(?:\r\n|\r|\n|`|")/g, '')
  } else {
    return ''
  }
}

// This is just so I can copy and paste the regex to remove class names
export const removeClassName = (s: string): string => {
  if (s) {
    return s.replace(/className=\{[^}]*\}/g, '')
  } else {
    return ''
  }
}

export const limitArrayItem = (arr: string[], num: number): string[] => {
  if (arr && arr.length !== 0) {
    return arr.slice(0, Math.min(num, arr.length))
  } else {
    return []
  }
}

export const getDomainFromReq = async (req: GetServerSidePropsContext['req']) => {
  // just to check if the header is correct, will remove in next update
  const hostHeader = req.headers.host || (req.headers[':authority'] as string)

  if (req.headers.host?.includes('localhost') || req.headers.host?.includes('192.168.')) {
    // For local dev: use TEST_DOMAIN if set, otherwise use the host header directly
    // Set TEST_DOMAIN in .env to the site URL registered in your admin (e.g. localhost:3001)
    return process.env.TEST_DOMAIN || hostHeader
  }

  try {
    const site = await getSiteByCustomDomain(hostHeader as string)
    if (site) {
      return site.url
    }
  } catch (error) {
    // pass
  }

  return hostHeader
}

export const getStudentInformationFromForm = (
  value: string | number | boolean | string[] | undefined,
  type: FieldTypes,
  t: Translate
): string => {
  let formattedValue = ''

  if (!value) {
    return ''
  } else if (typeof value === 'boolean') {
    formattedValue = value ? t('enrol:confirmDetailStep.yes') : t('enrol:confirmDetailStep.no')
  } else {
    switch (type) {
      case FieldTypes.DATE:
        formattedValue = moment(value).format('YYYY-MM-DD')
        break
      case FieldTypes.MULTIPLE_CHOICE:
        if (Array.isArray(value)) {
          formattedValue = value.join(', ')
        }
        break
      case FieldTypes.SWITCH:
        formattedValue = value ? t('enrol:confirmDetailStep.yes') : t('enrol:confirmDetailStep.no')
        break
      case FieldTypes.PHONE:
        formattedValue = formatPhoneNumber(value as unknown as string)
        break
      default:
        formattedValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
    }
  }

  return formattedValue
}
