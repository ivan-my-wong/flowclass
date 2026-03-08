// src/types/form-types.ts

// Extended recursion depth tracking
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...0[]]

/**
 * Safely limits recursion depth to prevent "excessively deep" errors
 * @template T - The type to make form-safe
 * @template Depth - Maximum recursion depth (default: 4)
 */
export type FormSafe<T, Depth extends number = 4> = Depth extends 0
  ? any
  : T extends object
  ? T extends (...args: any[]) => any
    ? T // Preserve function types
    : T extends Date | RegExp | Error | File | Blob
    ? T // Preserve built-in object types
    : T extends Array<infer U>
    ? Array<FormSafe<U, Prev[Depth]>> // Handle arrays properly
    : { [K in keyof T]: FormSafe<T[K], Prev[Depth]> }
  : T

/**
 * Deep partial that respects recursion limits
 */
export type DeepPartialSafe<T, Depth extends number = 4> = Depth extends 0
  ? any
  : T extends object
  ? T extends (...args: any[]) => any
    ? T
    : T extends Date | RegExp | Error | File | Blob
    ? T
    : T extends Array<infer U>
    ? Array<DeepPartialSafe<U, Prev[Depth]>>
    : { [K in keyof T]?: DeepPartialSafe<T[K], Prev[Depth]> }
  : T

/**
 * Breaks circular references by replacing them with 'any'
 * Usage: CircularSafe<YourType, 'circularProperty1' | 'circularProperty2'>
 */
export type CircularSafe<T, CircularKeys extends keyof T = never> = Omit<
  T,
  CircularKeys
> & {
  [K in CircularKeys]?: any
}

/**
 * Creates a form-safe version by combining multiple safety measures
 */
export type FormType<
  T,
  CircularKeys extends keyof T = never,
  Depth extends number = 4
> = FormSafe<CircularSafe<T, CircularKeys>, Depth>

/**
 * Optional form type - makes all properties optional while maintaining type safety
 */
export type OptionalFormType<
  T,
  CircularKeys extends keyof T = never,
  Depth extends number = 4
> = DeepPartialSafe<CircularSafe<T, CircularKeys>, Depth>

/**
 * Utility to extract nested property types safely
 */
export type SafeNestedType<
  T,
  Path extends string
> = Path extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? T[Key] extends object
      ? SafeNestedType<T[Key], Rest>
      : any
    : any
  : Path extends keyof T
  ? T[Path]
  : any

/**
 * Creates a flattened form type to avoid deep nesting issues
 */
export type FlattenFormType<T> = {
  [K in keyof T]: T[K] extends object
    ? T[K] extends (...args: any[]) => any
      ? T[K]
      : T[K] extends Date | RegExp | Error | File | Blob
      ? T[K]
      : any // Flatten complex objects to 'any'
    : T[K]
}

/**
 * Safe setValue type for React Hook Form
 */
export type SafeSetValue<T = any> = (
  name: string,
  value: any,
  options?: {
    shouldValidate?: boolean
    shouldDirty?: boolean
    shouldTouch?: boolean
  }
) => void

/**
 * Helper type for creating form field paths without type errors
 */
export type FormFieldPath = string

/**
 * Utility to create a form-specific type from any complex type
 */
export type CreateFormType<
  BaseType,
  FormFields extends Record<string, any> = {},
  CircularKeys extends keyof BaseType = never,
  Depth extends number = 4
> = FormSafe<CircularSafe<BaseType, CircularKeys>, Depth> & FormFields

// Pre-defined common form utilities
export type FormWithMeta<T> = T & {
  dataId?: number
  isDirty?: boolean
  isValid?: boolean
  errors?: Record<string, any>
}

/**
 * Utility for creating option types
 */
export type OptionType = {
  label: string
  value: string | number
}

/**
 * Safe array type for forms
 */
export type FormArray<T> = Array<FormSafe<T, 2>>

/**
 * Creates a type-safe form schema
 */
export type FormSchema<T> = {
  [K in keyof T]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array'
    required?: boolean
    defaultValue?: any
    validation?: any
  }
}

// Runtime utilities for safer form operations
export const createFormSafeSetValue = <T = any>(
  setValue: any
): SafeSetValue<T> => {
  return (name: string, value: any, options?: any) => {
    try {
      setValue(name as any, value, options)
    } catch (error) {
      console.warn(`FormSafe setValue failed for path: ${name}`, error)
      // Fallback: try setting without type checking
      ;(setValue as any)(name, value, options)
    }
  }
}

export const safeFormFieldPath = (path: string): FormFieldPath => path

// Enhanced runtime safety checks
export const isFormSafeObject = (value: any): value is Record<string, any> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export const hasCircularReference = (
  obj: any,
  seen = new WeakSet()
): boolean => {
  if (obj === null || typeof obj !== 'object') {
    return false
  }

  if (seen.has(obj)) {
    return true
  }

  seen.add(obj)

  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in obj) {
      // eslint-disable-next-line no-prototype-builtins
      if (obj.hasOwnProperty(key) && hasCircularReference(obj[key], seen)) {
        return true
      }
    }
  } catch (error) {
    // Handle cases where property access might throw
    return false
  }

  seen.delete(obj)
  return false
}

// Additional utility functions
export const safelyGetNestedValue = (obj: any, path: string): any => {
  try {
    return path.split('.').reduce((current, key) => {
      return current && typeof current === 'object' ? current[key] : undefined
    }, obj)
  } catch (error) {
    console.warn(`Failed to get nested value for path: ${path}`, error)
    return undefined
  }
}

export const safelySetNestedValue = (
  obj: any,
  path: string,
  value: any
): boolean => {
  try {
    const keys = path.split('.')
    const lastKey = keys.pop()
    if (!lastKey) return false

    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        // eslint-disable-next-line no-param-reassign
        current[key] = {}
      }
      return current[key]
    }, obj)

    target[lastKey] = value
    return true
  } catch (error) {
    console.warn(`Failed to set nested value for path: ${path}`, error)
    return false
  }
}

// Form field validation utilities
export const validateFormFieldPath = (path: string): boolean => {
  // Basic validation for common form field path patterns
  const validPathPattern = /^[a-zA-Z_][a-zA-Z0-9_.[\]]*$/
  return validPathPattern.test(path)
}

export const normalizeFormFieldPath = (path: string): string => {
  // Normalize array notation: array[0] -> array.0
  return path.replace(/\[(\d+)\]/g, '.$1')
}

// Debug utilities
export const debugFormType = <T>(obj: T, maxDepth: number = 3): void => {
  const seen = new WeakSet()

  const inspect = (value: any, depth: number, path: string = 'root'): void => {
    if (depth > maxDepth) {
      console.log(`${path}: [Max depth reached]`)
      return
    }

    if (value === null || typeof value !== 'object') {
      console.log(`${path}: ${typeof value} = ${value}`)
      return
    }

    if (seen.has(value)) {
      console.log(`${path}: [Circular reference]`)
      return
    }

    seen.add(value)

    if (Array.isArray(value)) {
      console.log(`${path}: Array[${value.length}]`)
      value.forEach((item, index) => {
        inspect(item, depth + 1, `${path}[${index}]`)
      })
    } else {
      console.log(`${path}: Object`)
      Object.keys(value).forEach(key => {
        inspect(value[key], depth + 1, `${path}.${key}`)
      })
    }

    seen.delete(value)
  }

  inspect(obj, 0)
}

// Type predicates for better runtime type checking
export const isFormArray = (value: any): value is any[] => {
  return Array.isArray(value)
}

export const isFormObject = (value: any): value is Record<string, any> => {
  return isFormSafeObject(value)
}

export const isFormPrimitive = (
  value: any
): value is string | number | boolean => {
  const type = typeof value
  return type === 'string' || type === 'number' || type === 'boolean'
}
