import { Convert } from 'easy-currencies'

import { StripeCurrency } from '../types/stripe-connect'

export const validatePhone = (phone: string): boolean => {
  if (!phone || phone === '') {
    return false
  }

  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,9}$/
  return phoneRegex.test(phone)
}

export const validateEmail = (email: string): boolean => {
  if (!email || email === '') {
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateColor = (color: string): boolean => {
  if (!color || color === '') {
    return false
  }
  const colorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/
  return colorRegex.test(color)
}

export const validatePassword = (password: string): boolean => {
  if (!password || password === '') {
    return false
  }

  // Check minimum length
  if (password.length < 8) {
    return false
  }

  const numbers = /\d/
  const hasNumber = numbers.test(password)

  const uppercase = /[A-Z]/
  const hasUppercase = uppercase.test(password)

  const lowercase = /[a-z]/
  const hasLowercase = lowercase.test(password)

  const specialCharacters = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/
  const hasSpecialCharacter = specialCharacters.test(password)

  const typesCount = [
    hasNumber,
    hasUppercase,
    hasLowercase,
    hasSpecialCharacter,
  ].filter(Boolean).length

  return typesCount >= 3
}

export const validateDomain = (str: string): boolean => {
  if (!str) {
    return false
  }
  return /^[a-zA-Z0-9\-_/]*(%[0-9a-fA-F]{2}[a-zA-Z0-9\-_/]*)*$/.test(str)
}

export const validateCustomDomain = (str: string): boolean => {
  // check for all lowercase and no special characters except . and -
  // have at least one dot, special character is not placed at beginning or end
  return /^(?:[a-z0-9]+(?:[-.][a-z0-9]+)*\.[a-z0-9]+(?:[-.][a-z0-9]+)*|)$/.test(
    str
  )
}

/**
 * Validates free-form domain input (no preset suffix).
 * Accepts: localhost, example.com, my-school.local, sub.domain.co.uk
 */
export const validateFreeFormDomain = (str: string): boolean => {
  if (!str?.trim()) return false
  const s = str.trim().toLowerCase()
  if (s === 'localhost') return true
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(
    s
  )
}

export const validateAbsolutePath = (s?: string): boolean => {
  if (s) {
    const absolutePathRegex =
      /^\/([a-zA-Z0-9-_]+\/)*[a-zA-Z0-9-_]+\.[a-zA-Z0-9]+$/
    return absolutePathRegex.test(s)
  }
  return false
}

export const validateFullUrl = (s?: string): boolean => {
  if (s) {
    const absolutePathRegex =
      /^((http|https)?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-./?%&=]*)?$/

    return absolutePathRegex.test(s)
  }
  return false
}
export const validateInputLength = (str: string, length = 200): boolean => {
  if (!str || str.length > length) {
    return false
  }
  return true
}
export const validateCouponCode = (str: string): boolean => {
  if (!str) {
    return false
  }
  return /^[a-zA-Z0-9]+$/.test(str)
}

export const validateRedeemable = (str: string): boolean => {
  if (!str || str.length > 20 || str === '0') {
    return false
  }

  return Number.isInteger(parseInt(str, 10))
}

export const validateDiscountAmount = (str: string): boolean => {
  if (!str) {
    return false
  }

  return /^\d*\.?\d{0,20}$/.test(str)
}

export const validateCourseLowestPrice = async (
  price: number,
  currency: string
): Promise<boolean> => {
  try {
    const value = await Convert(price).from(currency).to(StripeCurrency.USD)
    return value >= 0.5
  } catch (error: any) {
    throw new Error(error)
  }
}

export const validateIsoDate = (str?: string): boolean => {
  if (!str) return false
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false
  const d = new Date(str)
  return (
    d instanceof Date && !Number.isNaN(d.getTime()) && d.toISOString() === str
  ) // valid date
}

export const isNullOrUndefined = (val: unknown): val is null | undefined => {
  return val === null || val === undefined
}
