import BigNumber from "bignumber.js";
import {
  ETH_UNIT_ETHER,
  USER_TO_LOG_TAKE_OFFER_RELATION_TAKEN_BY_USER,
  USER_TO_LOG_TAKE_OFFER_RELATION_USER_MADE
} from "../../constants";
import web3 from "../../bootstrap/web3";
import { ASK, BID } from "../../store/reducers/trades";
import isNumeric from "../numbers/isNumeric";

export const PRICE_DECIMAL = 5;
export const AMOUNT_DECIMALS = 5;

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

// eslint-disable-next-line no-unused-vars
const formatPrice = (
  price,
  fromWei = false
  // unit = ETH_UNIT_ETHER,
  // decimalPlaces = PRICE_DECIMAL
) => {
  try {
    if ([null, undefined].includes(price)) {
      return null;
    }

    const priceSanitized =
      isNumeric(price) && price.toString().replace(/[,']+/g, "");
    return priceSanitized
      ? new BigNumber(
          !fromWei
            ? priceSanitized
            : web3.fromWei(priceSanitized, ETH_UNIT_ETHER)
        ).toFormat(5, BigNumber.ROUND_HALF_UP)
      : null;
  } catch (e) {
    console.warn(e.toString());
  }
  return null;
};

// const replaceAmountPattern = /^(\d+)\.(\d{3})\d*$/;
//eslint-disable-next-line no-unused-vars

const formatTokenAmount = (price, fromWei = false, unit, decimalPlaces) => {
  if ([null, undefined].includes(price)) {
    return null;
  }
  try {
    const priceSanitized =
      isNumeric(price) && price.toString().replace(/[,']+/g, "");
    return priceSanitized
      ? String(
          new BigNumber(
            !fromWei
              ? priceSanitized
              : web3.fromWei(priceSanitized, unit, decimalPlaces)
          ).toFormat(decimalPlaces, BigNumber.ROUND_DOWN)
        )
      : null;
  } catch (e) {
    console.warn(e.toString());
  }
};

const formatAmount = (
  price,
  fromWei = false,
  //eslint-disable-next-line no-unused-vars
  unknown = null,
  precision = 3
) => {
  if ([null, undefined].includes(price)) {
    return null;
  }
  try {
    const priceSanitized =
      isNumeric(price) && price.toString().replace(/[,']+/g, "");
    return priceSanitized
      ? String(
          new BigNumber(
            !fromWei
              ? priceSanitized
              : web3.fromWei(priceSanitized, ETH_UNIT_ETHER)
          ).toFormat(precision, BigNumber.ROUND_DOWN)
        )
      : null;
  } catch (e) {
    console.warn(e.toString());
  }
};

const formatVolume = tradingPairVolume =>
  web3.fromWei(tradingPairVolume, ETH_UNIT_ETHER).toFormat(2, BigNumber.ROUND_HALF_UP);

const tradeType = (
  order,
  baseCurrency,
  userToTradeBaseRelation,
  userToTradeAdditionalRelation
) => {
  const checkWithOwnership = (
    userToTradeRelationEnum,
    userToTradeAdditionalRelationEnum,
    noRelationType,
    noRelationOtherType
  ) => {
    switch (userToTradeRelationEnum) {
      case USER_TO_LOG_TAKE_OFFER_RELATION_TAKEN_BY_USER: {
        return userToTradeAdditionalRelationEnum ===
          USER_TO_LOG_TAKE_OFFER_RELATION_USER_MADE
          ? noRelationType
          : noRelationOtherType;
      }
      case USER_TO_LOG_TAKE_OFFER_RELATION_USER_MADE: {
        return noRelationType;
      }
    }
  };
  if (order.buyWhichToken === baseCurrency) {
    if (userToTradeBaseRelation) {
      return checkWithOwnership(
        userToTradeBaseRelation,
        userToTradeAdditionalRelation,
        BID,
        ASK
      );
    } else {
      return ASK;
    }
  } else if (order.sellWhichToken === baseCurrency) {
    if (userToTradeBaseRelation) {
      return checkWithOwnership(
        userToTradeBaseRelation,
        userToTradeAdditionalRelation,
        ASK,
        BID
      );
    } else {
      return BID;
    }
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
  formatTokenAmount,
  getBaseAndQuoteAmount
};
