import BigNumber from "bignumber.js";
import { ETH_UNIT_ETHER } from "../../constants";
import web3 from "../../bootstrap/web3";
import { ASK, BID } from "../../store/reducers/trades";

export const PRICE_DECIMAL = 5;
// export const VOLUME_DECIMAL = 5;
// export const AMOUNT_DECIMAL = 5;

const format = (baseToken, quoteToken) => `${baseToken}/${quoteToken}`;
const trades = (marketData, baseToken, quoteToken) =>
  marketData.filter(marketHistoryEntry => {
    const { sellWhichToken, buyWhichToken } = marketHistoryEntry;
    const tradingPairTokensList = [baseToken, quoteToken];
    if (
      tradingPairTokensList.some(t => t === sellWhichToken) &&
      tradingPairTokensList.some(t => t === buyWhichToken)
    ) {
      return marketHistoryEntry;
    }
  });

const volume = (tradingPairTrades, baseToken, quoteToken) => {
  /**
   *
   * Reduce token pair history entries to single volume number.
   *
   * Perquisites:
   * - one of the market history entry tokens is always base token
   * - unit is wei
   */
  const tradingPairTradesToVolume = (volume, currentTradingPairTrade) => {
    if (currentTradingPairTrade.buyWhichToken === quoteToken) {
      return volume.add(currentTradingPairTrade.buyHowMuch);
    } else if (currentTradingPairTrade.sellWhichToken === quoteToken) {
      return volume.add(currentTradingPairTrade.sellHowMuch);
    }
  };
  return tradingPairTrades.reduce(tradingPairTradesToVolume, new BigNumber(0));
};

const price = (tradeHistoryEntry, baseToken, quoteToken) => {
  if (!tradeHistoryEntry) {
    console.log("tradeHistoryEntry", tradeHistoryEntry, baseToken, quoteToken);
    return null;
  }
  let price = 0;
  if (
    tradeHistoryEntry.buyWhichToken === quoteToken &&
    tradeHistoryEntry.sellWhichToken === baseToken
  ) {
    price = new BigNumber(tradeHistoryEntry.buyHowMuch).div(
      new BigNumber(tradeHistoryEntry.sellHowMuch)
    );
  } else if (
    tradeHistoryEntry.buyWhichToken === baseToken &&
    tradeHistoryEntry.sellWhichToken === quoteToken
  ) {
    price = new BigNumber(tradeHistoryEntry.sellHowMuch).div(
      new BigNumber(tradeHistoryEntry.buyHowMuch)
    );
  }
  return price;
};

const getBaseAndQuoteAmount = (tradeHistoryEntry, baseToken, quoteToken) => {
  if (
    tradeHistoryEntry.buyWhichToken === quoteToken &&
    tradeHistoryEntry.sellWhichToken === baseToken
  ) {
    return {
      baseAmount: new BigNumber(tradeHistoryEntry.sellHowMuch),
      quoteAmount: new BigNumber(tradeHistoryEntry.buyHowMuch)
    };
  } else if (
    tradeHistoryEntry.buyWhichToken === baseToken &&
    tradeHistoryEntry.sellWhichToken === quoteToken
  ) {
    return {
      baseAmount: new BigNumber(tradeHistoryEntry.buyHowMuch),
      quoteAmount: new BigNumber(tradeHistoryEntry.sellHowMuch)
    };
  }
};

const replacePattern = /^(\d+)\.(\d{5})\d*$/;
// eslint-disable-next-line no-unused-vars
const formatPrice = (
  price,
  fromWei = false,
  // unit = ETH_UNIT_ETHER,
  // decimalPlaces = PRICE_DECIMAL
) => {
  if (!fromWei) {
    return price
      ? new BigNumber(price)
          .toFixed(12)
          .toString()
          .replace(replacePattern, "$1.$2")
      : null;
  } else {
    return price
      ? new BigNumber(web3.fromWei(price, ETH_UNIT_ETHER))
          .toFixed(12)
          .toString()
          .replace(replacePattern, "$1.$2")
      : null;
  }
};

// eslint-disable-next-line no-unused-vars
const formatAmount = (
  price,
  fromWei = false,
  // unit = ETH_UNIT_ETHER,
  // decimalPlaces
) => {
  if (!fromWei) {
    return price
      ? String(
          new BigNumber(price)
            .toFixed(12)
            .replace(replacePattern, "$1.$2")
        )
      : null;
  } else {
    return price
      ? String(
          new BigNumber(web3.fromWei(price, ETH_UNIT_ETHER)).toFixed(12)
        ).replace(replacePattern, "$1.$2")
      : null;
  }
};

const formatVolume = tradingPairVolume =>
  web3
    .fromWei(tradingPairVolume, ETH_UNIT_ETHER)
    .toFormat(4)
    .toString()
    .replace(replacePattern, "$1.$2");

const tradeType = (order, baseCurrency) => {
  if (order.buyWhichToken === baseCurrency) {
    return ASK;
  } else if (order.sellWhichToken === baseCurrency) {
    return BID;
  }
};

const formatTradeType = type => {
  if (!type) {
    return null;
  } else {
    switch (type) {
      case BID:
        return "buy";
      case ASK:
        return "sell";
    }
  }
};

export {
  format,
  trades,
  volume,
  price,
  formatPrice,
  formatVolume,
  tradeType,
  formatTradeType,
  formatAmount,
  getBaseAndQuoteAmount
};
