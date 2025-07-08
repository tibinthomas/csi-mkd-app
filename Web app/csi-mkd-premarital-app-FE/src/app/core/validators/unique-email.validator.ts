import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { debounceTime, switchMap, map, catchError } from 'rxjs/operators';
import { PremaritalRegisterService } from '../../../api/services/premarital-register.service';

export function uniqueEmailValidator(): AsyncValidatorFn {
  const service = inject(PremaritalRegisterService);
  return (control: AbstractControl) => {
    if (!control.value) return of(null);
    console.log('Validator triggered with:', control.value);
    return of(control.value).pipe(
      debounceTime(300),
      switchMap((email) =>
        service.apiPremaritalRegisterCheckEmailGet({ email }).pipe(
          map((res: any) => {
            try {
              const data = typeof res === 'string' ? JSON.parse(res) : res;
              return data.exists ? { emailTaken: true } : null;
            } catch (e) {
              console.error('Failed to parse response:', res);
              return null;
            }
          }),
          catchError((err) => {
            console.error('Email check error', err);
            return of(null);
          })
        )
      )
    );
  };
}
