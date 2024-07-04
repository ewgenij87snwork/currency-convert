import { BehaviorSubject, Observable } from 'rxjs';
import { CurrencyLabel } from '../enums/currency-label';

export interface ControlCurrency {
  amount: {
    current$: Observable<number>;
    amountValue: number;
  };
  label: {
    filteredLabels$: BehaviorSubject<CurrencyLabel[]>;
    selectedLabel: string;
    isCurrencyLabelValid: boolean;
  };
}
