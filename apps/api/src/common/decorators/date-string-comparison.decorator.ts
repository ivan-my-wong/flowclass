import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import * as dayjs from 'dayjs'

export function IsDateStringCompare(
  compareType: 'before' | 'after',
  comparePropertyName: string,
  validationOptions?: ValidationOptions
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [compareType, comparePropertyName],
      validator: IsDateConstraint,
    })
  }
}

@ValidatorConstraint({ name: 'IsValidDateRangeConstraint' })
export class IsDateConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [compareType, comparePropertyName] = args.constraints
    const comparePropertyValue = args.object[comparePropertyName]
    if (!comparePropertyValue) {
      return true
    }
    if (compareType === 'before') {
      return dayjs(value).isBefore(dayjs(comparePropertyValue))
    } else {
      return dayjs(value).isAfter(dayjs(comparePropertyValue))
    }
  }
}
