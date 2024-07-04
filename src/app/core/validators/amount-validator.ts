import { AbstractControl } from '@angular/forms';

export default function AmountValidator(control: AbstractControl) {
  if (!control.value) return { notAmount: true };

  const parsedValue = parseFloat(control.value);
  return isNaN(parsedValue) || parsedValue <= 0 ? { notAmount: true } : null;
}
