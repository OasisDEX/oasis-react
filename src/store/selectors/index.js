import { createSelector } from "reselect";
import reselect from "../../utils/reselect";
import { TX_OFFER_MAKE, TX_OFFER_TAKE } from "../reducers/transactions";
import { fromJS } from "immutable";
import offerTakes from "./offerTakes";
import offerMakes from "./offerMakes";
import { TAKE_BUY_OFFER, TAKE_SELL_OFFER } from "../reducers/offerTakes";
import {
  MAKE_BUY_OFFER,
  MAKE_BUY_OFFER_FORM_NAME,
  MAKE_SELL_OFFER,
  MAKE_SELL_OFFER_FORM_NAME, SYNC_STATUS_COMPLETED,
} from '../../constants';
import { offerMakeToFormName } from "../../utils/offers/offerMakeToFormName";
import trades from './trades';
import platform from './platform';
import offers from './offers';
import tokens from './tokens';

const isGasEstimatePending = createSelector(
  s => s,
  reselect.getProps,
  (rootState, transactionSubjectType) => {
    switch (transactionSubjectType) {
      case TX_OFFER_TAKE:
        return rootState.getIn([
          "offerTakes",
          "transactionGasCostEstimatePending"
        ]);
      case TX_OFFER_MAKE:
        return rootState.getIn([
          "offerMakes",
          "transactionGasCostEstimatePending"
        ]);
    }
  }
);

const gasEstimateError = createSelector(
  s => s,
  reselect.getProps,
  (rootState, transactionSubjectType) => {
    switch (transactionSubjectType) {
      case TX_OFFER_TAKE:
        return rootState.getIn([
          "offerTakes",
          "transactionGasCostEstimateError"
        ]);
      case TX_OFFER_MAKE:
        return rootState.getIn([
          "offerMakes",
          "transactionGasCostEstimateError"
        ]);
    }
  }
);

const transactionGasCostEstimate = createSelector(
  s => s,
  reselect.getProps,
  (rootState, transactionSubjectType) => {
    switch (transactionSubjectType) {
      case TX_OFFER_TAKE:
        return rootState.getIn(["offerTakes", "transactionGasCostEstimate"]);
      case TX_OFFER_MAKE:
        return rootState.getIn(["offerMakes", "transactionGasCostEstimate"]);
    }
  }
);

const gasEstimateInfo = createSelector(
  s => s,
  reselect.getProps,
  (rootState, offerType) => {
    switch (offerType) {
      case TAKE_BUY_OFFER:
      case TAKE_SELL_OFFER:
        return fromJS({
          isGasEstimatePending: rootState.getIn([
            "offerTakes",
            "transactionGasCostEstimatePending"
          ]),
          transactionGasCostEstimate: rootState.getIn([
            "offerTakes",
            "transactionGasCostEstimate"
          ]),
          transactionGasCostEstimateError: rootState.getIn([
            "offerTakes",
            "transactionGasCostEstimateError"
          ])
        });
      case MAKE_BUY_OFFER:
      case MAKE_SELL_OFFER:
        return fromJS({
          isGasEstimatePending: rootState.getIn([
            "offerMakes",
            "transactionGasCostEstimatePending"
          ]),
          transactionGasCostEstimate: rootState.getIn([
            "offerMakes",
            "transactionGasCostEstimate"
          ]),
          transactionGasCostEstimateError: rootState.getIn([
            "offerMakes",
            "transactionGasCostEstimateError"
          ])
        });
    }
  }
);

const getOfferFormValuesByOfferType = createSelector((state, offerType) => {
  let formValues = null,
    fields = ["price", "volume", "total"];
  switch (offerType) {
    case TAKE_BUY_OFFER:
    case TAKE_SELL_OFFER:
      formValues = offerTakes.takeFormValuesSelector(state, ...fields);
      break;
    case MAKE_BUY_OFFER:
      formValues = offerMakes.currentFormValues(state)(MAKE_BUY_OFFER_FORM_NAME);
      break;
    case MAKE_SELL_OFFER:
      formValues = offerMakes.currentFormValues(state)(MAKE_SELL_OFFER_FORM_NAME);
      break;
  }
  return fromJS(formValues);
}, offerFormValues => offerFormValues);

const getOfferBuyAndSellTokenByOfferType = createSelector(
  (state, offerType) => {
    let buyToken = null,
      sellToken = null;
    switch (offerType) {
      case TAKE_BUY_OFFER:
      case TAKE_SELL_OFFER:
        [buyToken, sellToken] = [
          offerTakes.activeOfferTakeBuyToken(state),
          offerTakes.activeOfferTakeSellToken(state)
        ];
        break;
      case MAKE_BUY_OFFER:
      case MAKE_SELL_OFFER:
        {
          const formName = offerMakeToFormName(offerType);
          [buyToken, sellToken] = [
            offerMakes.activeOfferMakeBuyToken(state, formName),
            offerMakes.activeOfferMakeSellToken(state, formName)
          ];
        }
        break;
    }
    return fromJS({ buyToken, sellToken });
  },
  offerFormValues => offerFormValues
);

// eslint-disable-next-line no-unused-vars
const getOfferGasEstimateByOfferType = createSelector((state, offerType) => {
  switch (offerType) {
    case TAKE_BUY_OFFER:
    case TAKE_SELL_OFFER:
      return offerTakes.transactionGasCostEstimate(state);
    case MAKE_BUY_OFFER:
    case MAKE_SELL_OFFER:
      return offerMakes.transactionGasCostEstimate(state);
  }
}, offerFormValues => offerFormValues);

const hasSufficientTokenAmountByOfferType = createSelector(
  (state, offerType) => {
    switch (offerType) {
      case TAKE_BUY_OFFER:
      case TAKE_SELL_OFFER:
        return offerTakes.hasSufficientTokenAmount(state, offerType);
      case MAKE_BUY_OFFER:
      case MAKE_SELL_OFFER:
        return offerMakes.hasSufficientTokenAmount(state)(offerType);
    }
  },
  offerFormValues => offerFormValues
);

const getActiveOfferAllowanceStatus = createSelector(
  (rootState, offerType) => {
    switch (offerType) {
      case TAKE_SELL_OFFER:
      case TAKE_BUY_OFFER:
        return offerTakes.getActiveOfferTakeAllowanceStatus(
          rootState,
          offerType
        );
      case MAKE_SELL_OFFER:
      case MAKE_BUY_OFFER:
        return offerMakes.getActiveOfferMakeAllowanceStatus(
          rootState,
          offerType
        );
    }
  },
  allowanceStatus => Boolean(allowanceStatus)
);

const isPriceSet = createSelector((rootState, offerType) => {
  switch (offerType) {
    case MAKE_SELL_OFFER:
      return offerMakes.isMakeSellOfferPriceSet(rootState);
    case MAKE_BUY_OFFER:
      return offerMakes.isMakeBuyOfferPriceSet(rootState);
  }
}, isPriceSet => isPriceSet);

const appLoadProgress = createSelector(
  trades.initialMarketHistoryLoaded,
  platform.contractsLoaded,
  rootState => tokens.activeTradingPair(rootState) ?
    offers.tradingPairOffersInitialLoadStatus(
      rootState,
      tokens.activeTradingPair(rootState)
  ) : null,
  (marketHistoryLoaded, contractsLoaded, offersLoaded) => {
    const statuses = [
      marketHistoryLoaded,
      contractsLoaded,
      offersLoaded
    ];
    return (
      statuses.filter(status => [SYNC_STATUS_COMPLETED, true].includes(status) ).length / statuses.length
    ) * 100;

  }
);

export {
  isGasEstimatePending,
  gasEstimateError,
  transactionGasCostEstimate,
  gasEstimateInfo,
  getOfferFormValuesByOfferType,
  getOfferBuyAndSellTokenByOfferType,
  hasSufficientTokenAmountByOfferType,
  getActiveOfferAllowanceStatus,
  isPriceSet,
  appLoadProgress
};
