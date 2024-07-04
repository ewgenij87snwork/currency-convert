import { AbstractControl } from '@angular/forms';
import { CurrencyLabel } from '../enums/currency-label';

const availableCurrencies = Object.values(CurrencyLabel);

export default function CurrencyLabelValidator(control: AbstractControl) {
  if (
    !control.value ||
    !availableCurrencies.includes(control.value.toUpperCase())
  )
    return { invalidCurrencyLabel: true };

  return null;
}
