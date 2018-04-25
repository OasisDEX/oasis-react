import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { createPromiseActions } from '../../utils/createPromiseActions';
import offers from '../selectors/offers';
import getOfferTakeBuyAndSellTokens from '../../utils/tokens/getOfferTakeBuyAndSellTokens';
import tokens from '../selectors/tokens';
import offerTakes from '../selectors/offerTakes';
import offersReducer from './offers';
import { initialize } from 'redux-form';
import { DEFAULT_GAS_LIMIT, TX_OFFER_TAKE, TX_STATUS_CANCELLED_BY_USER } from './transactions';
import * as form from 'redux-form/immutable';
import web3 from '../../bootstrap/web3';
import { ETH_UNIT_ETHER } from '../../constants';
import balances from '../selectors/balances';
import { fulfilled, pending, rejected } from '../../utils/store';
import transactions from './transactions';
import network from '../selectors/network';

export const TAKE_BUY_OFFER = 'OFFER_TAKES/TAKE_BUY_OFFER';
export const TAKE_SELL_OFFER = 'OFFER_TAKES/TAKE_SELL_OFFER';

const currentOfferTakeInitialValue = fromJS(
  {
    offerData: null,
    buyToken: null,
    sellToken: null,
    baseToken: null,
    quoteToken: null,
  },
);

const initialState = fromJS({
  activeOfferTake: null,
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

const buyMaxEpic = () => (dispatch, getState) => {
  const usersQuoteTokenBalanceBN = web3.toBigNumber(balances.activeQuoteTokenBalance(getState()));
  const activeOfferTakeData = offerTakes.activeOfferTakeOfferData(getState());
  const volume = activeOfferTakeData.get('buyHowMuch');
  const priceBN = web3.toBigNumber(activeOfferTakeData.get('ask_price'));
  if (usersQuoteTokenBalanceBN.gte(priceBN.mul(volume))) {
    dispatch(form.change('takeOffer', 'total', web3.fromWei(priceBN.mul(volume), ETH_UNIT_ETHER)));
    dispatch(form.change('takeOffer', 'volume', web3.fromWei(volume, ETH_UNIT_ETHER)));
  } else {
    dispatch(form.change('takeOffer', 'total', web3.fromWei(usersQuoteTokenBalanceBN, ETH_UNIT_ETHER)));
    dispatch(form.change('takeOffer', 'volume', web3.fromWei(usersQuoteTokenBalanceBN.div(priceBN), ETH_UNIT_ETHER)));
  }
};

const sellMaxEpic = () => (dispatch, getState) => {
  const usersBaseTokenBalanceBN = web3.toBigNumber(balances.activeBaseTokenBalance(getState()));
  const activeOfferTakeData = offerTakes.activeOfferTakeOfferData(getState());
  const volume = activeOfferTakeData.get('buyHowMuch');
  const priceBN = web3.toBigNumber(activeOfferTakeData.get('bid_price'));
  if (usersBaseTokenBalanceBN.gte(volume)) {
    dispatch(form.change('takeOffer', 'total', web3.fromWei(priceBN.mul(volume), ETH_UNIT_ETHER)));
    dispatch(form.change('takeOffer', 'volume', web3.fromWei(volume, ETH_UNIT_ETHER)));
  } else {
    dispatch(form.change('takeOffer', 'total', web3.fromWei(usersBaseTokenBalanceBN.mul(priceBN), ETH_UNIT_ETHER)));
    dispatch(form.change('takeOffer', 'volume', web3.fromWei(usersBaseTokenBalanceBN, ETH_UNIT_ETHER)));
  }

};

const resetActiveOfferTake = createAction('OFFER_TAKES/RESET_CURRENT_OFFER_TAKE');
const setActiveOfferTake = createAction('OFFER_TAKES/SET_CURRENT_OFFER_TAKE', offerTake => offerTake);
const setActiveOfferTakeEpic = () => (dispatch, getState) => {
  const offerTakeType = offerTakes.activeOfferTakeType(getState());
  const offerId = offerTakes.activeOfferTakeOfferId(getState());
  const { baseToken, quoteToken } = tokens.activeTradingPair(getState());
  let offer = null;
  switch (offerTakeType) {
    case TAKE_BUY_OFFER: {
      offer = offers.activeTradingPairBuyOffers(getState()).find(offer => offer.id === offerId);
    }
      break;
    case TAKE_SELL_OFFER: {
      offer = offers.activeTradingPairSellOffers(getState()).find(offer => offer.id === offerId);
    }
      break;

  }
  if (offer) {
    const { sellToken, buyToken } = getOfferTakeBuyAndSellTokens(tokens.activeTradingPair(getState()), offerTakeType);
    dispatch(
      setActiveOfferTake(
        currentOfferTakeInitialValue
          .set('offerData', fromJS(offer))
          .set('sellToken', sellToken)
          .set('buyToken', buyToken)
          .set('baseToken', baseToken)
          .set('quoteToken', quoteToken),
      ),
    );
  }
};

const resetCompletedOfferCheck = createAction('OFFER_TAKES/RESET_COMPLETED_OFFER_CHECK');

const sendBuyTransaction = createAction(
  'OFFER_TAKES/MARKET_BUY',
  (offerId, amount, gasLimit) =>
    window.contracts.market.buy(offerId, amount, { gasLimit: gasLimit || DEFAULT_GAS_LIMIT }),
);

const takeOffer = createPromiseActions('OFFER_TAKES/TAKE_OFFER');

const takeOfferEpic = () => async (dispatch, getState) => {
  const volume = form.formValueSelector('takeOffer')(getState(), 'volume');
  const volumeInWei = web3.toWei(volume, ETH_UNIT_ETHER);
  const activeOfferTakeOfferId = offerTakes.activeOfferTakeOfferId(getState());
  dispatch(takeOffer.pending());
  try {
    const pendingBuyAction = dispatch(
      sendBuyTransaction(activeOfferTakeOfferId, volumeInWei),
    );

    const transactionHash = (await pendingBuyAction).value;
    dispatch(
      transactions.actions.addTransactionEpic({
        txType: TX_OFFER_TAKE,
        txHash: transactionHash,
        txSubjectId: activeOfferTakeOfferId,
      }),
    );
  } catch (e) {
    dispatch(
      transactions.actions.addTransactionEpic({
        txType: TX_OFFER_TAKE,
        txSubjectId: activeOfferTakeOfferId,
      }),
    );
    dispatch(takeOffer.rejected());
    dispatch(
      transactions.actions.transactionCancelledByUser({
        txType: TX_OFFER_TAKE,
        txStatus: TX_STATUS_CANCELLED_BY_USER,
        txSubjectId: activeOfferTakeOfferId,
        txStats: {
          txEndBlockNumber: network.latestBlockNumber(getState()),
          txEndTimestamp: parseInt(Date.now() / 1000),
        },
      }),
    );

    setTimeout(() => {
      dispatch(setOfferTakeModalClosedEpic());
    }, 5000);
  }
};

const setActiveOfferTakeType = createAction('OFFER_TAKES/SET_ACTIVE_OFFER_TAKE_TYPE', takeType => takeType);
const resetActiveOfferTakeType = createAction('OFFER_TAKES/RESET_ACTIVE_OFFER_TAKE_TYPE');

const setOfferTakeModalOpen = createAction('OFFER_TAKES/SET_MODAL_OPEN');
const setOfferTakeModalOpenEpic = ({ offerId, offerTakeType }) => (dispatch) => {
  dispatch(setActiveOfferTakeOfferId(offerId));
  dispatch(setActiveOfferTakeType(offerTakeType));
  dispatch(setActiveOfferTakeEpic());
  dispatch(initializeOfferTakeFormEpic());
  dispatch(setOfferTakeModalOpen());
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

const setOfferTakeModalClosed = createAction('OFFER_TAKES/SET_MODAL_CLOSED');

const setOfferTakeModalClosedEpic = () => (dispatch) => {
  dispatch(setOfferTakeModalClosed());
  dispatch(resetActiveOfferTakeType());
  dispatch(resetActiveOfferTakeOfferId());
  dispatch(resetActiveOfferTake());
  dispatch(resetActiveOfferTakeGasCostEstimate());
  dispatch(resetCompletedOfferCheck());
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

  if (!isNaN(value)) {
    dispatch(form.change('takeOffer', 'total', '0'));
  } else {
    dispatch(form.change('takeOffer', 'total', web3.toBigNumber(value).mul(price).toString()));
  }

  // if (parseFloat(value) === 0) {
  //   dispatch(form.change('takeOffer', 'total', '0'));
  // } else {
  //   dispatch(form.change('takeOffer', 'total', web3.toBigNumber(value).mul(price).toString()));
  // }
};

const totalFieldValueChangedEpic = (value, {formValueSelector = form.formValueSelector} = {}) => (dispatch, getState) => {
  const { price } = formValueSelector('takeOffer')(getState(), 'volume', 'total', 'price');

  dispatch(form.change('takeOffer', 'volume', web3.toBigNumber(value).div(price).toString()));

  if (!isNaN(value)) {
    dispatch(form.change('takeOffer', 'volume', '0'));
  } else {
    dispatch(form.change('takeOffer', 'volume', web3.toBigNumber(value).div(price).toString()));
  }

  // if (parseFloat(value) === 0) {
  //   //TODO: looks like noop?
  //   dispatch(form.change('takeOffer', 'total', '0'));
  // } else {
  //   dispatch(form.change('takeOffer', 'volume', web3.toBigNumber(value).div(price).toString()));
  // }
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

const getTransactionGasCostEstimateEpic = () => async (dispatch, getState) => {
  const offerId = offerTakes.activeOfferTakeOfferId(getState());
  const volume = offerTakes.takeFormValuesSelector(getState(), 'volume');
  if (!offerTakes.canBuyOffer(getState()) || !volume) {
    return null;
  }
  const offerOwner = offerTakes.activeOfferTakeOfferOwner(getState());
  const gasCost = await dispatch(
    getTransactionGasCostEstimate(
      {
        offerId,
        amount: web3.toWei(volume, ETH_UNIT_ETHER).toString(),
        offerOwner,
        activeOfferData: offerTakes.activeOfferTakeOfferData(getState()),
      },
    ),
  ).catch(e => {
    console.log('[offer takes] estimate error', e);
  });
  return gasCost;
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
  [setActiveOfferTake]: (state, { payload }) => state.set('activeOfferTake', payload),
  [resetActiveOfferTake]: (state) => state.set('activeOfferTake', currentOfferTakeInitialValue),
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
