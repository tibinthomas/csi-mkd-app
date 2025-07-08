import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const allowedDomains = [
  'gmail.com',
  'outlook.com',
  'yahoo.com',
  'hotmail.com',
  'icloud.com',
  'aol.com',
  'mail.com',
  'protonmail.com',
  'zoho.com',
  'yandex.com',
];

export function emailDomainValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value || '';
    const domain = value.split('@')[1];

    if (!value || !domain) {
      return null; // handled by required/email validators
    }

    return allowedDomains.includes(domain.toLowerCase())
      ? null
      : { invalidDomain: true };
  };
}
