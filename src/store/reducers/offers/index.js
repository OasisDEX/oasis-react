/* eslint-disable no-unused-vars */
import { createAction, handleActions } from 'redux-actions';
import { fromJS, List, Map } from 'immutable';

import { fulfilled, pending } from '../../../utils/store';
import tokens from '../../selectors/tokens';
import network from '../../selectors/network';
import offers from '../../selectors/offers';
import { SYNC_STATUS_COMPLETED, SYNC_STATUS_ERROR, SYNC_STATUS_PENDING, SYNC_STATUS_PRISTINE } from '../../../constants';

import {
  setOfferEpic,
  reducer as setOfferEpicReducer,
} from './setOfferEpic';
import {
  loadBuyOffersEpic,
  loadSellOffersEpic,
  reducer as loadOffersReducer,
} from './loadOffers';
import {
  reducer as getTradingPairOfferCountReducer,
} from './getTradingPairOffersCount';
import {
  cancelOfferEpic,
  syncOffersEpic,
  reducer as syncOffersEpicReducer,
} from './syncOffersEpic';
import {
  syncOffer,
  reducer as syncOfferEpicReducer,
} from './syncOfferEpic';
import {
  removeOrderCancelledByTheOwner,
  subscribeCancelledOrdersEpic,
  reducer as subscribeCancelledOffersEpicReducer,
} from './subscribeCancelledOffersEpic';
import {
  getBestOfferIdsForActiveTradingPairEpic,
  reducer as getBestOfferIdsForActiveTradingPairEpicReducer,
} from './getBestOfferIdsForActiveTradingPairEpic';
import {
  checkOfferIsActive,
  markOfferAsInactive,
  subscribeFilledOffersEpic,
  reducer as subscribeFilledOffersEpicReducer,
} from './subscribeFilledOffersEpic';
import {
  subscribeNewOffersFilledInEpic,
} from './subscribeNewOffersFilledInEpic';

export const TYPE_BUY_OFFER = 'OFFERS/TYPE_BUY';
export const TYPE_SELL_OFFER = 'OFFERS/TYPE_SELL';

const initialState = fromJS({
  offers: {},
  syncingOffers: [],
  pendingOffers: [],
  initialSyncStatus: {},
  loadingSellOffers: {},
  loadingBuyOffers: {},
  offersInitialized: false,
  activeTradingPairBestOfferId : {}
});


export const BUY_GAS = 1000000;
export const CANCEL_GAS = 1000000;

export const OFFER_SYNC_TYPE_INITIAL = 'OFFERS/OFFER_SYNC_TYPE_INITIAL';
export const OFFER_SYNC_TYPE_UPDATE = 'OFFERS/OFFER_SYNC_TYPE_UPDATE';
export const OFFER_SYNC_TYPE_NEW_OFFER = 'OFFERS/OFFER_SYNC_NEW_OFFER';
export const OFFER_STATUS_INACTIVE = 'OFFERS/OFFER_STATUS_INACTIVE';


const subscribeOffersEventsEpic = () => async (dispatch, getState) => {
  const latestBlockNumber = network.latestBlockNumber(getState());
  dispatch(
    subscribeNewOffersFilledInEpic(latestBlockNumber),
  );
  dispatch(
    subscribeFilledOffersEpic(latestBlockNumber),
  );
  dispatch(
    subscribeCancelledOrdersEpic(latestBlockNumber),
  );

};

const initOffers = createAction('OFFERS/INIT_OFFERS', initialOffersState => initialOffersState);
const initOffersEpic = () => (dispatch, getState) => {
  let initialOffersData = Map({});
  const initialTradingPairData = fromJS({
    buyOfferCount: null,
    sellOfferCount: null,
    buyOffers: List(),
    sellOffers: List(),
    initialSyncStatus: SYNC_STATUS_PRISTINE,
  });
  tokens.tradingPairs(getState())
    .forEach(tp =>
      initialOffersData = initialOffersData
        .set(
          Map({ baseToken: tp.get('base'), quoteToken: tp.get('quote') }),
          initialTradingPairData,
        ),
    );
  dispatch(initOffers(initialOffersData));
};

const actions = {
  initOffersEpic,
  cancelOfferEpic,
  syncOffersEpic,
  subscribeOffersEventsEpic,
  checkOfferIsActive,
  getBestOfferIdsForActiveTradingPairEpic,
  markOfferAsInactive,
  removeOrderCancelledByTheOwner,
};

const testActions = {
  syncOffer,
  setOfferEpic,
  loadBuyOffersEpic,
  loadSellOffersEpic,
  subscribeNewOffersFilledInEpic,
  subscribeCancelledOrdersEpic,
  subscribeFilledOffersEpic,
};

const offersReducer = {
  [initOffers]: (state, { payload }) => {
    return state.updateIn(['offers'], () => payload).set('offersInitialized', () => true);
  },
};

const reducer = handleActions(Object.assign({},
  offersReducer,
  setOfferEpicReducer,
  loadOffersReducer,
  getTradingPairOfferCountReducer,
  syncOffersEpicReducer,
  syncOfferEpicReducer,
  subscribeCancelledOffersEpicReducer,
  getBestOfferIdsForActiveTradingPairEpicReducer,
  subscribeFilledOffersEpicReducer,
), initialState);

export default {
  actions,
  testActions,
  reducer,
};
