import { createSelector, createStructuredSelector } from "reselect";
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
import {
  offerMakeToFormName,
  formNameToOfferMake
} from '../../utils/offers/offerMakeToFormName'
import tokens from "./tokens";
import network from "./network";
import { fromJS, Map } from "immutable";
import limits from "./limits";
import isNumeric from "../../utils/numbers/isNumeric";
import {memoize} from 'lodash';
import { offerMakeTypeToOfferListName } from '../../utils/offers/offerMakeTypeToOfferListName'
import { getOfferPrice } from '../../utils/offers/getOfferPrice'

const offerMakes = state => state.get("offerMakes");

const formFields = createStructuredSelector({
  [MAKE_BUY_OFFER_FORM_NAME]: reselect.formFieldsSelector(MAKE_BUY_OFFER_FORM_NAME, 'volume', 'price', 'total'),
  [MAKE_SELL_OFFER_FORM_NAME]: reselect.formFieldsSelector(MAKE_SELL_OFFER_FORM_NAME, 'volume', 'price', 'total'),
})

const currentFormValues = createSelector(
  formFields,
  formValues => memoize(formName => formValues[formName])
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

const hasExceededGasLimit = createSelector(
  offerMakes,
  s => Boolean(s.get('exceededGasLimit'))
);


const activeTradingPairOffersData = createSelector(
  rootState => rootState.get("offers"),
  tokens.activeTradingPair,
  (state, activeTradingPair) => state.getIn(["offers", Map(activeTradingPair)])
);

const getNewOfferRankIndex = createSelector(
  (...args) => args[1],
  currentFormValues,
  activeTradingPairOffersData,
  (
    offerFormName,
    currentFormValues,
    currentTradingPairOffersData = fromJS({ buyOffers: [], sellOffers: [] })
  ) => {
    const { price } = currentFormValues(offerFormName);
    if (!parseFloat(String(price))) {
      return;
    }

    const priceBN = web3.toBigNumber(price);
    const formMakeType = formNameToOfferMake(offerFormName);
    const offersSortedByPriceAsc = currentTradingPairOffersData
    .get(offerMakeTypeToOfferListName(formMakeType))
    .map(offer => ({
      price: getOfferPrice(offer, formMakeType),
      offerId: offer.id
    }))
    .sort(
      ({ price: priceA }, { price: priceB }) => (priceA.gte(priceB) ? 1 : -1)
    )
    .map((d, idx) => ({ ...d, idx }));

    for (const { price, offerId, idx } of offersSortedByPriceAsc) {
      switch (priceBN.comparedTo(price)) {
        case -1:
          // console.log('offerId', offerId.toString());
          return offerId;
        case 0: {
          if (idx > 0) {
            const { offerId } = offersSortedByPriceAsc.get(idx - 1);
            // console.log('offerId', offerId.toString());
            return offerId;
          } else {
            const { offerId } = offersSortedByPriceAsc.first();
            // console.log('offerId', offerId.toString());
            return offerId;
          }
        }
      }
    }

    if (offersSortedByPriceAsc.count()) {
      // console.log('last', offersSortedByPriceAsc.last().offerId.toString());
      return offersSortedByPriceAsc.last().offerId;
    } else {
      // console.log('last', 0);
      return 0;
    }
  }
);

const activeOfferMakePure = createSelector(
  (...args) => args[1], //provides original selector argument
  tokens.activeTradingPair,
  network.tokenAddresses,
  currentFormValues,
  (rootState, offerMakeFormName) =>
    getNewOfferRankIndex(rootState, offerMakeFormName),
  (
    offerMakeFormName,
    activeTradingPair,
    tokenAddresses,
    currentFormValues,
    newOfferRankIndex
  ) => {
    const { total, volume } = currentFormValues(offerMakeFormName);
    const { baseToken, quoteToken } = activeTradingPair.toJS
      ? activeTradingPair.toJS()
      : activeTradingPair;
    const offerMakeType = formNameToOfferMake(offerMakeFormName);
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
      newOfferRankIndex,
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
  (state) => memoize(offerMakeType =>
    state.getIn([
      offerMakeToFormName(offerMakeType),
      "isOfferMakeModalOpen"
    ])
  )
);

const makeFormValuesSelector = formName => {
  return formValueSelector(formName);
};

const hasSufficientTokenAmount = createSelector(
  balances.tokenBalances,
  currentFormValues,
  tokens.activeTradingPair,
  (
    tokenBalances,
    currentFormValues,
    { baseToken, quoteToken }
  ) => memoize(activeOfferMakeType => {
    const { total, volume } = currentFormValues(offerMakeToFormName(activeOfferMakeType));
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
  })
);

const isVolumeOrPriceEmptyOrZero = createSelector(
  currentFormValues,
  (currentFormValues) => memoize(offerMakeType => {
    const { volume, price } = currentFormValues(offerMakeToFormName(offerMakeType));
    return !isNumeric(price) ||
      web3.toBigNumber(price).lte(0) ||
      (!isNumeric(volume) || web3.toBigNumber(volume).lte(0))
  })
);


const tokenMinSellLimitInWeiByOfferType = createSelector(
  tokens.activeTradingPair,
  limits.tokenMinSellLimitInWei,
  (activeTradingPair, tokenMinSellLimitInWei) => memoize(offerMakeType => {
    let tokenName = null;
    const activeTradingPairMap = Map(activeTradingPair);
    if (!activeTradingPairMap.has('baseToken') && activeTradingPairMap.has('quoteToken')) {
      return null
    }
    switch (offerMakeType) {
      case MAKE_BUY_OFFER:
        tokenName = activeTradingPairMap.get("quoteToken");
        break;
      case MAKE_SELL_OFFER:
        tokenName = activeTradingPairMap.get("baseToken");
        break;
      default:
        throw new Error("No offer make type provided!");
    }
    return tokenMinSellLimitInWei(tokenName);
  }));

const isOfferBelowLimit = createSelector(
  tokenMinSellLimitInWeiByOfferType,
  currentFormValues,
  (tokenMinSellLimitInWeiByOfferType, currentFormValues) => memoize(offerMakeType => {
    const { total, volume } = currentFormValues(offerMakeToFormName(offerMakeType));
    const tokenMinSellLimitInWei = tokenMinSellLimitInWeiByOfferType(offerMakeType);
    if (tokenMinSellLimitInWei === null) {
      return null;
    }
    let amount = null;
    switch (offerMakeType) {
      case MAKE_BUY_OFFER:
        amount = total;
        break;
      case MAKE_SELL_OFFER:
        amount = volume;
        break;
      default:
        throw new Error("No offer make type provided!");
    }

    if (
      isNumeric(tokenMinSellLimitInWei) &&
      isNumeric(amount) &&
      parseFloat(amount) > 0
    ) {
      return web3.toBigNumber(web3.fromWei(tokenMinSellLimitInWei)).gt(amount);
    }
  })
);

const isTotalOverTheTokenLimit = createSelector(
  limits.activeTradingPairQuoteTokenMaxLimitInWei,
  (rootState, offerMakeType) =>
    makeFormValuesSelector(offerMakeToFormName(offerMakeType))(
      rootState, "total",
    ),
  (tokenMaxSellLimitInWei, total) => {
    if (tokenMaxSellLimitInWei === null) {
      return null;
    } else if (
      isNumeric(tokenMaxSellLimitInWei) && isNumeric(total) && parseFloat(total) > 0
    ) {
      return web3.toBigNumber(web3.fromWei(tokenMaxSellLimitInWei)).lte(total);
    }
  }
);

const checkTokenEnabled = createSelector(
  s => s,
  (...args) => args[1],
  (...args) => args[2],
  (rootState, offerType, skipTokenEnabledCheck) => {
    return (
      skipTokenEnabledCheck ||
      balances.tokenAllowanceStatusForActiveMarket(rootState, {
        tokenName: activeOfferMakeSellToken(
          rootState,
          offerMakeToFormName(offerType)
        )
      })
    );
  },
);

const canMakeOffer = createSelector(
  hasSufficientTokenAmount,
  rootState => transactions.canSendTransaction(rootState),
  markets.isBuyEnabled,
  checkTokenEnabled,
  isVolumeOrPriceEmptyOrZero,
  isOfferBelowLimit,
  isTotalOverTheTokenLimit,
  (s, offerMakeType) => offerMakeType,
  (
    hasSufficientTokenAmount,
    canSendTransaction,
    isBuyEnabled,
    isTokenEnabled,
    isVolumeOrPriceEmptyOrZero,
    isBelowLimit,
    isOverTheLimit,
    offerMakeType,
  ) => {
    if (
      isVolumeOrPriceEmptyOrZero(offerMakeType) ||
      !hasSufficientTokenAmount(offerMakeType) ||
      // !canSendTransaction ||
      !isBuyEnabled ||
      !isTokenEnabled ||
      isBelowLimit(offerMakeType) ||
      isOverTheLimit
    ) {
      return false;
    } else {
      return hasSufficientTokenAmount(offerMakeType);
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
  rootState => currentFormValues(rootState)(MAKE_BUY_OFFER_FORM_NAME),
  ({ price }) => Boolean(price)
);
const isMakeSellOfferPriceSet = createSelector(
  rootState => currentFormValues(rootState)(MAKE_SELL_OFFER_FORM_NAME),
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
  isOfferBelowLimit,
  hasExceededGasLimit,
  isTotalOverTheTokenLimit
};
