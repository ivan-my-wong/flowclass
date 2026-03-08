import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'

@ValidatorConstraint({ name: 'identifier', async: false })
export class IdentifierRule implements ValidatorConstraintInterface {
  validate(identifier: string): boolean {
    if (!identifier) return false

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,9}$/

    return emailRegex.test(identifier) || phoneRegex.test(identifier)
  }

  defaultMessage(): string {
    return 'Must be a valid email or phone number'
  }
}
