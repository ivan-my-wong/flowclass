import { TFunction } from 'i18next'

import { FieldTypes } from '@/constants/enrollmentFormFieldNames'

import { countryConfig, countryOptions } from '../constants/countryConfig'
import { Site } from '../stores/siteData'
import { UserRole } from '../stores/userPermissionData'
import { AddressDetail } from '../types/school'
import { BaseUserRole, SinglePermission } from '../types/user'

import dayjs from './dayjs'
import { formatPhoneNumber } from './misc'
import { arrayStringToCommaSeparated } from './string'

export const getUserRole = (user?: SinglePermission): UserRole => {
  if (!user) {
    return UserRole.Student
  }
  if (user.isMasterAdmin) {
    return UserRole.MasterAdmin
  }
  if (user.isSiteManager) {
    return UserRole.SiteAdmin
  }
  if (user.isInstitutionManager) {
    return UserRole.SchoolAdmin
  }
  if (user.isInstructor) {
    return UserRole.Instructor
  }
  if (user.isOperator) {
    return UserRole.Operations
  }

  return UserRole.Guest
}

export const getUserRoleFromArray = (
  permissions: SinglePermission[],
  siteId: number,
  schoolId?: number
): UserRole => {
  // not sure if this is needed
  // const isMasterAdmin = permissions.find(
  //   permission => permission.siteId === 0 && permission.institutionId === 0
  // )

  const isMasterAdmin = permissions.find(permission => permission.isMasterAdmin)

  if (isMasterAdmin && Object.keys(isMasterAdmin).length > 0) {
    return getUserRole(isMasterAdmin)
  }

  let roleObject
  if (!schoolId || schoolId === 0) {
    roleObject = permissions.find(permission => permission.siteId === siteId)
  } else {
    roleObject = permissions.find(
      permission =>
        permission.siteId === siteId && permission.institutionId === schoolId
    )
  }

  if (roleObject) {
    return getUserRole(roleObject)
  }

  return UserRole.Guest
}

export const getSinglePermissionFromUserRole = (
  userRole: BaseUserRole,
  siteId: number
): SinglePermission => {
  return {
    userId: userRole.id,
    siteId,
    institutionId: userRole.institutionId,
    isInstitutionManager: userRole.isInstitutionManager,
    isInstructor: userRole.isInstructor,
    isMasterAdmin: userRole.isMasterAdmin,
    isOperator: userRole.isOperator,
    isSiteManager: userRole.isSiteManager,
    isStudent: userRole.isStudent,
  }
}

export const rearrangeOrder = <T extends { id: number }>(
  data: T[],
  order: number[]
): T[] => {
  if (!data || !order || order.length <= 1) return data

  const sortedData = [...data].sort((a, b) => {
    const aIndex = order.indexOf(a.id)
    const bIndex = order.indexOf(b.id)
    if (aIndex === -1) {
      return 1
    }
    if (bIndex === -1) {
      return -1
    }
    return aIndex - bIndex
  })
  return sortedData
}

export const getCountryCodeFromConfig = (currentSite: Site | null): string => {
  if (!currentSite) return 'us'
  const defaultCountry = countryOptions.find(obj => {
    return obj.name === currentSite?.country
  })

  return defaultCountry?.value?.toLocaleLowerCase() ?? 'us'
}

export const countryNameToCode = (name?: string) => {
  if (!name) return null
  return countryConfig.find(item => item.name === name)?.code
}

export const mapLanguageCodeToValueOnly = (languageCode: string): string => {
  // return zh-Hant and zh-Hans if the origial is zh-hk or zh-tw
  if (
    languageCode.toLocaleLowerCase() === 'zh-hk' ||
    languageCode.toLocaleLowerCase() === 'zh-tw' ||
    languageCode === 'zh'
  ) {
    return 'zh-Hant'
  }
  if (languageCode.toLocaleLowerCase() === 'zh-cn') {
    return 'zh-Hans'
  }
  return languageCode.split('-')[0]
}

export const addressObjectToString = (address?: AddressDetail) => {
  if (!address) return ''
  return Object.values(address).join(', ')
}

export const convertCustomFieldToValue = ({
  fieldValue,
  fieldType,
  t,
}: {
  fieldValue: string | number | string[] | null
  fieldType: FieldTypes
  t: TFunction
}): any => {
  if (!fieldValue) return ''

  let date
  switch (fieldType) {
    case FieldTypes.PHONE:
      return fieldValue ? formatPhoneNumber(fieldValue.toString()) : ''
    case FieldTypes.DATE:
      if (!fieldValue || typeof fieldValue !== 'string') return ''
      date = new Date(fieldValue)
      if (Number.isNaN(date.getTime())) return fieldValue
      return dayjs(date).format('YYYY-MM-DD')
    case FieldTypes.MULTIPLE_CHOICE:
      return arrayStringToCommaSeparated(fieldValue?.toString() ?? '')
    case FieldTypes.SINGLE_CHOICE:
    case FieldTypes.DROPDOWN_LIST:
    case FieldTypes.COUNTRY:
      return fieldValue?.toString() ?? ''
    case FieldTypes.SWITCH:
      if ((fieldValue && fieldValue !== 'false') || fieldValue === 'true') {
        return t('common:action.yes')
      }
      return t('common:action.no')
    case FieldTypes.EMAIL:
      return fieldValue ?? ''
    case FieldTypes.NUMBER:
      return fieldValue ?? ''
    case FieldTypes.PARAGRAPH:
    case FieldTypes.SHORT_ANSWER:
      return fieldValue ?? ''
    default:
      return fieldValue ?? ''
  }
}
