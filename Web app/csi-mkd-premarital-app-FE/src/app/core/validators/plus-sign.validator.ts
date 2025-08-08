import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function noPlusSignValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const email = control.value as string;
    if (email && email.includes('+')) {
      return { plusSign: true };
    }
    return null;
  };
}
