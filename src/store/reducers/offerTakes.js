import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { createPromiseActions } from '../../utils/createPromiseActions';
import tokens from '../selectors/tokens';
import offerTakes from '../selectors/offerTakes';
import offersReducer from './offers';
import { initialize } from 'redux-form';
import { DEFAULT_GAS_LIMIT, TX_OFFER_TAKE } from './transactions';
import * as form from 'redux-form/immutable';
import web3 from '../../bootstrap/web3';
import { ETH_UNIT_ETHER } from '../../constants';
import balances from '../selectors/balances';
import { fulfilled, pending, rejected } from '../../utils/store';
import { handleTransaction } from '../../utils/transactions/handleTransaction';

export const TAKE_BUY_OFFER = 'OFFER_TAKES/TAKE_BUY_OFFER';
export const TAKE_SELL_OFFER = 'OFFER_TAKES/TAKE_SELL_OFFER';

import {defer} from '../deferredThunk';

const initialState = fromJS({
  activeOfferTakeType: null,
  isOfferTakeModalOpen: false,
  activeOfferTakeOfferId: null,
  minOrderLimitInWei: '100000000000000000',
  transactionGasCostEstimate: null,
  checkingIfOfferActive: null,
  isOfferActive: null,

});

const INIT = 'OFFER_TAKES/INIT';

const Init = createAction(
  INIT, () => null,
);

const buyMaxEpic = ({quoteTokenBalance = balances.activeQuoteTokenBalance,
                     offerTakeOfferData = offerTakes.activeOfferTakeOfferData} = {}) => (dispatch, getState) =>
{
  const usersQuoteTokenBalanceBN = web3.toBigNumber(quoteTokenBalance(getState()));

  const activeOfferTakeData = offerTakeOfferData(getState());
  const volume = activeOfferTakeData.get('buyHowMuch');
  const priceBN = web3.toBigNumber(activeOfferTakeData.get('ask_price'));

  const total = usersQuoteTokenBalanceBN.gte(priceBN.mul(volume)) ?
    web3.fromWei(priceBN.mul(volume), ETH_UNIT_ETHER) :
    web3.fromWei(usersQuoteTokenBalanceBN, ETH_UNIT_ETHER);

  dispatch(form.change('takeOffer', 'total', total));
  dispatch(defer(totalFieldValueChangedEpic, total));
};

const sellMaxEpic = ({activeBaseTokenBalance = balances.activeBaseTokenBalance,
                      activeOfferTakeOfferData = offerTakes.activeOfferTakeOfferData} = {}) => (dispatch, getState) =>
{
  const usersBaseTokenBalanceBN = web3.toBigNumber(activeBaseTokenBalance(getState()));
  const activeOfferTakeData = activeOfferTakeOfferData(getState());
  const volume = activeOfferTakeData.get('buyHowMuch');
  const priceBN = web3.toBigNumber(activeOfferTakeData.get('bid_price'));

  const total = usersBaseTokenBalanceBN.gte(volume) ?
    web3.fromWei(priceBN.mul(volume), ETH_UNIT_ETHER) :
    web3.fromWei(usersBaseTokenBalanceBN.mul(priceBN), ETH_UNIT_ETHER);

  dispatch(form.change('takeOffer', 'total', total));
  dispatch(defer(totalFieldValueChangedEpic, total));
};

const resetCompletedOfferCheck = createAction('OFFER_TAKES/RESET_COMPLETED_OFFER_CHECK');

const sendBuyTransaction = createAction(
  'OFFER_TAKES/MARKET_BUY',
  (offerId, amount, gasLimit) =>
    window.contracts.market.buy(offerId, amount, { gasLimit: gasLimit || DEFAULT_GAS_LIMIT }),
);

const takeOffer = createPromiseActions('OFFER_TAKES/TAKE_OFFER');

const takeOfferEpic = (withCallbacks = {}) => async (dispatch, getState) => {
  const volume = form.formValueSelector('takeOffer')(getState(), 'volume');
  const volumeInWei = web3.toWei(volume, ETH_UNIT_ETHER);
  const activeOfferTakeOfferId = offerTakes.activeOfferTakeOfferId(getState());
  dispatch(takeOffer.pending());

  return handleTransaction({
    dispatch,
    transactionDispatcher: () => dispatch(sendBuyTransaction(activeOfferTakeOfferId, volumeInWei)),
    transactionType: TX_OFFER_TAKE,
    withCallbacks
  });
};

const setActiveOfferTakeType = createAction('OFFER_TAKES/SET_ACTIVE_OFFER_TAKE_TYPE', takeType => takeType);
const resetActiveOfferTakeType = createAction('OFFER_TAKES/RESET_ACTIVE_OFFER_TAKE_TYPE');

const setOfferTakeModalOpen = createAction('OFFER_TAKES/SET_MODAL_OPEN');
const setOfferTakeModalOpenEpic = ({ offerId, offerTakeType }) => (dispatch) => {
  dispatch(setActiveOfferTakeOfferId(offerId));
  dispatch(setActiveOfferTakeType(offerTakeType));
  dispatch(getTransactionGasCostEstimateEpic());
  dispatch(defer(initializeOfferTakeFormEpic));
  dispatch(setOfferTakeModalOpen());
};

const setOfferTakeModalClosed = createAction('OFFER_TAKES/SET_MODAL_CLOSED');
const setOfferTakeModalClosedEpic = () => (dispatch) => {
  dispatch(setOfferTakeModalClosed());
  dispatch(resetActiveOfferTakeType());
  dispatch(resetActiveOfferTakeOfferId());
  dispatch(resetActiveOfferTakeGasCostEstimate());
  dispatch(resetCompletedOfferCheck());
};

const initializeOfferTakeForm = createAction('OFFER_TAKES/INITIALIZE_OFFER_TAKE_FORM');
const initializeOfferTakeFormEpic = () => (dispatch, getState) => {

  const activeOfferTake = offerTakes.activeOfferTake(getState());
  const activeTradingPairPrecision = tokens.precision(getState());
  let price, volume, total;
  switch (offerTakes.activeOfferTakeType(getState())) {
    case TAKE_SELL_OFFER:
      [price, volume, total] = [
        activeOfferTake.getIn(['offerData', 'ask_price']),
        activeOfferTake.getIn(['offerData', 'sellHowMuch']),
        activeOfferTake.getIn(['offerData', 'buyHowMuch']),
      ];
      break;
    case TAKE_BUY_OFFER:
      [price, volume, total] = [
        activeOfferTake.getIn(['offerData', 'bid_price']),
        activeOfferTake.getIn(['offerData', 'buyHowMuch']),
        activeOfferTake.getIn(['offerData', 'sellHowMuch']),
      ];
      break;
    default:
      throw new Error('No offer take type provided!');
  }
  dispatch(
    initialize('takeOffer', {
      price,
      volume: web3.fromWei(volume, ETH_UNIT_ETHER, { precision: activeTradingPairPrecision }).toString(),
      total: web3.fromWei(total, ETH_UNIT_ETHER, { precision: activeTradingPairPrecision }).toString(),
    }),
  );
  dispatch(initializeOfferTakeForm());
};


const setActiveOfferTakeOfferId = createAction('OFFER_TAKES/SET_ACTIVE_OFFER_TAKE_OFFER_ID');
const resetActiveOfferTakeOfferId = createAction('OFFER_TAKES/RESET_ACTIVE_OFFER_TAKE_OFFER_ID');

const checkIfOfferTakeSubjectIsActive = createPromiseActions('OFFER_TAKES/CHECK_IF_OFFER_TAKE_SUBJECT_IS_ACTIVE');
const checkIfOfferTakeSubjectStillActiveEpic = (offerId) => async (dispatch, getState) => {
  const activeOfferTakeOfferId = offerId || offerTakes.activeOfferTakeOfferId(getState());
  dispatch(checkIfOfferTakeSubjectIsActive.pending());
  const isActive = (await dispatch(offersReducer.actions.checkOfferIsActive(activeOfferTakeOfferId))).value;
  dispatch(
    checkIfOfferTakeSubjectIsActive.fulfilled(isActive),
  );
  return isActive;
};

const volumeFieldValueChangedEpic = (value, {formValueSelector = form.formValueSelector} = {}) => (dispatch, getState) => {

  const { price } = formValueSelector('takeOffer')(getState(), 'volume', 'total', 'price');

  if (isNaN(value)) {
    dispatch(form.change('takeOffer', 'total', '0'));
  } else {
    dispatch(form.change('takeOffer', 'total', web3.toBigNumber(value).mul(price).toString()));
  }

  dispatch(defer(getTransactionGasCostEstimateEpic));
};

const totalFieldValueChangedEpic = (value, {formValueSelector = form.formValueSelector} = {}) => (dispatch, getState) => {
  const { price } = formValueSelector('takeOffer')(getState(), 'volume', 'total', 'price');

  dispatch(form.change('takeOffer', 'volume', web3.toBigNumber(value).div(price).toString()));

  if (isNaN(value)) {
    dispatch(form.change('takeOffer', 'volume', '0'));
  } else {
    dispatch(form.change('takeOffer', 'volume', web3.toBigNumber(value).div(price).toString()));
  }

  dispatch(defer(getTransactionGasCostEstimateEpic));
};

const resetActiveOfferTakeGasCostEstimate = createAction(
  'OFFER_TAKES/RESET_TRANSACTION_GAS_ESTIMATE',
);

const getTransactionGasCostEstimate = createAction(
  'OFFER_TAKES/GET_TRANSACTION_GAS_ESTIMATE',
  ({ offerId, amount, offerOwner, activeOfferData }) => new Promise((resolve, reject) => {
    window.contracts.marketNoProxy.buy.estimateGas(
      offerId, amount, { to: offerOwner, gasLimit: DEFAULT_GAS_LIMIT },
      (e, estimation) => {
        if (e) {
          reject({
            offerId, amount, to: offerOwner, activeOfferData,
          });
        } else {
          resolve(estimation);
        }
      },
    );
  }),
);

const getTransactionGasCostEstimateEpic = (
  { canFulfillOffer = offerTakes.canFulfillOffer,
    activeOfferTakeOfferId = offerTakes.activeOfferTakeOfferId,
    takeFormValuesSelector = offerTakes.takeFormValuesSelector,
    activeOfferTakeOfferOwner = offerTakes.activeOfferTakeOfferOwner,
    activeOfferTakeOfferData = offerTakes.activeOfferTakeOfferData
  } = {}) => async (dispatch, getState) =>
{
  const offerId = activeOfferTakeOfferId(getState());
  const volume = takeFormValuesSelector(getState(), 'volume');

  if (!canFulfillOffer(getState()) || !volume) {
    return null;
  }
  const offerOwner = activeOfferTakeOfferOwner(getState());

  return await dispatch(defer(
    getTransactionGasCostEstimate,
    {
      offerId,
      amount: web3.toWei(volume, ETH_UNIT_ETHER).toString(),
      offerOwner,
      activeOfferData: activeOfferTakeOfferData(getState()),
    })
  );
};

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
  resetCompletedOfferCheck,
};

const reducer = handleActions({
  [setOfferTakeModalOpen]: state => state.set('isOfferTakeModalOpen', true),
  [setOfferTakeModalClosed]: state => state.set('isOfferTakeModalOpen', false),
  [setActiveOfferTakeType]: (state, { payload }) => state.set('activeOfferTakeType', payload),
  [resetActiveOfferTakeType]: state => state.set('activeOfferTakeType', null),
  [setActiveOfferTakeOfferId]: (state, { payload }) => state.set('activeOfferTakeOfferId', payload),
  [resetActiveOfferTakeOfferId]: state => state.set('activeOfferTakeOfferId', null),
  [checkIfOfferTakeSubjectIsActive.pending]: state => state.set('checkingIfOfferActive', true),
  [checkIfOfferTakeSubjectIsActive.fulfilled]: (state, { payload }) => state
    .set('isOfferActive', payload)
    .set('checkingIfOfferActive', false)
  ,
  [pending(getTransactionGasCostEstimate)]:
    state => state.set('transactionGasCostEstimatePending', true),
  [fulfilled(getTransactionGasCostEstimate)]:
    (state, { payload }) =>
      state
        .set('transactionGasCostEstimate', payload.toString())
        .set('transactionGasCostEstimatePending', false),
  [rejected(getTransactionGasCostEstimate)]:
    state =>
      state
        .set('transactionGasCostEstimateError', true)
        .set('transactionGasCostEstimatePending', false),
  [resetActiveOfferTakeGasCostEstimate]:
    state => state
      .set('transactionGasCostEstimate', null)
      .set('transactionGasCostEstimateError', null)
      .set('transactionGasCostEstimatePending', null),

  [resetCompletedOfferCheck]:
    state => state
      .set('checkingIfOfferActive', null)
      .set('isOfferActive', null),

}, initialState);

export default {
  actions,
  reducer,
};