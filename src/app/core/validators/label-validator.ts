import { AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { CurrencyLabel } from '../enums/currency-label';

const availableCurrencies = Object.values(CurrencyLabel);

export default function LabelValidator(filteredLabels$: Observable<string[]>) {
  return (control: AbstractControl) => {
    if (
      !control.value ||
      (control.value.length > 1 &&
        !availableCurrencies.includes(control.value.toUpperCase()))
    ) {
      return { invalidCurrencyLabel: true };
    }

    let labels: string[] = [];
    filteredLabels$.subscribe({
      next: filteredLabels => {
        labels = filteredLabels;
      }
    });

    if (!labels.includes(control.value.toUpperCase())) {
      return { labelUnavailable: true };
    }

    return null;
  };
}
