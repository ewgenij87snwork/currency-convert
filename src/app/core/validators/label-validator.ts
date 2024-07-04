import { AbstractControl } from '@angular/forms';
import { CurrencyLabel } from '../enums/currency-label';

const availableCurrencies = Object.values(CurrencyLabel);

export default function LabelValidator(control: AbstractControl) {
  if (
    !control.value ||
    (control.value.length > 2 &&
      !availableCurrencies.includes(control.value.toUpperCase()))
  )
    return { invalidCurrencyLabel: true };

  return null;
}
