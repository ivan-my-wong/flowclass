import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator'

import { ISO_8601_REGEX } from '@/common/constants'

export function IsTimeString(
  pattern: 'hh:mm:ss' | 'hh:mm' | 'hh:mm-hh:mm',
  validationOptions?: ValidationOptions
): PropertyDecorator {
  if (!validationOptions) {
    validationOptions = {
      message: `must be a valid time value ${pattern}`,
    }
  }
  return ValidateBy(
    {
      name: '',
      constraints: [],
      validator: {
        validate: (value): boolean => isValidTimeString(value, pattern),
        defaultMessage: buildMessage(
          (eachPrefix) => `${eachPrefix} must be a valid time value`,
          validationOptions
        ),
      },
    },
    validationOptions
  )
}

export function IsTimeSlotString(validationOptions?: ValidationOptions): PropertyDecorator {
  if (!validationOptions) {
    validationOptions = {
      message: `must be a valid time value,\nex: 2023-06-17T13:00:00.000Z 2023-06-17T15:00:00.000Z`,
    }
  }
  return ValidateBy(
    {
      name: 'MUST_BE_ISO_8601_TIME_VALUE ',
      constraints: [],
      validator: {
        validate: (value): boolean => isValidTimeSlot(value, true),
        defaultMessage: buildMessage(
          (eachPrefix) => `${eachPrefix} must be a valid time slot value`,
          validationOptions
        ),
      },
    },
    validationOptions
  )
}

export function IsValidISOTimeRange(validationOptions?: ValidationOptions): PropertyDecorator {
  if (!validationOptions) {
    validationOptions = {
      message: `must be a valid time value,\nex: 2023-06-17T13:00:00.000Z 2023-06-17T15:00:00.000Z\nwith start time is before end time`,
    }
  }
  return ValidateBy(
    {
      name: 'START_TIME_MUST_COMES_BEFORE_END_TIME ',
      constraints: [],
      validator: {
        validate: (value): boolean => isValidTimeRange(value),
        defaultMessage: buildMessage(
          (eachPrefix) => `${eachPrefix} must be a valid time range value`,
          validationOptions
        ),
      },
    },
    validationOptions
  )
}

export function IsISOTimeString(validationOptions?: ValidationOptions): PropertyDecorator {
  if (!validationOptions) {
    validationOptions = {
      message: `must be a valid time value,\nex: 2023-06-17T13:00:00.000Z`,
    }
  }
  return ValidateBy(
    {
      name: 'MUST_BE_VALID_IOS_8061_TIME ',
      constraints: [],
      validator: {
        validate: (value): boolean => isValidTimeSlot(value),
        defaultMessage: buildMessage(
          (eachPrefix) => `${eachPrefix} must be a valid time value`,
          validationOptions
        ),
      },
    },
    validationOptions
  )
}

export const isValidTimeString = (value: string, pattern: string) => {
  if (!value) return false
  if (value.length === 0) return false
  let regex
  if (pattern === 'hh:mm') {
    regex = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/
  } else if (pattern === 'hh:mm:ss') {
    regex = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9]):([0-5][0-9])(:[0-5][0-9])?$/
  } else if (pattern === 'hh:mm-hh:mm') {
    regex = /^(?:[01]\d|2[0-3]):[0-5]\d-(?:[01]\d|2[0-3]):[0-5]\d$/
  }
  const isValid = regex.test(value)
  return isValid
}

export const isValidTimeSlot = (value: string, isSlot = false) => {
  if (isSlot) {
    const times = value.split(' ')
    return times.length === 2 && ISO_8601_REGEX.test(times[0]) && ISO_8601_REGEX.test(times[1])
  } else {
    return ISO_8601_REGEX.test(value)
  }
}

export const isValidTimeRange = (value: string) => {
  const times = value.split(' ')
  const validFormat =
    times.length === 2 && ISO_8601_REGEX.test(times[0]) && ISO_8601_REGEX.test(times[1])
  if (validFormat) {
    const start = new Date(times[0])
    const end = new Date(times[1])
    return start.getTime() < end.getTime()
  }
  return false
}
