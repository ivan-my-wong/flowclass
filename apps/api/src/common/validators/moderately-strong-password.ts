import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'

@ValidatorConstraint({ name: 'IsModeratelyStrongPassword' })
export class IsModeratelyStrongPassword implements ValidatorConstraintInterface {
  validate(value: string) {
    const hasLowerCase = /[a-z]/.test(value)
    const hasUpperCase = /[A-Z]/.test(value)
    const hasNumber = /[0-9]/.test(value)
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(value)

    const count = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar].filter(Boolean).length

    return count >= 3
  }

  defaultMessage() {
    return `The password did not contain at least a lower case letter, an upper case letter and a number`
  }
}
