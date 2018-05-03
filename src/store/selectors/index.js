import { createSelector } from "reselect";
import reselect from "../../utils/reselect";
import { TX_OFFER_MAKE, TX_OFFER_TAKE } from "../reducers/transactions";
import { fromJS } from "immutable";
import offerTakes from "./offerTakes";
import offerMakes from "./offerMakes";
import { TAKE_BUY_OFFER, TAKE_SELL_OFFER } from '../reducers/offerTakes';
import { MAKE_BUY_OFFER, MAKE_SELL_OFFER } from '../../constants';

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
  (rootState, transactionSubjectType) => {
    switch (transactionSubjectType) {
      case TX_OFFER_TAKE:
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
      case TX_OFFER_MAKE:
        return rootState.getIn(["offerMakes", "transactionGasCostEstimate"]);
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
    case MAKE_SELL_OFFER:
      formValues = offerMakes.activeOfferMakePure(state, ...fields);
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
        [buyToken, sellToken] = [
          offerMakes.activeOfferMakeBuyToken(state),
          offerMakes.activeOfferMakeSellToken(state)
        ];
        break;
    }
    return fromJS({ buyToken, sellToken });
  },
  offerFormValues => offerFormValues
);

const getOfferGasEstimateByOfferType = createSelector(
  (state, offerType) => {
    switch (offerType) {
      case TAKE_BUY_OFFER:
      case TAKE_SELL_OFFER:
        return offerMakes.transactionGasCostEstimate(state);
      case MAKE_BUY_OFFER:
      case MAKE_SELL_OFFER:
        return offerTakes.transactionGasCostEstimate(state);
    }
  },
  offerFormValues => offerFormValues
);


const hasSufficientTokenAmountByOfferType = createSelector(
  (state, offerType) => {
    switch (offerType) {
      case TAKE_BUY_OFFER:
      case TAKE_SELL_OFFER:
        return offerTakes.hasSufficientTokenAmount(state, offerType);
      case MAKE_BUY_OFFER:
      case MAKE_SELL_OFFER:
        return offerMakes.hasSufficientTokenAmount(state, offerType);
    }
  },
  offerFormValues => offerFormValues
);

export {
  isGasEstimatePending,
  gasEstimateError,
  transactionGasCostEstimate,
  gasEstimateInfo,
  getOfferFormValuesByOfferType,
  getOfferBuyAndSellTokenByOfferType,
  getOfferGasEstimateByOfferType,
  hasSufficientTokenAmountByOfferType
};
