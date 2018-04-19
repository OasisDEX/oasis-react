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
import generateTxSubjectId from '../../utils/transactions/generateTxSubjectId';

export const MAKE_BUY_OFFER = 'OFFER_MAKES/MAKE_BUY_OFFER';
export const MAKE_SELL_OFFER = 'OFFER_MAKES/MAKE_SELL_OFFER';

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

const INIT = 'OFFER_MAKES/INIT';

const Init = createAction(
  INIT, () => null,
);


//TODO: buxMax sets only total amount, volume should be calculated elsewhere
const buyMaxEpic = (offerMakeType) => (dispatch, getState) => {
    const formName = offerMakeToFormName(offerMakeType);
    const usersQuoteTokenBalanceBN = web3.toBigNumber(
        web3.fromWei(
            balances.activeQuoteTokenBalance(getState())
        ),
    );

    const total = usersQuoteTokenBalanceBN.toString();

    dispatch(change(formName, 'total', total));
    dispatch(totalFieldValueChangedEpic(offerMakeType, total));

};

//TODO: sellMax sets only total amount, volume should be calculated elsewhere
const sellMaxEpic = (offerMakeType) => (dispatch, getState) => {
    const formName = offerMakeToFormName(offerMakeType);

    const usersBaseTokenBalanceBN = web3.toBigNumber(
        web3.fromWei(
            balances.activeBaseTokenBalance(getState()),
        ),
    );
    const { price } = offerMakes.currentFormValues(getState(), formName);
    const priceBN = web3.toBigNumber(price.toString());

    const total = usersBaseTokenBalanceBN.mul(priceBN).toString();

    dispatch(change(formName, 'total', total));
    dispatch(totalFieldValueChangedEpic(offerMakeType, total));

};

/**
 *  Create new offer transaction actions
 */
const setActiveOfferMakeTxSubjectId = createAction(
  'OFFER_MAKES/SET_ACTIVE_OFFER_MAKE_TX_SUBJECT_ID',
  (offerMakeType, txSubjectId) => ({ offerMakeType, txSubjectId })
);

//TODO: already refactored?
const generateActiveOfferMakeTxSubjectIdEpic = () => (dispatch, getState) => {
  const offerMakeType = offerMakes.activeOfferMakeType(getState());
  const newTxSubjectId = generateTxSubjectId();
  dispatch(
    setActiveOfferMakeTxSubjectId(offerMakeType, newTxSubjectId)
  );
};

const resetActiveOfferMakeTxSubjectId = createAction(
  'OFFER_MAKES/RESET_ACTIVE_OFFER_MAKE_TX_SUBJECT_ID', (offerMakeType) => offerMakeType
);

//TODO: window? why not direct call?
const makeOfferTransaction = createAction(
  'OFFER_MAKES/MAKE_OFFER_TRANSACTION',
  ({ payAmount, payToken, buyAmount, buyToken, gasLimit }) =>
    window.contracts.market.offer(payAmount, payToken, buyAmount, buyToken, 0, { gasLimit: gasLimit || DEFAULT_GAS_LIMIT }),
);

const makeOffer = createPromiseActions('OFFER_MAKES/MAKE_OFFER');


//TODO: To many duties at once. Offer form and offer making logic needlessly coupled here...
const makeOfferEpic = (offerMakeType) => async (dispatch, getState) => {


  //TODO: Already refactored?
  dispatch(
    generateActiveOfferMakeTxSubjectIdEpic(offerMakeType)
  );
  dispatch(makeOffer.pending());

  const activeOfferMake = offerMakes.activeOfferMakePure(getState(), offerMakeToFormName(offerMakeType));
  const makeOfferPayload = {
    payAmount: activeOfferMake.getIn(['offerData','payAmount']),
    buyAmount: activeOfferMake.getIn(['offerData','buyAmount']),
    payToken: activeOfferMake.get('sellTokenAddress'),
    buyToken: activeOfferMake.get('buyTokenAddress'),
  };

  const txSubjectId = offerMakes.activeOfferMakeTxSubjectId(getState());

  try {

    //TODO: why indirection?
    //TODO: Not sure about error handling?
    const pendingMakeOfferAction = dispatch(
      makeOfferTransaction(makeOfferPayload),
    );

    pendingMakeOfferAction.then((e, transactionHash) => {
      dispatch(
        transactionsReducer.actions.addTransactionEpic({
          txType: TX_OFFER_MAKE,
          txMeta: { offerMakeType },
          txHash: transactionHash,
          txSubjectId
        }),
      );
    });

  } catch (e) {
    dispatch(
      transactionsReducer.actions.addTransactionEpic({
        txType: TX_OFFER_MAKE,
        txMeta: { offerMakeType },
        txSubjectId
      }),
    );
    dispatch(makeOffer.rejected());
    dispatch(
      transactionsReducer.actions.transactionCancelledByUser({
        txType: TX_OFFER_MAKE,
        txMeta: { offerMakeType },
        txStatus: TX_STATUS_CANCELLED_BY_USER,
        txSubjectId,
        txStats: {
          txEndBlockNumber: network.latestBlockNumber(getState()),
          txEndTimestamp: parseInt(Date.now() / 1000),
        },
      }),
    );

    setTimeout(() => {
      dispatch(setOfferMakeModalClosedEpic(offerMakeType));
    }, 5000);
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
  offerMakeType => ({ formName: offerMakeToFormName(offerMakeType) }),
);

const setOfferMakeModalOpenEpic = (offerMakeType) => (dispatch) => {
  dispatch(setActiveOfferMakeType(offerMakeType));
  dispatch(setOfferMakeModalOpen(offerMakeType));
};

const setOfferMakeModalClosed = createAction(
  'OFFER_MAKES/SET_MODAL_CLOSED',
  offerMakeType => ({ formName: offerMakeToFormName(offerMakeType) }),
);

const setOfferMakeModalClosedEpic = (offerMakeType) => (dispatch) => {
  dispatch(setOfferMakeModalClosed(offerMakeType));
  dispatch(resetActiveOfferMakeType());
  dispatch(resetActiveOfferMakeTxSubjectId(offerMakeType));
  dispatch(resetActiveOfferMakeGasCostEstimate(offerMakeType));
};


/***
 * Form fields changed actions
 */

const priceFieldChangedEpic = (offerMakeType, value) => (dispatch, getState) => {
  const formName = offerMakeToFormName(offerMakeType);
  const volume = formValueSelector(formName)(getState(), 'volume');
  if ( !value ||(isNaN(value) || parseFloat(value) === 0) || (isNaN(volume) || parseFloat(volume) === 0)) {
    dispatch(change(formName, 'total', null));
  } else {
    dispatch(change(formName, 'total', web3.toBigNumber(volume).mul(value).toString()));
  }
};

const volumeFieldValueChangedEpic = (offerMakeType, value) => (dispatch, getState) => {
  const formName = offerMakeToFormName(offerMakeType);
  const price = formValueSelector(formName)(getState(), 'price');
  if ((isNaN(value) || parseFloat(value) === 0) || (isNaN(price) || parseFloat(price) === 0)) {
    dispatch(change(formName, 'total', '0'));
  } else {
    dispatch(change(formName, 'volume', value));
    dispatch(change(formName, 'total', web3.toBigNumber(value).mul(price).toString()));
  }
};

const totalFieldValueChangedEpic = (offerMakeType, value) => (dispatch, getState) => {
  const formName = offerMakeToFormName(offerMakeType);
  const price = formValueSelector(formName)(getState(), 'price');
  if ((!isNaN(value) && parseFloat(value) !== 0) && (!isNaN(price) && parseFloat(price) !== 0)) {
    dispatch(change(formName, 'volume', web3.toBigNumber(value).div(price).toString()));
  }
};

/**
 *  New offer make gas estimate
 */

const resetActiveOfferMakeGasCostEstimate = createAction(
  'OFFER_MAKES/RESET_TRANSACTION_GAS_ESTIMATE',
);

//TODO: why noProxy? Why 2 actions and epic instead of ?
const getTransactionGasCostEstimate = createAction(
  'OFFER_MAKES/GET_TRANSACTION_GAS_ESTIMATE',
  ({ payAmount, payToken, buyAmount, buyToken }) => new Promise((resolve, reject) => {
    const toAddress = window.contracts.market.address;
    window.contracts.marketNoProxy.offer.estimateGas(
      payAmount, payToken, buyAmount, buyToken, 0, { to: toAddress, gasLimit: DEFAULT_GAS_LIMIT },
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
  }),
);

//TODO: why is it made available outside the store?
const getTransactionGasCostEstimateEpic = (offerMakeType) => async (dispatch, getState) => {
  if (!offerMakes.canMakeOffer(getState(), offerMakeType)) {
    return null;
  } else {
    const offerMake = offerMakes.activeOfferMakePure(getState(), offerMakeToFormName(offerMakeType));

    const
      payAmount = offerMake.getIn(['offerData','payAmount']),
      payToken =  offerMake.get('sellTokenAddress'),
      buyAmount = offerMake.getIn(['offerData','buyAmount']),
      buyToken =  offerMake.get('buyTokenAddress');

    return await dispatch(
      getTransactionGasCostEstimate({ payAmount, payToken, buyAmount, buyToken }),
    ).catch(
      () => { console.log('[offer makes] estimate error'); });
  }
};

const actions = {
  Init,
  makeOffer,
  makeOfferEpic,
  setOfferMakeModalClosedEpic,
  setOfferMakeModalOpenEpic,
  priceFieldChangedEpic,
  volumeFieldValueChangedEpic,
  totalFieldValueChangedEpic,
  buyMaxEpic,
  sellMaxEpic,
  getTransactionGasCostEstimateEpic,
  initializeOfferMakeFormEpic,
};

const reducer = handleActions({
  [setOfferMakeModalOpen]: (state, { payload: { formName } }) => state.setIn([formName, 'isOfferMakeModalOpen'], true),
  [setOfferMakeModalClosed]: (state, { payload: { formName } }) => state.setIn([formName, 'isOfferMakeModalOpen'], false),
  [setActiveOfferMakeType]: (state, { payload }) => state.set('activeOfferMakeType', payload),
  [resetActiveOfferMakeType]: state => state.set('activeOfferMakeType', null),
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
  [resetActiveOfferMakeGasCostEstimate]:
    state => state
      .set('transactionGasCostEstimate', null)
      .set('transactionGasCostEstimateError', null)
      .set('transactionGasCostEstimatePending', null),
  [setActiveOfferMakeTxSubjectId]:
    (state, { payload : { offerMakeType, txSubjectId } }) =>
      state.setIn([offerMakeToFormName(offerMakeType), 'txSubjectId'], txSubjectId),
  [resetActiveOfferMakeTxSubjectId]:
    (state, { payload }) => state.setIn([offerMakeToFormName(payload), 'txSubjectId'], null)
}, initialState);

export default {
  actions,
  reducer,
};