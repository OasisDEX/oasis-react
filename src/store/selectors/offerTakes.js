import { createSelector } from "reselect";
import { formValueSelector } from "redux-form/immutable";
import balances from "./balances";
import transactions from "./transactions";
import markets from "./markets";
import web3 from "../../bootstrap/web3";
import { TAKE_BUY_OFFER, TAKE_SELL_OFFER } from "../reducers/offerTakes";
import { ETH_UNIT_ETHER } from "../../constants";
import { fromJS } from "immutable";
import getOfferTakeBuyAndSellTokens from "../../utils/tokens/getOfferTakeBuyAndSellTokens";
import tokens from "./tokens";
import tokenToBeAllowedForOffer from "../../utils/offers/tokenToBeAllowedForOffer";
import offers from "./offers";

const offerTakes = s => s.get("offerTakes");

const activeOfferTakeType = createSelector(offerTakes, s =>
  s.get("activeOfferTakeType")
);

const isOfferTakeModalOpen = createSelector(offerTakes, s =>
  s.get("isOfferTakeModalOpen")
);
const activeOfferTakeOfferId = createSelector(offerTakes, s =>
  s.get("activeOfferTakeOfferId")
);

const activeOfferTake = createSelector(
  s => s,
  activeOfferTakeType,
  activeOfferTakeOfferId,
  tokens.activeTradingPair,
  (rootState, offerTakeType, offerId, activeTradingPair) => {
    const { baseToken, quoteToken } = activeTradingPair;
    let offer = null;
    switch (offerTakeType) {
      case TAKE_BUY_OFFER:
        {
          offer = offers
            .activeTradingPairBuyOffers(rootState)
            .find(offer => fromJS(offer).get("id") === offerId);
        }
        break;
      case TAKE_SELL_OFFER:
        {
          offer = offers
            .activeTradingPairSellOffers(rootState)
            .find(offer => fromJS(offer).get("id") === offerId);
        }
        break;
    }

    if (offer) {
      const { sellToken, buyToken } = getOfferTakeBuyAndSellTokens(
        tokens.activeTradingPair(rootState),
        offerTakeType
      );
      return fromJS({
        offerData: fromJS(offer),
        sellToken: sellToken,
        buyToken: buyToken,
        baseToken: baseToken,
        quoteToken: quoteToken
      });
    } else {
      return fromJS({});
    }
  }
);

const activeOfferTakeOfferData = createSelector(activeOfferTake, s =>
  s.get("offerData")
);

const activeOfferTakeOfferOwner = createSelector(activeOfferTake, s =>
  s.getIn(["offerData", "owner"])
);

const activeOfferTakeBuyToken = createSelector(activeOfferTake, s =>
  s.get("buyToken")
);

const activeOfferTakeSellToken = createSelector(activeOfferTake, s =>
  s.get("sellToken")
);

const takeFormValuesSelector = formValueSelector("takeOffer");

const isOfferBelowLimit = createSelector(offerTakes, s =>
  s.get("isOfferBelowLimit")
);

const hasSufficientTokenAmount = createSelector(
  balances.tokenBalances,
  activeOfferTakeSellToken,
  activeOfferTakeType,
  rootState => takeFormValuesSelector(rootState, "volume", "total", "price"),
  (tokenBalances, sellToken, activeOfferTakeType, { total, volume }) => {
    if (!total) {
      return true;
    } else {
      const totalInWei = web3.toWei(total, ETH_UNIT_ETHER);
      const volumeInWei = web3.toWei(volume, ETH_UNIT_ETHER);
      const usersSellTokenBalanceBN = web3.toBigNumber(
        tokenBalances.get(sellToken)
      );
      switch (activeOfferTakeType) {
        case TAKE_BUY_OFFER:
          return usersSellTokenBalanceBN.gte(volumeInWei);
        case TAKE_SELL_OFFER:
          return usersSellTokenBalanceBN.gte(totalInWei);
      }
    }
  }
);

const currentFormVolume = createSelector(
  rootState => takeFormValuesSelector(rootState, "volume"),
  volume => volume
);

const isVolumeEmptyOrZero = createSelector(
  rootState => takeFormValuesSelector(rootState, "volume"),
  activeFormVolume => {
    return !activeFormVolume || web3.toBigNumber(activeFormVolume).eq(0);
  }
);

const isVolumeGreaterThanOfferMax = createSelector(
  currentFormVolume,
  activeOfferTakeOfferData,
  activeOfferTakeType,
  (volume, offerData, offerTakeType) => {
    if (!offerData) {
      return false;
    }
    const buyHowMuch = web3.fromWei(offerData.get("buyHowMuch"));
    const sellHowMuch = web3.fromWei(offerData.get("sellHowMuch"));
    const volumeBN = web3.toBigNumber(volume);
    switch (offerTakeType) {
      case TAKE_BUY_OFFER:
        return volumeBN.gt(buyHowMuch) ? buyHowMuch : false;
      case TAKE_SELL_OFFER:
        return volumeBN.gt(sellHowMuch) ? sellHowMuch : false;
    }
  }
);

const hasExceededGasLimit = createSelector(
  offerTakes,
  s => Boolean(s.get('exceededGasLimit'))
);

const tokenToBeAllowed = createSelector(
  activeOfferTakeType,
  activeOfferTakeSellToken,
  activeOfferTakeBuyToken,
  (offerType, sellToken, buyToken) => {
    return tokenToBeAllowedForOffer({ offerType, sellToken, buyToken });
  }
);

const isOfferActive = createSelector(offerTakes, s => s.get("isOfferActive"));

const canFulfillOffer = createSelector(
  hasSufficientTokenAmount,
  rootState => transactions.canSendTransaction(rootState),
  markets.isBuyEnabled,
  rootState => {
    return balances.tokenAllowanceStatusForActiveMarket(rootState, {
      tokenName: tokenToBeAllowed(rootState)
    });
  },
  isVolumeEmptyOrZero,
  isVolumeGreaterThanOfferMax,
  isOfferActive,
  (
    hasSufficientTokenAmount,
    canSendTransaction,
    isBuyEnabled,
    istTokenEnabled,
    isVolumeZero,
    isVolumeGreaterThanOfferMax
  ) => {
    if (
      !isOfferActive ||
      isVolumeZero ||
      isVolumeGreaterThanOfferMax ||
      // !canSendTransaction ||
      !isBuyEnabled ||
      [false, null].includes(istTokenEnabled)
    ) {
      return false;
    } else {
      return hasSufficientTokenAmount;
    }
  }
);


const transactionGasCostEstimate = createSelector(offerTakes, s =>
  s.get("transactionGasCostEstimate")
);

const checkingIfOfferIsActive = createSelector(offerTakes, s =>
  s.get("checkingIfOfferActive")
);

const gasEstimatePending = createSelector(offerTakes, s =>
  s.get("transactionGasCostEstimatePending")
);

const getActiveOfferTakeAllowanceStatus = createSelector(
  rootState => {
    return balances.tokenAllowanceStatusForActiveMarket(rootState, {
      tokenName: tokenToBeAllowed(rootState)
    });
  },
  status => Boolean(status)
);

const isActiveOfferTakeBestOffer = createSelector(
  activeOfferTakeType,
  activeOfferTakeOfferId,
  offers.activeTradingPairBestBuyOfferId,
  offers.activeTradingPairBestSellOfferId,
  (takeType, offerId, bestBuyOfferId, bestSellOfferId) => {
    switch (takeType) {
      case TAKE_BUY_OFFER:
        return offerId.toString() === bestBuyOfferId;
      case TAKE_SELL_OFFER:
        return offerId.toString() === bestSellOfferId;
    }
  }
);

const getBuyAmount = getState => {
  const offerType = activeOfferTakeType(getState());

  if (offerType === TAKE_BUY_OFFER) {
    return takeFormValuesSelector(getState(), "total");
  } else {
    return takeFormValuesSelector(getState(), "volume");
  }
};

export default {
  state: offerTakes,
  activeOfferTake,
  activeOfferTakeType,
  activeOfferTakeOfferData,
  isOfferTakeModalOpen,
  activeOfferTakeOfferId,
  activeOfferTakeBuyToken,
  activeOfferTakeSellToken,
  activeOfferTakeOfferOwner,
  canFulfillOffer,
  isOfferBelowLimit,
  takeFormValuesSelector,
  hasSufficientTokenAmount,
  transactionGasCostEstimate,
  isVolumeGreaterThanOfferMax,
  isVolumeEmptyOrZero,
  isOfferActive,
  checkingIfOfferIsActive,
  gasEstimatePending,
  getActiveOfferTakeAllowanceStatus,
  isActiveOfferTakeBestOffer,
  tokenToBeAllowed,
  getBuyAmount,
  hasExceededGasLimit
};
