import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { createPromiseActions } from '../../utils/createPromiseActions';
import offers from '../selectors/offers';
import getBuyAndSellTokens from '../../utils/tokens/getBuyAndSellTokens';
import tokens from '../selectors/tokens';
import offerTakes from '../selectors/offerTakes';
import offersReducer from './offers';
import { initialize } from 'redux-form';
import { DEFAULT_GAS_LIMIT } from './transactions';
import { change, formValueSelector } from 'redux-form/immutable';
import web3 from '../../bootstrap/web3';
import { ETH_UNIT_ETHER } from '../../constants';
import balances from '../selectors/balances';


export const TAKE_BUY_OFFER = 'OFFER_TAKES/TAKE_BUY_OFFER';
export const TAKE_SELL_OFFER = 'OFFER_TAKES/TAKE_SELL_OFFER';


const currentOfferTakeInitialValue =  fromJS(
  {
    offerData: null,
    checkingIfOfferActive: null,
    isOfferActive: null,
    buyToken: null,
    sellToken: null,
    baseToken: null,
    quoteToken: null
  },
);

const initialState = fromJS({
  activeOfferTake: null,
  activeOfferTakeType: null,
  isOfferTakeModalOpen: false,
  activeOfferTakeOfferId: null,
  minOrderLimitInWei: '100000000000000000'
});

const INIT = 'OFFER_TAKES/INIT';

const Init = createAction(
  INIT, () => null,
);


const buyMaxEpic = () => (dispatch, getState) => {
  const baseTokenBalanceBN = new web3.toBigNumber(balances.activeBaseTokenBalance(getState()));
  dispatch(
    change('takeOffer', 'total')
  )
};


const sellMaxEpic = () => (dispatch, getState) => {
  const baseTokenBalanceBN = new web3.toBigNumber(balances.activeBaseTokenBalance(getState()));
  dispatch(
    change('takeOffer', 'total')
  )
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
    }break;
    case TAKE_SELL_OFFER: {
      offer = offers.activeTradingPairSellOffers(getState()).find(offer => offer.id === offerId)
    }break;

  }
  if(offer) {
    const { sellToken, buyToken } = getBuyAndSellTokens( tokens.activeTradingPair(getState()), offerTakeType);
    dispatch(
      setActiveOfferTake(
        currentOfferTakeInitialValue
          .set('offerData', fromJS(offer))
          .set('sellToken', sellToken)
          .set('buyToken', buyToken)
          .set('baseToken', baseToken)
          .set('quoteToken', quoteToken)
      )
    )
  }
};


const sendBuyTransaction = createAction(
  'OFFER_TAKES/MARKET_BUY',
  (offerId, amount, gasLimit) =>
    window.contracts.market.buy(offerId, amount, { gas: gasLimit || DEFAULT_GAS_LIMIT })
);

const takeOffer = createPromiseActions('OFFER_TAKES/TAKE_OFFER');

const takeOfferEpic = () => async (dispatch, getState) => {
  const { total } = formValueSelector('takeOffer')(getState(), 'total');
  const totalInWei = web3.toWei(total, ETH_UNIT_ETHER);
  const activeOfferTakeOfferId = offerTakes.activeOfferTakeOfferId(getState());
  dispatch(takeOffer.pending());
  dispatch(sendBuyTransaction(activeOfferTakeOfferId, totalInWei));
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
    default: throw new Error('No offer take type provided!')
  }
  dispatch(
    initialize('takeOffer', {
      price,
      volume: web3.fromWei(volume, ETH_UNIT_ETHER, { precision: activeTradingPairPrecision }).toString(),
      total: web3.fromWei(total, ETH_UNIT_ETHER, { precision: activeTradingPairPrecision }).toString()
    })
  );
  dispatch(initializeOfferTakeForm());
};

const setOfferTakeModalClosed = createAction('OFFER_TAKES/SET_MODAL_CLOSED');

const setOfferTakeModalClosedEpic = () => (dispatch) => {
  dispatch(setOfferTakeModalClosed());
  dispatch(resetActiveOfferTakeType());
  dispatch(resetActiveOfferTakeOfferId());
  dispatch(resetActiveOfferTake())
};
const setActiveOfferTakeOfferId = createAction('OFFER_TAKES/SET_ACTIVE_OFFER_TAKE_OFFER_ID');
const resetActiveOfferTakeOfferId = createAction('OFFER_TAKES/RESET_ACTIVE_OFFER_TAKE_OFFER_ID');



const setMaxTakeAmount = createAction('OFFER_TAKES/SET_MAX_TAKE_AMOUNT');
const setMaxTakeAmountEpic = () => (dispatch) => {};

const checkIfOfferTakeSubjectIsActive = createPromiseActions('OFFER_TAKES/CHECK_IF_OFFER_TAKE_SUBJECT_IS_ACTIVE');
const checkIfOfferTakeSubjectStillActiveEpic = () => async (dispatch, getState) => {
  const activeOfferTakeOfferId = offerTakes.activeOfferTakeOfferId(getState());
  dispatch(checkIfOfferTakeSubjectIsActive.pending());
  const isActive = (await dispatch(offersReducer.actions.checkOfferIsActive(activeOfferTakeOfferId))).value;
  dispatch(
    checkIfOfferTakeSubjectIsActive.fulfilled(isActive)
  );
};


const volumeFieldValueChangedEpic = (value) => (dispatch, getState) => {
  const { price } = formValueSelector('takeOffer')(getState(), 'volume', 'total', 'price');
  dispatch(change('takeOffer', 'total', web3.toBigNumber(value).mul(price).toString() ));

};

const totalFieldValueChangedEpic =  (value) => (dispatch, getState) => {
  const { price } = formValueSelector('takeOffer')(getState(), 'volume', 'total', 'price');
  dispatch(change('takeOffer', 'volume', web3.toBigNumber(value).div(price).toString() ));
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
  setMaxTakeAmountEpic,
  checkIfOfferTakeSubjectStillActiveEpic,
  volumeFieldValueChangedEpic,
  totalFieldValueChangedEpic
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
  [checkIfOfferTakeSubjectIsActive.pending]: state => state.setIn(['activeOfferTake', 'checkingIfOfferActive'], true),
  [checkIfOfferTakeSubjectIsActive.fulfilled]:
    (state, { payload }) =>
      state
        .setIn(['activeOfferTake', 'isOfferActive'], payload)
        .setIn(['activeOfferTake', 'checkingIfOfferActive'], true)
  ,

}, initialState);

export default {
  actions,
  reducer,
};
