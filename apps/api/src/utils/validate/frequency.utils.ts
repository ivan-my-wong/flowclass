import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
const validSuffixes = ['second', 'hour', 'minute', 'day', 'week']
export const defaultMessage = `The frequency must be a number followed by a valid unit (${validSuffixes.join(
  ', '
)}). Example: "3 hour"`
@ValidatorConstraint({ async: false })
export class IsValidFrequencyConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    const regex = new RegExp(`^\\d+\\s(${validSuffixes.join('|')})$`)
    return regex.test(value)
  }

  defaultMessage(): string {
    return defaultMessage
  }
}

export function IsValidFrequency(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidFrequencyConstraint,
    })
  }
}
