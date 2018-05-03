import {createAction, handleActions} from 'redux-actions';
import {fromJS} from 'immutable';
import {createPromiseActions} from '../../utils/createPromiseActions';
import offerMakes from '../selectors/offerMakes';
import {change, formValueSelector, initialize} from 'redux-form/immutable';
import transactionsReducer, {DEFAULT_GAS_LIMIT, TX_OFFER_MAKE, TX_STATUS_CANCELLED_BY_USER} from './transactions';
import web3 from '../../bootstrap/web3';
import balances from '../selectors/balances';
import {fulfilled, pending, rejected} from '../../utils/store';
import network from '../selectors/network';

import offerMakeToFormName from '../../utils/offers/offerMakeToFormName';

import throttle from 'lodash/throttle';
import { getTimestamp } from '../../utils/time';

import {defer} from '../deferredThunk';

import {MAKE_BUY_OFFER, MAKE_SELL_OFFER} from 'constants'

const initialState = fromJS(
  {
    makeBuyOffer: {
      type: MAKE_BUY_OFFER,
      isOfferMakeModalOpen: false,
      activeOfferMakeOfferDraftId: null,
      transactionGasCostEstimate: null,
      txSubjectId: null,
      drafts: [],
    },
    makeSellOffer: {
      type: MAKE_SELL_OFFER,
      isOfferMakeModalOpen: false,
      activeOfferMakeOfferDraftId: null,
      transactionGasCostEstimate: null,
      txSubjectId: null,
      drafts: [],
    },
    activeOfferMakeType: null,
  },
);

const buyMaxEpic = (offerMakeType,
                    {activeQuoteTokenBalance = balances.activeQuoteTokenBalance} = {}) => (dispatch, getState) =>
{

  const balance = activeQuoteTokenBalance(getState());

  const total = web3.toBigNumber(web3.fromWei(balance)).toString();

  dispatch(localChange(offerMakeType, 'total', total));
  dispatch(defer(totalFieldValueChangedEpic, offerMakeType, total));
};

const sellMaxEpic = (offerMakeType,
                     { activeBaseTokenBalance = balances.activeBaseTokenBalance,
                       currentFormValues = offerMakes.currentFormValues
                     } = {}) => (dispatch, getState) => {
  const balance = activeBaseTokenBalance(getState())
  const formName = offerMakeToFormName(offerMakeType);

  const {price} = currentFormValues(getState(), formName);

  const usersBaseTokenBalanceBN = web3.toBigNumber(web3.fromWei(balance));
  const priceBN = web3.toBigNumber(price.toString());
  const total = usersBaseTokenBalanceBN.mul(priceBN).toString();

  dispatch(change(formName, 'total', total));
  dispatch(defer(totalFieldValueChangedEpic, offerMakeType, total));
};

/**
 *  Create new offer transaction actions
 */

//TODO: window? why not direct call?
const makeOfferTransaction = createAction(
  'OFFER_MAKES/MAKE_OFFER_TRANSACTION',
  ({payAmount, payToken, buyAmount, buyToken, gasLimit}) =>
    window.contracts.market.offer(payAmount, payToken, buyAmount, buyToken, 0, {gasLimit: gasLimit || DEFAULT_GAS_LIMIT}),
);

const makeOffer = createPromiseActions('OFFER_MAKES/MAKE_OFFER');


//TODO: To many duties at once. Offer form and offer making logic needlessly coupled here...
const makeOfferEpic = (offerMakeType) => async (dispatch, getState) => {

  //TODO: Already refactored?
  dispatch(makeOffer.pending());

  const activeOfferMake = offerMakes.activeOfferMakePure(getState(), offerMakeToFormName(offerMakeType));
  const makeOfferPayload = {
    payAmount: activeOfferMake.getIn(['offerData', 'payAmount']),
    buyAmount: activeOfferMake.getIn(['offerData', 'buyAmount']),
    payToken: activeOfferMake.get('sellTokenAddress'),
    buyToken: activeOfferMake.get('buyTokenAddress'),
  };


  try {

    //TODO: why indirection?
    //TODO: Not sure about error handling?
    const pendingMakeOfferAction = dispatch(
      makeOfferTransaction(makeOfferPayload)
    );

    pendingMakeOfferAction.then((e, transactionHash) => {
      dispatch(
        transactionsReducer.actions.addTransactionEpic({
          txType: TX_OFFER_MAKE,
          txMeta: { offerMakeType },
          txHash: transactionHash,
        }),
      );
    });

  } catch (e) {
    dispatch(
      transactionsReducer.actions.addTransactionEpic({
        txType: TX_OFFER_MAKE,
        txMeta: { offerMakeType },
      }),
    );
    dispatch(makeOffer.rejected());
    dispatch(
      transactionsReducer.actions.transactionCancelledByUser({
        txType: TX_OFFER_MAKE,
        txMeta: { offerMakeType },
        txStatus: TX_STATUS_CANCELLED_BY_USER,
        txStats: {
          txEndBlockNumber: network.latestBlockNumber(getState()),
          txEndTimestamp: getTimestamp(),
        },
      }),
    );
  }
};

/**
 * Initial setup actions
 */

const setActiveOfferMakeType = createAction('OFFER_MAKES/SET_ACTIVE_OFFER_MAKE_TYPE', makeType => makeType);
const resetActiveOfferMakeType = createAction('OFFER_MAKES/RESET_ACTIVE_OFFER_MAKE_TYPE');

const initializeOfferMakeFormEpic = (offerMakeType) => dispatch => {
  const formName = offerMakeToFormName(offerMakeType);
  dispatch(
    initialize(formName, {
      price: null,
      volume: null,
      total: null
    }),
  );
};

/**
 *  Set offer make modal  open / closed
 */

const setOfferMakeModalOpen = createAction(
  'OFFER_MAKES/SET_MODAL_OPEN',
  offerMakeType => ({formName: offerMakeToFormName(offerMakeType)}),
);

const setOfferMakeModalOpenEpic = (offerMakeType) => (dispatch) => {
  dispatch(setActiveOfferMakeType(offerMakeType));
  dispatch(updateTransactionGasCostEstimateEpic(offerMakeType));
  dispatch(setOfferMakeModalOpen(offerMakeType));
};

const setOfferMakeModalClosed = createAction(
  'OFFER_MAKES/SET_MODAL_CLOSED',
  offerMakeType => ({formName: offerMakeToFormName(offerMakeType)}),
);

const setOfferMakeModalClosedEpic = (offerMakeType) => (dispatch) => {
  dispatch(setOfferMakeModalClosed(offerMakeType));
  dispatch(resetActiveOfferMakeType());
  dispatch(resetActiveOfferMakeGasCostEstimate(offerMakeType));
};

const localFormValueSelector = (offerMakeType) => formValueSelector(offerMakeToFormName(offerMakeType));

const localChange = (offerMakeType, ...args) => change(offerMakeToFormName(offerMakeType), ...args);

/***
 * Form fields changed actions
 */
const priceFieldChangedEpic =
  (offerMakeType, value, {formValueSelector = localFormValueSelector} = {}) => (dispatch, getState) => {
    const volume = formValueSelector(offerMakeType)(getState(), 'volume');
    if (!value || (isNaN(value) || parseFloat(value) === 0) || (isNaN(volume) || parseFloat(volume) === 0)) {
      dispatch(localChange(offerMakeType, 'total', null));
    } else {
      dispatch(localChange(offerMakeType, 'total', web3.toBigNumber(volume).mul(value).toString()));
    }
    dispatch(defer(updateTransactionGasCostEstimateEpic, offerMakeType));
  };

const volumeFieldValueChangedEpic =
  (offerMakeType, value, {formValueSelector = localFormValueSelector} = {}) => (dispatch, getState) => {

    const price = formValueSelector(offerMakeType)(getState(), 'price');

    if ((isNaN(value) || parseFloat(value) <= 0) || (isNaN(price) || parseFloat(price) === 0)) {
      dispatch(localChange(offerMakeType, 'total', '0'));
    } else {
      // dispatch(localChange(offerMakeType, 'volume', value));
      dispatch(localChange(offerMakeType, 'total', web3.toBigNumber(value).mul(price).toString()));
    }
    dispatch(defer(updateTransactionGasCostEstimateEpic, offerMakeType));
  };

const totalFieldValueChangedEpic =
  (offerMakeType, value, {formValueSelector = localFormValueSelector} = {}) => (dispatch, getState) => {
    const price = formValueSelector(offerMakeType)(getState(), 'price');
    if ((!isNaN(value) && parseFloat(value) > 0) && (!isNaN(price) && parseFloat(price) > 0)) {
      dispatch(localChange(offerMakeType, 'volume', web3.toBigNumber(value).div(price).toString()));
    }
    dispatch(defer(updateTransactionGasCostEstimateEpic, offerMakeType));
  };

/**
 *  New offer make gas estimate
 */

const resetActiveOfferMakeGasCostEstimate = createAction('OFFER_MAKES/RESET_TRANSACTION_GAS_ESTIMATE');

const getTransactionGasEstimate = createAction('OFFER_MAKES/GET_TRANSACTION_GAS_ESTIMATE',
  (payAmount, payToken, buyAmount, buyToken, toAddress) => new Promise((resolve, reject) => {
    window.contracts.marketNoProxy.offer.estimateGas(
      payAmount, payToken, buyAmount, buyToken, 0, {to: toAddress, gasLimit: DEFAULT_GAS_LIMIT},
      (e, estimation) => {
        if (e) {
          reject({
            payAmount, payToken, buyAmount, buyToken, toAddress,
          });
        } else {
          resolve(estimation);
        }
      },
    );
  })
);

const updateTransactionGasCostEstimateEpic =
  throttle((offerMakeType,
            {
              canMakeOffer = offerMakes.canMakeOffer,
              activeOfferMakePure = offerMakes.activeOfferMakePure
            } = {}) => async (dispatch, getState) => {
    if (!canMakeOffer(getState(), offerMakeType)) {
      dispatch(defer(resetActiveOfferMakeGasCostEstimate));
      return;
    }

    const offerMake = activeOfferMakePure(getState(), offerMakeToFormName(offerMakeType));

    const
      payAmount = offerMake.getIn(['offerData', 'payAmount']),
      payToken = offerMake.get('sellTokenAddress'),
      buyAmount = offerMake.getIn(['offerData', 'buyAmount']),
      buyToken = offerMake.get('buyTokenAddress'),
      toAddress = window.contracts.market.address;

    dispatch(defer(getTransactionGasEstimate, payAmount, payToken, buyAmount, buyToken, toAddress));
  }, 500);

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

const reducer = handleActions({
  [setOfferMakeModalOpen]: (state, {payload: {formName}}) => state.setIn([formName, 'isOfferMakeModalOpen'], true),
  [setOfferMakeModalClosed]: (state, {payload: {formName}}) => state.setIn([formName, 'isOfferMakeModalOpen'], false),
  [setActiveOfferMakeType]: (state, {payload}) => state.set('activeOfferMakeType', payload),
  [resetActiveOfferMakeType]: state => state.set('activeOfferMakeType', null),
  [pending(getTransactionGasEstimate)]:
    state => state.set('transactionGasCostEstimatePending', true),
  [fulfilled(getTransactionGasEstimate)]:
    (state, {payload}) =>
      state
        .set('transactionGasCostEstimate', payload.toString())
        .set('transactionGasCostEstimatePending', false),
  [rejected(getTransactionGasEstimate)]:
    state =>
      state
        .set('transactionGasCostEstimateError', true)
        .set('transactionGasCostEstimatePending', false),
  [resetActiveOfferMakeGasCostEstimate]:
    state => state
      .set('transactionGasCostEstimate', null)
      .set('transactionGasCostEstimateError', null)
      .set('transactionGasCostEstimatePending', null),
}, initialState);

export default {
  actions,
  reducer
};