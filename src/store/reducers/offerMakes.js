import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { createPromiseActions } from '../../utils/createPromiseActions';
import tokens from '../selectors/tokens';
import offerMakes from '../selectors/offerMakes';
import { initialize } from 'redux-form/immutable';
import { DEFAULT_GAS_LIMIT, TX_OFFER_MAKE, TX_STATUS_CANCELLED_BY_USER } from './transactions';
import { change, formValueSelector } from 'redux-form/immutable';
import web3 from '../../bootstrap/web3';
import balances from '../selectors/balances';
import { fulfilled, pending, rejected } from '../../utils/store';
import transactionsReducer from './transactions';
import network from '../selectors/network';
import getOfferMakeBuyAndSellTokens from '../../utils/tokens/getOfferMakeBuyAndSellTokens';
import offerMakeToFormName from '../../utils/offers/offerMakeToFormName';
import transactions from '../selectors/transactions';
import generateTxSubjectId from '../../utils/transactions/generateTxSubjectId';

export const MAKE_BUY_OFFER = 'OFFER_MAKES/MAKE_BUY_OFFER';
export const MAKE_SELL_OFFER = 'OFFER_MAKES/MAKE_SELL_OFFER';

const currentOfferMakeInitialValue = fromJS(
  {
    offerData: null,
    buyToken: null,
    sellToken: null,
  },
);

const initialState = fromJS(
  {
    makeBuyOffer: {
      type: MAKE_BUY_OFFER,
      activeOfferMake: currentOfferMakeInitialValue,
      isOfferMakeModalOpen: false,
      activeOfferMakeOfferDraftId: null,
      transactionGasCostEstimate: null,
      txSubjectId: null,
      drafts: [],
    },
    makeSellOffer: {
      type: MAKE_SELL_OFFER,
      activeOfferMake: currentOfferMakeInitialValue,
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
const UPDATE_ACTIVE_OFFER_MAKE_DATA = 'OFFER_MAKES/UPDATE_ACTIVE_OFFER_MAKE_DATA';

const Init = createAction(
  INIT, () => null,
);

const buyMaxEpic = (offerMakeType) => (dispatch, getState) => {
  const formName = offerMakeToFormName(offerMakeType);
  const usersQuoteTokenBalanceBN = web3.toBigNumber(
    web3.fromWei(
      balances.activeQuoteTokenBalance(getState())
    ),
  );
  const { price } = offerMakes.currentFormValues(getState(), formName);
  const priceBN = web3.toBigNumber(price);

  dispatch(change(formName, 'total', usersQuoteTokenBalanceBN.toString()));
  dispatch(change(formName, 'volume', usersQuoteTokenBalanceBN.div(priceBN).toString()));

  dispatch(makeOfferFormUpdatedEpic(offerMakeType));
};

const sellMaxEpic = (offerMakeType) => (dispatch, getState) => {
  const formName = offerMakeToFormName(offerMakeType);

  const usersBaseTokenBalanceBN = web3.toBigNumber(
    web3.fromWei(
      balances.activeBaseTokenBalance(getState()),
    ),
  );
  const { price } = offerMakes.currentFormValues(getState(), formName);
  const priceBN = web3.toBigNumber(price.toString());
  dispatch(change(formName, 'total', usersBaseTokenBalanceBN.mul(priceBN).toString()));
  dispatch(change(formName, 'volume', usersBaseTokenBalanceBN.toString()));

  dispatch(makeOfferFormUpdatedEpic(offerMakeType));

};

const setActiveOfferMake = createAction('OFFER_MAKES/SET_CURRENT_OFFER_MAKE',
  (offerMakeType, offerMake) => ({ offerMake, offerMakeType }),
);
const setActiveOfferMakeEpic = (offerMakeType) => (dispatch, getState) => {
  const { baseToken, quoteToken } = tokens.activeTradingPair(getState());
  const { sellToken, buyToken } = getOfferMakeBuyAndSellTokens({ baseToken, quoteToken }, offerMakeType);
  dispatch(
    setActiveOfferMake(
      offerMakeType,
      currentOfferMakeInitialValue
        .set('offerData', fromJS({ payToken: null, buyToken: null }))
        .set('sellToken', sellToken)
        .set('buyToken', buyToken)
        .set('baseToken', baseToken)
        .set('quoteToken', quoteToken)
        .set('sellTokenAddress', network.getTokenAddress(getState(), sellToken))
        .set('buyTokenAddress', network.getTokenAddress(getState(), buyToken)),
    ),
  );
};



/**
 *  Create new offer transaction actions
 */


const setActiveOfferMakeTxSubjectId = createAction(
  'OFFER_MAKES/SET_ACTIVE_OFFER_MAKE_TX_SUBJECT_ID',
  (offerMakeType, txSubjectId) => ({ offerMakeType, txSubjectId })
);

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

const sendMakeOfferTransaction = createAction(
  'OFFER_MAKES/MAKE_OFFER',
  ({ payAmount, payToken, buyAmount, buyToken, gasLimit }) =>
    window.contracts.market.offer(payAmount, payToken, buyAmount, buyToken, 0, { gasLimit: gasLimit || DEFAULT_GAS_LIMIT }),
);

const makeOffer = createPromiseActions('OFFER_MAKES/MAKE_OFFER');

const makeOfferEpic = (offerMakeType) => async (dispatch, getState) => {

  dispatch(
    generateActiveOfferMakeTxSubjectIdEpic(offerMakeType)
  );
  dispatch(makeOffer.pending());

  const activeOfferMake = offerMakes.activeOfferMake(getState(), offerMakeToFormName(offerMakeType));
  const makeOfferPayload = {
    payAmount: activeOfferMake.getIn(['offerData','payAmount']),
    buyAmount: activeOfferMake.getIn(['offerData','buyAmount']),
    payToken: activeOfferMake.get('sellTokenAddress'),
    buyToken: activeOfferMake.get('buyTokenAddress'),
  };

  const txSubjectId = offerMakes.activeOfferMakeTxSubjectId(getState());

  try {
    const pendingMakeOfferAction = dispatch(
      sendMakeOfferTransaction(makeOfferPayload),
    );

    const transactionHash = (await pendingMakeOfferAction).value;
    dispatch(
      transactionsReducer.actions.addTransactionEpic({
        txType: TX_OFFER_MAKE,
        txMeta: { offerMakeType },
        txHash: transactionHash,
        txSubjectId
      }),
    );
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

const resetActiveOfferMakeData = createAction('OFFER_MAKES/RESET_CURRENT_OFFER_MAKE_DATA', offerMakeType => ({ offerMakeType }));


const initializeOfferMakeFormEpic = (offerMakeType) => dispatch => {
  const formName = offerMakeToFormName(offerMakeType);
  dispatch(
    initialize(formName, {
      price: null,
      volume: null,
      total: null
    }),
  );
  dispatch(setActiveOfferMakeEpic(offerMakeType));

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
  console.log('setOfferMakeModalClosedEpic', offerMakeType);
  dispatch(setOfferMakeModalClosed(offerMakeType));
  dispatch(resetActiveOfferMakeType());
  dispatch(resetActiveOfferMakeTxSubjectId(offerMakeType));
  dispatch(resetActiveOfferMakeData(offerMakeType));
  dispatch(resetActiveOfferMakeGasCostEstimate(offerMakeType));
};



/***
 * Form fields changed actions
 */

const priceFieldChangedEpic = (offerMakeType, value) => (dispatch, getState) => {
  const formName = offerMakeToFormName(offerMakeType);
  const volume = formValueSelector(formName)(getState(), 'volume');
  if ((isNaN(value) || parseFloat(value) === 0) || (isNaN(volume) || parseFloat(volume) === 0)) {
    dispatch(change(formName, 'total', '0'));
  } else {
    dispatch(change(formName, 'total', web3.toBigNumber(volume).mul(value).toString()));
  }

  dispatch(makeOfferFormUpdatedEpic(offerMakeType));

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

  dispatch(makeOfferFormUpdatedEpic(offerMakeType));

};

const totalFieldValueChangedEpic = (offerMakeType, value) => (dispatch, getState) => {
  const formName = offerMakeToFormName(offerMakeType);
  const price = formValueSelector(formName)(getState(), 'price');
  if ((!isNaN(value) && parseFloat(value) !== 0) && (!isNaN(price) && parseFloat(price) !== 0)) {
    dispatch(change(formName, 'volume', web3.toBigNumber(value).div(price).toString()));
    dispatch(makeOfferFormUpdatedEpic(offerMakeType));
  }
};


/**
 *
 * When any of the offer make fields changes dispatch action
 *
 */

const updateActiveOfferMakeData = createAction(
  UPDATE_ACTIVE_OFFER_MAKE_DATA, ({ offerMakeType, offerMakeData }) => ({ offerMakeType, offerMakeData })
);
const updateActiveOfferMakeDataEpic = (offerMakeType, offerMakeData) => dispatch => {
  dispatch(
    updateActiveOfferMakeData({
      offerMakeType,
      offerMakeData: fromJS(offerMakeData)
    }),
  );
};

const makeOfferFormUpdatedEpic = (offerMakeType) => (dispatch, getState) => {

  let payAmount = null, buyAmount = null;
  const {total, volume } = offerMakes.currentFormValues(getState(), offerMakeToFormName(offerMakeType));
  switch (offerMakeType) {
    case MAKE_BUY_OFFER: {
      payAmount = web3.toBigNumber(web3.toWei(total)).ceil().toString();
      buyAmount = web3.toBigNumber(web3.toWei(volume)).ceil().toString();
    }
      break;

    case MAKE_SELL_OFFER: {
      payAmount = web3.toBigNumber(web3.toWei(volume)).ceil().toString();
      buyAmount = web3.toBigNumber(web3.toWei(total)).ceil().toString();
    }
      break;
  }

  dispatch(
    updateActiveOfferMakeDataEpic(offerMakeType, { payAmount, buyAmount })
  );
};

/**
 *  New offer make gas estimate
 */

const resetActiveOfferMakeGasCostEstimate = createAction(
  'OFFER_MAKES/RESET_TRANSACTION_GAS_ESTIMATE',
);

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

const getTransactionGasCostEstimateEpic = (offerMakeType) => async (dispatch, getState) => {
  if (!offerMakes.canMakeOffer(getState(), offerMakeType)) {
    return null;
  } else {
    const offerMake = offerMakes.activeOfferMake(getState(), offerMakeToFormName(offerMakeType));

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
  [setActiveOfferMake]: (state, { payload: { offerMake, offerMakeType } }) =>
    state.setIn([offerMakeToFormName(offerMakeType), 'activeOfferMake'], offerMake),
  [resetActiveOfferMakeData]: (state, { payload: { offerMakeType } }) =>
    state.setIn(
      [offerMakeToFormName(offerMakeType), 'activeOfferMake', 'offerData'], fromJS({ payToken: null, buyToken: null })
    ),
  [setActiveOfferMakeType]: (state, { payload }) => state.set('activeOfferMakeType', payload),
  [resetActiveOfferMakeType]: state => state.set('activeOfferMakeType', null),
  // [setActiveOfferMakeOfferId]: (state, { payload }) => state.set('activeOfferMakeOfferDraftId', payload),
  [updateActiveOfferMakeData]: (state, { payload: {offerMakeType, offerMakeData} }) =>
    state.setIn([offerMakeToFormName(offerMakeType), 'activeOfferMake', 'offerData'], offerMakeData),
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
