import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * A validator that ensures the end date is not before the start date.
 * @param startKey The key for the start date control.
 * @param endKey The key for the end date control.
 */
export function dateRangeValidator(startKey: string, endKey: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const startControl = formGroup.get(startKey);
    const endControl = formGroup.get(endKey);

    if (!startControl || !endControl) {
      return null;
    }

    const startDate = startControl.value;
    const endDate = endControl.value;

    if (!startDate || !endDate) {
      return null;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      // Set error on the end control as well so it highlights
      endControl.setErrors({ ...endControl.errors, dateRange: true });
      return { dateRange: true };
    } else {
      // Clear the specific dateRange error from the end control if it was there
      if (endControl.hasError('dateRange')) {
        const { dateRange, ...otherErrors } = endControl.errors || {};
        endControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
      }
    }

    return null;
  };
}
