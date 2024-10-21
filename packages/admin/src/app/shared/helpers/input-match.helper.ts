import { AbstractControl } from '@angular/forms';

// custom validator to check that two fields match
export function InputMatch(
  controlName: string,
  matchingControlName: string,
  inverse = false,
) {
  return (group: AbstractControl) => {
    const control = group.get(controlName);
    const matchingControl = group.get(matchingControlName);

    if (!control || !matchingControl) {
      return null;
    }

    if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
      return null;
    }

    if (!inverse && control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else if (inverse && control.value === matchingControl.value) {
      matchingControl.setErrors({ cannotMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
    return null;
  };
}
