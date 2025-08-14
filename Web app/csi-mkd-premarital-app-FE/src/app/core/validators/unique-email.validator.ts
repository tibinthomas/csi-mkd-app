import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { debounceTime, switchMap, map, catchError } from 'rxjs/operators';

type EmailCheckFn = (email: string) => Observable<any>;

export function emailExistsValidatorFactory(
  checkEmailFn: EmailCheckFn
): AsyncValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) return of(null);

    return of(control.value).pipe(
      debounceTime(300),
      switchMap((email) =>
        checkEmailFn(email).pipe(
          map((res: any) => {
            try {
              return res.Exists ? { emailTaken: true } : null;
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
