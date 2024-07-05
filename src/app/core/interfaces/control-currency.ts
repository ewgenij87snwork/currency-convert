import { BehaviorSubject } from 'rxjs';
import { CurrencyLabel } from '../enums/currency-label';

export interface ControlCurrency {
  amount: number | null;
  label: {
    filteredLabels$: BehaviorSubject<CurrencyLabel[]>;
    selectedLabel: string;
    isCurrencyLabelValid: boolean;
  };
}
