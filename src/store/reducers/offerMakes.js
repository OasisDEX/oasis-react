import { createAction, handleActions } from "redux-actions";
import { fromJS } from "immutable";
import throttle from "lodash/throttle";
import { defer } from "../deferredThunk";

import { createPromiseActions } from "../../utils/createPromiseActions";
import offerMakes from "../selectors/offerMakes";
import { change, formValueSelector, initialize } from "redux-form/immutable";
import { TX_OFFER_MAKE } from "./transactions";
import web3 from "../../bootstrap/web3";
import balances from "../selectors/balances";
import { fulfilled, pending, rejected } from "../../utils/store";
import { offerMakeToFormName } from "../../utils/offers/offerMakeToFormName";
import {
  MAKE_BUY_OFFER,
  MAKE_SELL_OFFER,
  DEFAULT_GAS_PRICE
} from "./../../constants";
import { handleTransaction } from "../../utils/transactions/handleTransaction";
import {
  getMarketContractInstance,
  getMarketNoProxyContractInstance
} from "../../bootstrap/contracts";
// import transactions from "../selectors/transactions";
import isNumericAndGreaterThanZero from "../../utils/numbers/isNumericAndGreaterThanZero";
import getTokenByAddress from "../../utils/tokens/getTokenByAddress";
import {
  convertToTokenPrecision
} from "../../utils/conversion";
// import {transactionGasCostEstimate} from "../selectors";

const initialState = fromJS({
  makeBuyOffer: {
    type: MAKE_BUY_OFFER,
    isOfferMakeModalOpen: false,
    transactionGasCostEstimate: null
  },
  makeSellOffer: {
    type: MAKE_SELL_OFFER,
    isOfferMakeModalOpen: false,
    transactionGasCostEstimate: null
  },
  activeOfferMakeType: null
});

const buyMaxEpic = (
  offerMakeType,
  { activeQuoteTokenBalance = balances.activeQuoteTokenBalance } = {}
) => (dispatch, getState) => {
  const balance = activeQuoteTokenBalance(getState());
  const total = web3.fromWei(balance);
  const totalSerialized = web3
    .toBigNumber(total)
    .toFixed()
    .toString();
  dispatch(localChange(offerMakeType, "total", totalSerialized));
  dispatch(defer(totalFieldValueChangedEpic, offerMakeType, totalSerialized));
};

const sellMaxEpic = (
  offerMakeType,
  {
    activeBaseTokenBalance = balances.activeBaseTokenBalance,
    currentFormValues = offerMakes.currentFormValues
  } = {}
) => (dispatch, getState) => {
  const balance = activeBaseTokenBalance(getState());
  const formName = offerMakeToFormName(offerMakeType);

  const { price } = currentFormValues(getState())(formName);

  const usersBaseTokenBalanceBN = web3.toBigNumber(web3.fromWei(balance));
  const priceBN = web3.toBigNumber(price.toString());

  const totalSerialized = usersBaseTokenBalanceBN
    .mul(priceBN)
    .toFixed()
    .toString();
  dispatch(change(formName, "total", totalSerialized));
  dispatch(defer(totalFieldValueChangedEpic, offerMakeType, totalSerialized));
};

/**
 *  Create new offer transaction actions
 */

//TODO: window? why not direct call?
const makeOfferTransaction = createAction(
  "OFFER_MAKES/MAKE_OFFER_TRANSACTION",
  ({
    payAmount,
    payToken,
    buyAmount,
    buyToken,
    isCloseMatchingEnabled,
    rankIndex,
    gasPrice = DEFAULT_GAS_PRICE
  }) => {
    const offer = getMarketNoProxyContractInstance().offer['uint256,address,uint256,address,uint256,bool'];

    return new Promise((resolve, reject) =>
      offer(
        payAmount,
        payToken,
        buyAmount,
        buyToken,
        rankIndex,
        isCloseMatchingEnabled,
        {
          gasPrice
        },
        (err, res) =>
      {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      })
    );
  }
);

const makeOffer = createPromiseActions("OFFER_MAKES/MAKE_OFFER");

//TODO: To many duties at once. Offer form and offer making logic needlessly coupled here...
const makeOfferEpic = (offerMakeType, withCallbacks = {}) => async (
  dispatch,
  getState
) => {
  dispatch(makeOffer.pending());

  const activeOfferMake = offerMakes.activeOfferMakePure(
    getState(),
    offerMakeToFormName(offerMakeType)
  );

  const makeOfferPayload = {
    rankIndex: activeOfferMake.get('newOfferRankIndex'),
    payAmount: convertToTokenPrecision(
      activeOfferMake.getIn(["offerData", "payAmount"]),
      activeOfferMake.get("sellToken")
    ),
    buyAmount: convertToTokenPrecision(
      activeOfferMake.getIn(["offerData", "buyAmount"]),
      activeOfferMake.get("buyToken")
    ),
    payToken: activeOfferMake.get("sellTokenAddress"),
    buyToken: activeOfferMake.get("buyTokenAddress"),
    isCloseMatchingEnabled: true,
    // gas: transactionGasCostEstimate(getState(), TX_OFFER_MAKE) * 1.1,
  };

  return handleTransaction({
    dispatch,
    transactionDispatcher: () =>
      dispatch(makeOfferTransaction(makeOfferPayload)),
    transactionType: TX_OFFER_MAKE,
    txMeta: { offerMakeType, makeOfferPayload },
    withCallbacks
  });
};

/**
 * Initial setup actions
 */

const setActiveOfferMakeType = createAction(
  "OFFER_MAKES/SET_ACTIVE_OFFER_MAKE_TYPE",
  makeType => makeType
);
const resetActiveOfferMakeType = createAction(
  "OFFER_MAKES/RESET_ACTIVE_OFFER_MAKE_TYPE"
);

const initializeOfferMakeFormEpic = offerMakeType => dispatch => {
  const formName = offerMakeToFormName(offerMakeType);
  dispatch(
    initialize(formName, {
      price: null,
      volume: null,
      total: null
    })
  );
};

/**
 *  Set offer make modal  open / closed
 */

const setOfferMakeModalOpen = createAction(
  "OFFER_MAKES/SET_MODAL_OPEN",
  offerMakeType => ({ formName: offerMakeToFormName(offerMakeType) })
);

const setOfferMakeModalOpenEpic = offerMakeType => dispatch => {
  dispatch(setActiveOfferMakeType(offerMakeType));
  dispatch(updateTransactionGasCostEstimateEpicThrottled(offerMakeType));
  dispatch(setOfferMakeModalOpen(offerMakeType));
};

const setOfferMakeModalClosed = createAction(
  "OFFER_MAKES/SET_MODAL_CLOSED",
  offerMakeType => ({ formName: offerMakeToFormName(offerMakeType) })
);

const setOfferMakeModalClosedEpic = offerMakeType => dispatch => {
  dispatch(setOfferMakeModalClosed(offerMakeType));
  dispatch(resetActiveOfferMakeType());
  dispatch(resetActiveOfferMakeGasCostEstimate());
};

const localFormValueSelector = offerMakeType =>
  formValueSelector(offerMakeToFormName(offerMakeType)
);

const localChange = (offerMakeType, ...args) =>
  change(offerMakeToFormName(offerMakeType), ...args);

/***
 * Form fields changed actions
 */
const priceFieldChangedEpic = (
  offerMakeType,
  value,
  { formValueSelector = localFormValueSelector } = {}
) => (dispatch, getState) => {
  const volume = formValueSelector(offerMakeType)(getState(), "volume");
  if (
    !value ||
    (isNaN(value) || parseFloat(value) === 0) ||
    (isNaN(volume) || parseFloat(volume) === 0)
  ) {
    dispatch(localChange(offerMakeType, "total", null));
  } else {
    dispatch(
      localChange(
        offerMakeType,
        "total",
        web3
          .toBigNumber(volume)
          .mul(value)
          .toFixed()
          .toString()
      )
    );
  }
  dispatch(defer(updateTransactionGasCostEstimateEpicThrottled, offerMakeType));
};

const volumeFieldValueChangedEpic = (
  offerMakeType,
  value,
  { formValueSelector = localFormValueSelector } = {}
) => (dispatch, getState) => {
  const price = formValueSelector(offerMakeType)(getState(), "price");

  if (
    isNaN(value) ||
    parseFloat(value) <= 0 ||
    (isNaN(price) || parseFloat(price) === 0)
  ) {
    dispatch(localChange(offerMakeType, "total", "0"));
  } else {
    // dispatch(localChange(offerMakeType, 'volume', value));
    dispatch(
      localChange(
        offerMakeType,
        "total",
        web3
          .toBigNumber(value)
          .mul(price)
          .toFixed()
          .toString()
      )
    );
  }
  dispatch(defer(updateTransactionGasCostEstimateEpicThrottled, offerMakeType));
};

const totalFieldValueChangedEpic = (
  offerMakeType,
  value,
  { formValueSelector = localFormValueSelector } = {}
) => (dispatch, getState) => {
  const price = formValueSelector(offerMakeType)(getState(), "price");
  if (
    !isNaN(value) &&
    parseFloat(value) > 0 &&
    (!isNaN(price) && parseFloat(price) > 0)
  ) {
    dispatch(
      localChange(
        offerMakeType,
        "volume",
        web3
          .toBigNumber(value)
          .div(price)
          .toFixed()
          .toString()
      )
    );
    dispatch(
      defer(updateTransactionGasCostEstimateEpicThrottled, offerMakeType)
    );
  } else {
    dispatch(localChange(offerMakeType, "volume", "0"));
  }
};

/**
 *  New offer make gas estimate
 */

const resetActiveOfferMakeGasCostEstimate = createAction(
  "OFFER_MAKES/RESET_TRANSACTION_GAS_ESTIMATE"
);

const getTransactionGasEstimate = createAction(
  "OFFER_MAKES/GET_TRANSACTION_GAS_ESTIMATE",
  (payAmount, payToken, buyAmount, buyToken, toAddress) =>
    new Promise((resolve, reject) => {
      getMarketNoProxyContractInstance().offer['uint256,address,uint256,address,uint256,bool'].estimateGas(
        convertToTokenPrecision(payAmount, getTokenByAddress(payToken)),
        payToken,
        convertToTokenPrecision(buyAmount, getTokenByAddress(buyToken)),
        buyToken,
        0,
        true, // isCloseMatchingEnabled
        { to: toAddress },
        (e, estimation) => {
          if (e) {
            reject({
              payAmount: convertToTokenPrecision(
                payAmount,
                getTokenByAddress(payToken)
              ),
              payToken,
              buyAmount: convertToTokenPrecision(
                buyAmount,
                getTokenByAddress(buyToken)
              ),
              buyToken,
              toAddress
            });
          } else {
            resolve(estimation);
          }
        }
      );
    })
);

const setGasExceedsTheLimitEnabled = createAction(
  "OFFER_MAKES/GAS_EXCEEDS_THE_LIMIT_ENABLED"
);
const setGasExceedsTheLimitDisabled = createAction(
  "OFFER_MAKES/GAS_EXCEEDS_THE_LIMIT_DISABLED"
);

const updateTransactionGasCostEstimateEpic = (
  offerMakeType,
  {
    canMakeOffer = offerMakes.canMakeOffer,
    activeOfferMakePure = offerMakes.activeOfferMakePure
  } = {}
) => async (dispatch, getState) => {
  if (!canMakeOffer(getState(), offerMakeType)) {
    dispatch(resetActiveOfferMakeGasCostEstimate());
    return;
  }

  const offerMake = activeOfferMakePure(
    getState(),
    offerMakeToFormName(offerMakeType)
  );

  const payAmount = offerMake.getIn(["offerData", "payAmount"]),
    payToken = offerMake.get("sellTokenAddress"),
    buyAmount = offerMake.getIn(["offerData", "buyAmount"]),
    buyToken = offerMake.get("buyTokenAddress"),
    toAddress = getMarketContractInstance().address;
  if (
    isNumericAndGreaterThanZero(payAmount) &&
    isNumericAndGreaterThanZero(buyAmount)
  ) {
    const transactionGasCostEstimate = (await dispatch(
      defer(
        getTransactionGasEstimate,
        payAmount,
        payToken,
        buyAmount,
        buyToken,
        toAddress
      )
    )).value;

    // const gasLimitInWeiBN = web3.toBigNumber(
    //   transactions.defaultGasLimit(getState())
    // );
    // if (!!transactionGasCostEstimate && gasLimitInWeiBN.lt(transactionGasCostEstimate)) {
    //   dispatch(setGasExceedsTheLimitEnabled());
    // } else {
    //   dispatch(setGasExceedsTheLimitDisabled());
    // }
    return transactionGasCostEstimate;
  }
};

const updateTransactionGasCostEstimateEpicThrottled = throttle(
  updateTransactionGasCostEstimateEpic,
  500
);

const actions = {
  makeOfferEpic,
  setOfferMakeModalClosedEpic,
  setOfferMakeModalOpenEpic,
  priceFieldChangedEpic,
  volumeFieldValueChangedEpic,
  totalFieldValueChangedEpic,
  buyMaxEpic,
  sellMaxEpic,
  initializeOfferMakeFormEpic,
  updateTransactionGasCostEstimateEpic //exported just for testing sake
};

const reducer = handleActions(
  {
    [setOfferMakeModalOpen]: (state, { payload: { formName } }) =>
      state.setIn([formName, "isOfferMakeModalOpen"], true),
    [setOfferMakeModalClosed]: (state, { payload: { formName } }) =>
      state.setIn([formName, "isOfferMakeModalOpen"], false),
    [setActiveOfferMakeType]: (state, { payload }) =>
      state.set("activeOfferMakeType", payload),
    [resetActiveOfferMakeType]: state => state.set("activeOfferMakeType", null),
    [pending(getTransactionGasEstimate)]: state =>
      state
        .set("transactionGasCostEstimateError", false)
        .set("transactionGasCostEstimatePending", true),
    [fulfilled(getTransactionGasEstimate)]: (state, { payload }) =>
      state
        .set("transactionGasCostEstimateError", false)
        .set("transactionGasCostEstimate", payload.toString())
        .set("transactionGasCostEstimatePending", false),
    [rejected(getTransactionGasEstimate)]: state =>
      state
        .set("transactionGasCostEstimateError", true)
        .set("transactionGasCostEstimatePending", false),
    [resetActiveOfferMakeGasCostEstimate]: state =>
      state
        .set("transactionGasCostEstimate", null)
        .set("transactionGasCostEstimateError", null)
        .set("transactionGasCostEstimatePending", null),
    [setGasExceedsTheLimitEnabled]: state =>
      state.set("exceededGasLimit", true),
    [setGasExceedsTheLimitDisabled]: state =>
      state.set("exceededGasLimit", false)
  },
  initialState
);

export default {
  actions,
  reducer
};
