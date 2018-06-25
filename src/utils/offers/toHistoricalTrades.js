import React from 'react';
import moment from 'moment/moment';
import BigNumber from 'bignumber.js';

import { formatAmount, formatPrice, price } from '../tokens/pair';
import OasisTradeType from '../../components/OasisTradeType';

export const toHistoricalTrades = (tradeHistoryEntry, userAccountAddress, baseToken, quoteToken) => {
  let baseAmount = null, quoteAmount = null;
  if (
    tradeHistoryEntry.buyWhichToken === quoteToken &&
    tradeHistoryEntry.sellWhichToken === baseToken
  ) {
    baseAmount = new BigNumber(tradeHistoryEntry.sellHowMuch);
    quoteAmount = new BigNumber(tradeHistoryEntry.buyHowMuch);
  } else if (
    tradeHistoryEntry.buyWhichToken === baseToken &&
    tradeHistoryEntry.sellWhichToken === quoteToken
  ) {
    baseAmount = new BigNumber(tradeHistoryEntry.buyHowMuch);
    quoteAmount = new BigNumber(tradeHistoryEntry.sellHowMuch);
  }
  return {
    transactionHash: tradeHistoryEntry.transactionHash,
    date: moment.unix(tradeHistoryEntry.timestamp).format("DD-MM HH:mm"),
    tradeType: (
      <OasisTradeType
        order={tradeHistoryEntry}
        baseCurrency={baseToken}
        userToTradeBaseRelation={tradeHistoryEntry.userToTradeBaseRelation}
        userToTradeAdditionalRelation={tradeHistoryEntry.userToTradeAdditionalRelation}
      />
    ),
    baseAmount: formatAmount(baseAmount, true),
    baseAmountFullPrecision: baseAmount,
    quoteAmount: formatAmount(quoteAmount, true),
    quoteAmountFullPrecision: quoteAmount,
    price: formatPrice(price(tradeHistoryEntry, baseToken, quoteToken)),
    priceFullPrecision: price(tradeHistoryEntry, baseToken, quoteToken)
  };
}