import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsBigInt(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isBigInt',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          try {
            return typeof BigInt(value) === 'bigint';
          } catch (e) {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid BigInt or string/number convertible to BigInt`;
        }
      }
    });
  };
}