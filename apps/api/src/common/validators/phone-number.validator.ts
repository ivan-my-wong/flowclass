import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ name: 'phoneNumber', async: false })
export class PhoneNumberRule implements ValidatorConstraintInterface {
  validate(phone: string): boolean {
    if (!phone) return false
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,9}$/
    return phoneRegex.test(phone)
  }

  defaultMessage(): string {
    return 'Invalid phone number'
  }
}

export function IsPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isPhoneNumber',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: PhoneNumberRule,
    })
  }
}
