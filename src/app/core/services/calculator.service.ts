import { Injectable } from '@angular/core';
import { ControlCurrency } from '../interfaces/control-currency';
import { ExchangeRate } from '../interfaces/exchange-rate';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {
  convert(
    currencyControls: ControlCurrency[],
    index: number,
    exchangeRates: ExchangeRate[]
  ): ControlCurrency[] {
    const {
      amount: sourceAmount,
      label: { selectedLabel: sourceCurrencyLabel }
    } = currencyControls[index];

    return currencyControls.map(currency => {
      if (currency.label.selectedLabel === sourceCurrencyLabel) {
        return { ...currency };
      } else {
        const rate = this.getRate(
          sourceCurrencyLabel,
          currency.label.selectedLabel,
          exchangeRates
        );
        if (isNaN(rate)) {
          return { ...currency };
        }
        return {
          ...currency,
          amount: sourceAmount
            ? this.trimToTwoDecimalPlaces(sourceAmount * rate)
            : currency.amount
        };
      }
    });
  }

  // Recursive rate search
  private getRate(
    from: string,
    to: string,
    exchangeRates: ExchangeRate[],
    depth: number = 0
  ): number {
    // Limit recursion
    if (depth > 2) {
      return NaN;
    }

    if (from === to) return 1;

    // Search direct rate (USD/UAH = rate)
    let rateObj = exchangeRates.find(
      r => r.baseCurrency === from && r.targetCurrency === to
    );
    if (rateObj) {
      return rateObj.rate;
    }

    // Search reverse rate (UAH/USD = 1/rate)
    rateObj = exchangeRates.find(
      r => r.baseCurrency === to && r.targetCurrency === from
    );
    if (rateObj) {
      return 1 / rateObj.rate;
    }

    // Search rate through another currency (from USD to EUR, and then from EUR to UAH)
    const intermediary =
      depth % 2 === 0
        ? exchangeRates[0].targetCurrency
        : exchangeRates[1].targetCurrency;
    if (from === intermediary || to === intermediary) {
      return NaN;
    }

    const rateToIntermediary = this.getRate(
      from,
      intermediary,
      exchangeRates,
      depth + 1
    );
    const rateFromIntermediary = this.getRate(
      intermediary,
      to,
      exchangeRates,
      depth + 1
    );

    if (isNaN(rateToIntermediary) || isNaN(rateFromIntermediary)) {
      return NaN;
    }

    return rateToIntermediary * rateFromIntermediary;
  }

  trimToTwoDecimalPlaces(value: number, digitsAfterPoint = 2): number {
    const factor = Math.pow(10, digitsAfterPoint);
    return Math.floor(value * factor) / factor;
  }
}
