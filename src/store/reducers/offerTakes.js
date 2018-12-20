import { createAction, handleActions } from "redux-actions";
import { fromJS } from "immutable";
import { createPromiseActions } from "../../utils/createPromiseActions";
import tokens from "../selectors/tokens";
import offerTakes from "../selectors/offerTakes";
import offersReducer from "./offers";
import { initialize } from "redux-form";
import { TX_OFFER_TAKE } from "./transactions";
import * as form from "redux-form/immutable";
import web3 from "../../bootstrap/web3";
import {
  DEFAULT_GAS_LIMIT,
  DEFAULT_GAS_PRICE,
  ETH_UNIT_ETHER
} from "../../constants";
import balances from "../selectors/balances";
import { fulfilled, pending, rejected } from "../../utils/store";
import { handleTransaction } from "../../utils/transactions/handleTransaction";
import { defer } from "../deferredThunk";
import findOffer from "../../utils/offers/findOffer";
import {
  getMarketContractInstance,
  getMarketNoProxyContractInstance
} from "../../bootstrap/contracts";
// import transactions from "../selectors/transactions";
import isNumericAndGreaterThanZero from "../../utils/numbers/isNumericAndGreaterThanZero";
import { convertToTokenPrecision } from "../../utils/conversion";

export const TAKE_BUY_OFFER = "OFFER_TAKES/TAKE_BUY_OFFER";
export const TAKE_SELL_OFFER = "OFFER_TAKES/TAKE_SELL_OFFER";

const initialState = fromJS({
  activeOfferTakeType: null,
  isOfferTakeModalOpen: false,
  activeOfferTakeOfferId: null,
  minOrderLimitInWei: "100000000000000000",
  transactionGasCostEstimate: null,
  checkingIfOfferActive: null,
  isOfferActive: null,
  offerExceededGasLimit: null
});

const INIT = "OFFER_TAKES/INIT";

const Init = createAction(INIT, () => null);

const buyMaxEpic = (
  {
    quoteTokenBalance = balances.activeQuoteTokenBalance,
    offerTakeOfferData = offerTakes.activeOfferTakeOfferData
  } = {}
) => (dispatch, getState) => {
  const usersQuoteTokenBalanceBN = web3.toBigNumber(
    quoteTokenBalance(getState())
  );

  const activeOfferTakeData = offerTakeOfferData(getState());
  const volume = activeOfferTakeData.get("buyHowMuch");
  const priceBN = web3.toBigNumber(activeOfferTakeData.get("ask_price"));

  const total = usersQuoteTokenBalanceBN.gte(priceBN.mul(volume))
    ? web3.fromWei(priceBN.mul(volume), ETH_UNIT_ETHER)
    : web3.fromWei(usersQuoteTokenBalanceBN, ETH_UNIT_ETHER);

  const totalSerialized = total.toString();

  dispatch(form.change("takeOffer", "total", totalSerialized));
  dispatch(defer(totalFieldValueChangedEpic, totalSerialized));
};

const sellMaxEpic = (
  {
    activeBaseTokenBalance = balances.activeBaseTokenBalance,
    activeOfferTakeOfferData = offerTakes.activeOfferTakeOfferData
  } = {}
) => (dispatch, getState) => {
  const usersBaseTokenBalanceBN = web3.toBigNumber(
    activeBaseTokenBalance(getState())
  );
  const activeOfferTakeData = activeOfferTakeOfferData(getState());
  const volume = activeOfferTakeData.get("buyHowMuch");
  const priceBN = web3.toBigNumber(activeOfferTakeData.get("bid_price"));

  const total = usersBaseTokenBalanceBN.gte(volume)
    ? web3.fromWei(priceBN.mul(volume), ETH_UNIT_ETHER)
    : web3.fromWei(usersBaseTokenBalanceBN.mul(priceBN), ETH_UNIT_ETHER);

  const totalSerialized = web3
    .toBigNumber(total)
    .toFixed()
    .toString();
  dispatch(form.change("takeOffer", "total", totalSerialized));
  dispatch(defer(totalFieldValueChangedEpic, totalSerialized));
};

const resetCompletedOfferCheck = createAction(
  "OFFER_TAKES/RESET_COMPLETED_OFFER_CHECK"
);

const sendBuyTransaction = createAction(
  "OFFER_TAKES/MARKET_BUY",
  (
    offerId,
    amount,
    gasPrice = DEFAULT_GAS_PRICE
  ) =>
    getMarketContractInstance().buy(offerId, amount, {
      gasPrice
    })
);

const takeOffer = createPromiseActions("OFFER_TAKES/TAKE_OFFER");

const takeOfferEpic = (withCallbacks = {}) => async (dispatch, getState) => {
  const amountInWei = convertToTokenPrecision(
    web3.toWei(offerTakes.getBuyAmount(getState()), ETH_UNIT_ETHER),
    offerTakes.activeOfferTakeOfferData(getState()).get("sellWhichToken")
  );

  const activeOfferTakeOfferId = offerTakes.activeOfferTakeOfferId(getState());

  dispatch(takeOffer.pending());

  return handleTransaction({
    dispatch,
    transactionDispatcher: () =>
      dispatch(sendBuyTransaction(activeOfferTakeOfferId, amountInWei)),
    transactionType: TX_OFFER_TAKE,
    withCallbacks
  });
};

const setActiveOfferTakeType = createAction(
  "OFFER_TAKES/SET_ACTIVE_OFFER_TAKE_TYPE",
  takeType => takeType
);
const resetActiveOfferTakeType = createAction(
  "OFFER_TAKES/RESET_ACTIVE_OFFER_TAKE_TYPE"
);

const setOfferTakeModalOpen = createAction("OFFER_TAKES/SET_MODAL_OPEN");
const setOfferTakeModalOpenEpic = ({ offerId, offerTakeType }) => dispatch => {
  dispatch(setActiveOfferTakeOfferId(offerId));
  dispatch(setActiveOfferTakeType(offerTakeType));
  dispatch(defer(initializeOfferTakeFormEpic));
  dispatch(defer(getTransactionGasCostEstimateEpic));
  dispatch(setOfferTakeModalOpen());
};

const setOfferTakeModalClosed = createAction("OFFER_TAKES/SET_MODAL_CLOSED");
const setOfferTakeModalClosedEpic = () => dispatch => {
  dispatch(setOfferTakeModalClosed());
  dispatch(resetActiveOfferTakeType());
  dispatch(resetActiveOfferTakeOfferId());
  dispatch(resetActiveOfferTakeGasCostEstimate());
  dispatch(resetCompletedOfferCheck());
};

const initializeOfferTakeForm = createAction(
  "OFFER_TAKES/INITIALIZE_OFFER_TAKE_FORM"
);
const initializeOfferTakeFormEpic = () => (dispatch, getState) => {
  const activeOfferTake = offerTakes.activeOfferTake(getState());
  const activeTradingPairPrecision = tokens.precision(getState());
  let price, volume, total;
  switch (offerTakes.activeOfferTakeType(getState())) {
    case TAKE_SELL_OFFER:
      [price, volume, total] = [
        activeOfferTake.getIn(["offerData", "ask_price"]),
        activeOfferTake.getIn(["offerData", "sellHowMuch"]),
        activeOfferTake.getIn(["offerData", "buyHowMuch"])
      ];
      break;
    case TAKE_BUY_OFFER:
      [price, volume, total] = [
        activeOfferTake.getIn(["offerData", "bid_price"]),
        activeOfferTake.getIn(["offerData", "buyHowMuch"]),
        activeOfferTake.getIn(["offerData", "sellHowMuch"])
      ];
      break;
    default:
      throw new Error("No offer take type provided!");
  }
  dispatch(
    initialize("takeOffer", {
      price,
      volume: web3
        .fromWei(volume, ETH_UNIT_ETHER, {
          precision: activeTradingPairPrecision
        })
        .toString(),
      total: web3
        .fromWei(total, ETH_UNIT_ETHER, {
          precision: activeTradingPairPrecision
        })
        .toString()
    })
  );
  dispatch(initializeOfferTakeForm());
};

const setActiveOfferTakeOfferId = createAction(
  "OFFER_TAKES/SET_ACTIVE_OFFER_TAKE_OFFER_ID"
);
const resetActiveOfferTakeOfferId = createAction(
  "OFFER_TAKES/RESET_ACTIVE_OFFER_TAKE_OFFER_ID"
);

const checkIfOfferTakeSubjectIsActive = createPromiseActions(
  "OFFER_TAKES/CHECK_IF_OFFER_TAKE_SUBJECT_IS_ACTIVE"
);
const checkIfOfferTakeSubjectStillActiveEpic = offerId => async (
  dispatch,
  getState
) => {
  const activeOfferTakeOfferId =
    offerId || offerTakes.activeOfferTakeOfferId(getState());
  dispatch(checkIfOfferTakeSubjectIsActive.pending());
  const isActive = (await dispatch(
    offersReducer.actions.checkOfferIsActive(activeOfferTakeOfferId)
  )).value;
  dispatch(checkIfOfferTakeSubjectIsActive.fulfilled(isActive));
  if (false === isActive) {
    dispatch(
      offersReducer.actions.markOfferAsInactive(
        findOffer(activeOfferTakeOfferId, getState())
      )
    );
  }
  return isActive;
};

const volumeFieldValueChangedEpic = (
  value,
  { formValueSelector = form.formValueSelector } = {}
) => (dispatch, getState) => {
  const { price } = formValueSelector("takeOffer")(
    getState(),
    "volume",
    "total",
    "price"
  );

  if (isNaN(value)) {
    dispatch(form.change("takeOffer", "total", "0"));
  } else {
    dispatch(
      form.change(
        "takeOffer",
        "total",
        web3
          .toBigNumber(value)
          .mul(price)
          .toFixed()
          .toString()
      )
    );
  }

  dispatch(defer(getTransactionGasCostEstimateEpic));
};

const totalFieldValueChangedEpic = (
  value,
  { formValueSelector = form.formValueSelector } = {}
) => (dispatch, getState) => {
  const { price } = formValueSelector("takeOffer")(
    getState(),
    "volume",
    "total",
    "price"
  );

  dispatch(
    form.change(
      "takeOffer",
      "volume",
      web3
        .toBigNumber(value)
        .div(price)
        .toFixed()
        .toString()
    )
  );

  if (isNaN(value)) {
    dispatch(form.change("takeOffer", "volume", "0"));
  } else {
    dispatch(
      form.change(
        "takeOffer",
        "volume",
        web3
          .toBigNumber(value)
          .div(price)
          .toFixed()
          .toString()
      )
    );
  }

  dispatch(defer(getTransactionGasCostEstimateEpic));
};

const resetActiveOfferTakeGasCostEstimate = createAction(
  "OFFER_TAKES/RESET_TRANSACTION_GAS_ESTIMATE"
);

const getTransactionGasCostEstimate = createAction(
  "OFFER_TAKES/GET_TRANSACTION_GAS_ESTIMATE",
  ({ offerId, amount, offerOwner, activeOfferData }) =>
    new Promise((resolve, reject) => {
      console.log(
        "trying to estimate: ",
        offerId,
        amount,
        offerOwner,
        DEFAULT_GAS_LIMIT
      );

      getMarketNoProxyContractInstance().buy.estimateGas(
        offerId,
        amount,
        { to: offerOwner },
        (e, estimation) => {
          if (e) {
            console.log("gas estimation failed!");
            reject({
              offerId,
              amount,
              to: offerOwner,
              activeOfferData
            });
          } else {
            console.log(
              "gas estimation:",
              offerId,
              amount,
              offerOwner,
              estimation
            );
            resolve(estimation);
          }
        }
      );
    })
);

const getTransactionGasCostEstimateEpic = (
  {
    canFulfillOffer = offerTakes.canFulfillOffer,
    activeOfferTakeOfferId = offerTakes.activeOfferTakeOfferId,
    takeFormValuesSelector = offerTakes.takeFormValuesSelector,
    activeOfferTakeOfferOwner = offerTakes.activeOfferTakeOfferOwner,
    activeOfferTakeOfferData = offerTakes.activeOfferTakeOfferData,
    getBuyAmount = offerTakes.getBuyAmount
  } = {}
) => async (dispatch, getState) => {
  const offerId = activeOfferTakeOfferId(getState());
  const { volume, total } = takeFormValuesSelector(
    getState(),
    "volume",
    "total"
  );

  if (
    !isNumericAndGreaterThanZero(volume) ||
    !isNumericAndGreaterThanZero(total) ||
    !canFulfillOffer(getState())
  ) {
    return null;
  }

  // console.log("===========================================================================================");
  // console.log("transactionGasCostEstimate",
  //   getBuyAmount(getState()),
  //   offerTakes.activeOfferTakeType(getState()),
  //   activeOfferTakeOfferData(getState()).get("buyWhichToken"),
  //   activeOfferTakeOfferData(getState()).get("sellWhichToken"),
  //   offerTakes.activeOfferTakeType(getState()) === TAKE_BUY_OFFER
  //   ? activeOfferTakeOfferData(getState()).get("buyWhichToken")
  //   : activeOfferTakeOfferData(getState()).get("sellWhichToken"));
  // console.log("===========================================================================================");
  
  const transactionGasCostEstimate = (await dispatch(
    defer(getTransactionGasCostEstimate, {
      offerId,
      amount: convertToTokenPrecision(
        web3.toWei(getBuyAmount(getState()), ETH_UNIT_ETHER),
        activeOfferTakeOfferData(getState()).get("sellWhichToken")
      ),
      offerOwner: activeOfferTakeOfferOwner(getState()),
      activeOfferData: activeOfferTakeOfferData(getState())
    })
  )).value;

  // const gasLimitInWeiBN = web3.toBigNumber(
  //   transactions.defaultGasLimit(getState())
  // );
  // if (gasLimitInWeiBN.lt(transactionGasCostEstimate)) {
  //   dispatch(setGasExceedsTheLimitEnabled());
  // } else {
  //   dispatch(setGasExceedsTheLimitDisabled());
  // }
  return transactionGasCostEstimate;
};

const setGasExceedsTheLimitEnabled = createAction(
  "OFFER_TAKES/GAS_EXCEEDS_THE_LIMIT_ENABLED"
);
const setGasExceedsTheLimitDisabled = createAction(
  "OFFER_TAKES/GAS_EXCEEDS_THE_LIMIT_DISABLED"
);

const actions = {
  Init,
  takeOffer,
  takeOfferEpic,
  setOfferTakeModalClosedEpic,
  setOfferTakeModalOpenEpic,
  setActiveOfferTakeType,
  setActiveOfferTakeOfferId,
  resetActiveOfferTakeOfferId,
  checkIfOfferTakeSubjectStillActiveEpic,
  volumeFieldValueChangedEpic,
  totalFieldValueChangedEpic,
  buyMaxEpic,
  sellMaxEpic,
  getTransactionGasCostEstimateEpic,
  resetCompletedOfferCheck
};

const reducer = handleActions(
  {
    [setOfferTakeModalOpen]: state => state.set("isOfferTakeModalOpen", true),
    [setOfferTakeModalClosed]: state =>
      state.set("isOfferTakeModalOpen", false),
    [setActiveOfferTakeType]: (state, { payload }) =>
      state.set("activeOfferTakeType", payload),
    [resetActiveOfferTakeType]: state => state.set("activeOfferTakeType", null),
    [setActiveOfferTakeOfferId]: (state, { payload }) =>
      state.set("activeOfferTakeOfferId", payload),
    [resetActiveOfferTakeOfferId]: state =>
      state.set("activeOfferTakeOfferId", null),
    [checkIfOfferTakeSubjectIsActive.pending]: state =>
      state.set("checkingIfOfferActive", true),
    [checkIfOfferTakeSubjectIsActive.fulfilled]: (state, { payload }) =>
      state.set("isOfferActive", payload).set("checkingIfOfferActive", false),
    [pending(getTransactionGasCostEstimate)]: state =>
      state
        .set("transactionGasCostEstimateError", false)
        .set("transactionGasCostEstimatePending", true),
    [fulfilled(getTransactionGasCostEstimate)]: (state, { payload }) =>
      state
        .set("transactionGasCostEstimateError", false)
        .set("transactionGasCostEstimate", payload.toString())
        .set("transactionGasCostEstimatePending", false),
    [rejected(getTransactionGasCostEstimate)]: state =>
      state
        .set("transactionGasCostEstimateError", true)
        .set("transactionGasCostEstimatePending", false),
    [resetActiveOfferTakeGasCostEstimate]: state =>
      state
        .set("transactionGasCostEstimate", null)
        .set("transactionGasCostEstimateError", null)
        .set("transactionGasCostEstimatePending", null),

    [resetCompletedOfferCheck]: state =>
      state.set("checkingIfOfferActive", null).set("isOfferActive", null),
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
