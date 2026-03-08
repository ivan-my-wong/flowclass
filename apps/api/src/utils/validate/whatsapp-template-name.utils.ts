import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

export const whatsappTemplateNameDefaultMessage =
  'WhatsApp template name. Name of the template can only contain lowercase alphanumeric characters and underscores ( _ ). No other characters or white space are allowed'

@ValidatorConstraint({ name: 'IsValidWhatsappTemplateName', async: false })
export class IsValidWhatsappTemplateNameConstraint implements ValidatorConstraintInterface {
  validate(name: string): boolean {
    return /^[a-zA-Z0-9_]+$/.test(name)
  }
  defaultMessage(): string {
    return whatsappTemplateNameDefaultMessage
  }
}

export function IsValidWhatsappTemplateName(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidWhatsappTemplateNameConstraint,
    })
  }
}
