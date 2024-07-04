import { AbstractControl } from '@angular/forms';

export default function AmountValidator(control: AbstractControl) {
  const isNumeric = /^[0-9]*\.?[0-9]+$/.test(control.value);

  if (!control.value || !isNumeric || control.value <= 0) {
    return { notAmount: true };
  }

  return null;
}
