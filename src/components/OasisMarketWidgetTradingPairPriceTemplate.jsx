import OasisSignificantDigitsWrapper from '../containers/OasisSignificantDigits';
import OasisLoadingIndicator from './OasisLoadingIndicator';
import React from 'react';

export const OasisMarketWidgetTradingPairPriceTemplate = row => {
  if (row && row.initialMarketHistoryLoaded) {
    return row.tradingPairPrice ? (
      <OasisSignificantDigitsWrapper
        fractionalZerosGrey={false}
        fullPrecisionAmount={row.tradingPairPriceFullPrecision}
        amount={row.tradingPairPrice}
      />
    ) : (
      "N/A"
    );
  } else {
    return (
      <span style={{ position: "relative", right: "10px" }}>
        <OasisLoadingIndicator size="sm" />
      </span>
    );
  }
};