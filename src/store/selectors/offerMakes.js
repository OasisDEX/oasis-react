import { createSelector } from "reselect";
import { formValueSelector } from "redux-form/immutable";
import balances from "./balances";
import transactions from "./transactions";
import markets from "./markets";
import web3 from "../../bootstrap/web3";
import {
  MAKE_BUY_OFFER,
  MAKE_BUY_OFFER_FORM_NAME,
  MAKE_SELL_OFFER,
  MAKE_SELL_OFFER_FORM_NAME
} from "../../constants";
import reselect from "../../utils/reselect";
import offerMakeToFormName from "../../utils/offers/offerMakeToFormName";
import tokens from "./tokens";
import network from "./network";
import { fromJS } from "immutable";
import limits from "./limits";
import isNumeric from "../../utils/numbers/isNumeric";

const offerMakes = state => state.get("offerMakes");

const currentFormValues = createSelector(
  (rootState, formName) =>
    makeFormValuesSelector(formName)(rootState, "volume", "price", "total"),
  formValues => formValues
);

//TODO: move to utils
const toWeiString = amount =>
  web3
    .toBigNumber(web3.toWei(amount))
    .ceil()
    .toString();

const selector = createSelector(
  state => state.a,
  state => state.b,
  (a, b) => ({
    c: a * 2,
    d: b * 3
  })
);

const activeOfferMakePure = createSelector(
  (...args) => args[1], //provides original selector argument
  tokens.activeTradingPair,
  network.tokenAddresses,
  currentFormValues,
  (offerMakeFormName, activeTradingPair, tokenAddresses, { total, volume }) => {
    const { baseToken, quoteToken } = activeTradingPair.toJS
      ? activeTradingPair.toJS()
      : activeTradingPair;
    const offerMakeType = {
      makeBuyOffer: MAKE_BUY_OFFER,
      makeSellOffer: MAKE_SELL_OFFER
    }[offerMakeFormName];

    console.assert(
      offerMakeType,
      `Wrong offerMakeFormName: ${offerMakeFormName}`
    );

    const buyToken = offerMakeType === MAKE_BUY_OFFER ? baseToken : quoteToken;
    const sellToken = offerMakeType === MAKE_BUY_OFFER ? quoteToken : baseToken;

    return fromJS({
      baseToken,
      quoteToken,
      buyToken,
      sellToken,
      sellTokenAddress: tokenAddresses.get(sellToken),
      buyTokenAddress: tokenAddresses.get(buyToken),
      offerData: {
        payAmount: toWeiString(
          offerMakeType === MAKE_BUY_OFFER ? total : volume
        ),
        buyAmount: toWeiString(
          offerMakeType === MAKE_BUY_OFFER ? volume : total
        )
      }
    });
  }
);

// const activeOfferMake = activeOfferMakePure;

const activeOfferMakeType = createSelector(offerMakes, state =>
  state.get("activeOfferMakeType")
);

const activeOfferMakeOfferData = createSelector(activeOfferMakePure, state =>
  state.getIn("offerData")
);

const activeOfferMakeOfferOwner = createSelector(offerMakes, state =>
  state.getIn(["activeOfferMake", "offerData", "owner"])
);

const activeOfferMakeBuyToken = createSelector(activeOfferMakePure, state =>
  state.get("buyToken")
);

const activeOfferMakeSellToken = createSelector(activeOfferMakePure, state =>
  state.get("sellToken")
);

const isOfferMakeModalOpen = createSelector(
  offerMakes,
  reselect.getProps,
  (state, offerMakeType) => {
    return state.getIn([
      offerMakeToFormName(offerMakeType),
      "isOfferMakeModalOpen"
    ]);
  }
);

const makeFormValuesSelector = formName => {
  return formValueSelector(formName);
};

const hasSufficientTokenAmount = createSelector(
  balances.tokenBalances,
  reselect.getProps,
  (rootState, offerMakeType) =>
    makeFormValuesSelector(offerMakeToFormName(offerMakeType))(
      rootState,
      "volume",
      "total"
    ),
  tokens.activeTradingPair,
  (
    tokenBalances,
    activeOfferMakeType,
    { total, volume },
    { baseToken, quoteToken }
  ) => {
    if (!volume) {
      return true;
    } else {
      switch (activeOfferMakeType) {
        case MAKE_BUY_OFFER: {
          const usersSellTokenBalanceBN = web3.toBigNumber(
            tokenBalances.get(quoteToken)
          );
          return usersSellTokenBalanceBN.gte(web3.toWei(total));
        }
        case MAKE_SELL_OFFER: {
          const usersSellTokenBalanceBN = web3.toBigNumber(
            tokenBalances.get(baseToken)
          );
          return usersSellTokenBalanceBN.gte(web3.toWei(volume));
        }
      }
    }
  }
);

const isVolumeOrPriceEmptyOrZero = createSelector(
  (rootState, offerMakeType) =>
    makeFormValuesSelector(offerMakeToFormName(offerMakeType))(
      rootState,
      "volume",
      "price"
    ),
  ({ volume, price } = {}) =>
    !isNumeric(price) ||
    web3.toBigNumber(price).lte(0) ||
    (!isNumeric(volume) || web3.toBigNumber(volume).lte(0))
);

const isOfferBelowLimit = createSelector(
  rootState =>
    limits.tokenMinSellLimitInWei(
      rootState,
      tokens.activeTradingPairQuoteToken(rootState)
    ),
  (rootState, offerMakeType) =>
    makeFormValuesSelector(offerMakeToFormName(offerMakeType))(
      rootState,
      "total"
    ),
  (tokenMinSellLimitInWei, total) => {
    if (
      isNumeric(tokenMinSellLimitInWei) &&
      isNumeric(total) &&
      parseFloat(total) > 0
    ) {
      return web3.toBigNumber(web3.fromWei(tokenMinSellLimitInWei)).gt(total);
    }
  }
);

const canMakeOffer = createSelector(
  hasSufficientTokenAmount,
  rootState => transactions.canSendTransaction(rootState),
  markets.isBuyEnabled,
  (rootState, offerType, noIsTokenEnabledCheck) => {
    return (
      noIsTokenEnabledCheck ||
      balances.tokenAllowanceStatusForActiveMarket(rootState, {
        tokenName: activeOfferMakeSellToken(
          rootState,
          offerMakeToFormName(offerType)
        )
      })
    );
  },
  isVolumeOrPriceEmptyOrZero,
  isOfferBelowLimit,
  (
    hasSufficientTokenAmount,
    canSendTransaction,
    isBuyEnabled,
    isTokenEnabled,
    isVolumeOrPriceEmptyOrZero,
    isBelowLimit
  ) => {
    if (
      isVolumeOrPriceEmptyOrZero ||
      !hasSufficientTokenAmount ||
      !canSendTransaction ||
      !isBuyEnabled ||
      !isTokenEnabled ||
      isBelowLimit
    ) {
      return false;
    } else {
      return hasSufficientTokenAmount;
    }
  }
);

const isOfferActive = createSelector(offerMakes, state =>
  state.get("isOfferActive")
);

const transactionGasCostEstimate = createSelector(offerMakes, state =>
  state.get("transactionGasCostEstimate")
);

const checkingIfOfferIsActive = createSelector(offerMakes, state =>
  state.get("checkingIfOfferActive")
);

const gasEstimatePending = createSelector(offerMakes, state =>
  state.get("transactionGasCostEstimatePending")
);

const getActiveOfferMakeAllowanceStatus = createSelector(
  (rootState, offerType) => {
    return balances.tokenAllowanceStatusForActiveMarket(rootState, {
      tokenName: activeOfferMakeSellToken(
        rootState,
        offerMakeToFormName(offerType)
      )
    });
  },
  status => Boolean(status)
);

const isMakeBuyOfferPriceSet = createSelector(
  rootState => currentFormValues(rootState, MAKE_BUY_OFFER_FORM_NAME),
  ({ price }) => Boolean(price)
);
const isMakeSellOfferPriceSet = createSelector(
  rootState => currentFormValues(rootState, MAKE_SELL_OFFER_FORM_NAME),
  ({ price }) => Boolean(price)
);

export default {
  state: offerMakes,
  selector,
  activeOfferMakePure,
  activeOfferMakeType,
  activeOfferMakeOfferData,
  isOfferMakeModalOpen,
  activeOfferMakeBuyToken,
  activeOfferMakeSellToken,
  activeOfferMakeOfferOwner,
  canMakeOffer,
  hasSufficientTokenAmount,
  transactionGasCostEstimate,
  isVolumeOrPriceEmptyOrZero,
  isOfferActive,
  checkingIfOfferIsActive,
  currentFormValues,
  gasEstimatePending,
  getActiveOfferMakeAllowanceStatus,
  isMakeBuyOfferPriceSet,
  isMakeSellOfferPriceSet,
  isOfferBelowLimit
};
