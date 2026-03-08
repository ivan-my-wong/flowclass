import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'

export function IsDateRange(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDateRange',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints
          const relatedValue = (args.object as any)[relatedPropertyName]
          return value instanceof Date && relatedValue instanceof Date && value >= relatedValue
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints
          return `${args.property} must be after ${relatedPropertyName}`
        },
      },
    })
  }
}
