import { FormControl } from '@angular/forms';

export interface CurrencyFormGroup {
  amount: FormControl<number | null>;
  label: FormControl<string | null>;
}
