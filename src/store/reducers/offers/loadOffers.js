import {createPromiseActions} from '../../../utils/createPromiseActions';
import {syncOffer} from './syncOfferEpic';
import {getBestOffer, getWorseOffer} from './syncOffersEpic';
import {Map} from 'immutable';
import {SYNC_STATUS_COMPLETED, SYNC_STATUS_PENDING} from '../../../constants';

export const loadSellOffers = createPromiseActions('OFFERS/LOAD_SELL_OFFERS');
export const loadSellOffersEpic = (offerCount, sellToken, buyToken, {
  doGetBestOffer = getBestOffer,
  doSyncOffer = syncOffer,
  doGetWorseOffer = getWorseOffer,
} = {}) => async (dispatch) => {
  const sellOffersTradingPair = { baseToken: sellToken, quoteToken: buyToken };
  try {
    dispatch(loadSellOffers.pending(sellOffersTradingPair));
    let currentSellOfferId = (await dispatch(doGetBestOffer(sellToken, buyToken))).value.toNumber();
    while (currentSellOfferId !== 0) {
      dispatch(doSyncOffer(currentSellOfferId));
      currentSellOfferId = (await dispatch(doGetWorseOffer(currentSellOfferId))).value.toNumber()
    }
    dispatch(loadSellOffers.fulfilled(sellOffersTradingPair));
    return loadSellOffers;
  } catch(e) {
    dispatch(loadSellOffers.rejected(e));
  }
};

export const loadBuyOffers = createPromiseActions('OFFERS/LOAD_BUY_OFFERS');
export const loadBuyOffersEpic = (offerCount, sellToken, buyToken, {
  doGetBestOffer = getBestOffer,
  doSyncOffer = syncOffer,
  doGetWorseOffer = getWorseOffer,
} = {}) => async (dispatch) => {
  const buyOffersTradingPair = { baseToken: sellToken, quoteToken: buyToken };
  try {
    dispatch(loadBuyOffers.pending(buyOffersTradingPair));
    let currentBuyOfferId = (await dispatch(doGetBestOffer(buyToken, sellToken))).value.toNumber();
    while (currentBuyOfferId !== 0) {
      dispatch(doSyncOffer(currentBuyOfferId));
      currentBuyOfferId = (await dispatch(doGetWorseOffer(currentBuyOfferId))).value.toNumber();
    }
    dispatch(loadBuyOffers.fulfilled(buyOffersTradingPair));
    return loadBuyOffers;
  } catch(e) {
    dispatch(loadBuyOffers.rejected(e));
  }
};

export const reducer = {
  [loadBuyOffers.pending]: (state, { payload }) =>
    state.setIn(['offers', Map(payload), 'loadingBuyOffers'], SYNC_STATUS_PENDING),
  [loadBuyOffers.fulfilled]: (state, { payload }) =>
    state.setIn(['offers', Map(payload), 'loadingBuyOffers'], SYNC_STATUS_COMPLETED),
  [loadBuyOffers.rejected]: (state, { payload }) =>
    // state.setIn(['offers', Map(payload), 'loadingBuyOffers'], SYNC_STATUS_ERROR),
    { throw payload },

  [loadSellOffers.pending]: (state, { payload }) =>
    state.setIn(['offers', Map(payload), 'loadingSellOffers'], SYNC_STATUS_PENDING),
  [loadSellOffers.fulfilled]: (state, { payload }) =>
    state.setIn(['offers', Map(payload), 'loadingSellOffers'], SYNC_STATUS_COMPLETED),
  [loadSellOffers.rejected]: (state, { payload }) =>
    // state.setIn(['offers', Map(payload), 'loadingSellOffers'], SYNC_STATUS_ERROR),
    { throw payload },
};
