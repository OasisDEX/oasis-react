import {createPromiseActions} from '../../../utils/createPromiseActions';
import {syncOffer} from './syncOfferEpic';
import {getBestOffer, getWorseOffer} from './syncOffersEpic';

export const loadSellOffers = createPromiseActions('OFFERS/LOAD_SELL_OFFERS');
export const loadSellOffersEpic = (offerCount, sellToken, buyToken, {
  doGetBestOffer = getBestOffer,
  doSyncOffer = syncOffer,
  doGetWorseOffer = getWorseOffer,
} = {}) => async (dispatch) => {
  const sellOffersTradingPair = { baseToken: sellToken, quoteToken: buyToken };
  try {
    let currentSellOfferId = (await dispatch(doGetBestOffer(sellToken, buyToken))).value.toNumber();
    dispatch(loadSellOffers.pending(sellOffersTradingPair));
    while (currentSellOfferId !== 0) {
      dispatch(doSyncOffer(currentSellOfferId));
      currentSellOfferId = (await dispatch(doGetWorseOffer(currentSellOfferId))).value.toNumber()
      --offerCount.sellOfferCount;
      if (!offerCount.sellOfferCount) {
        dispatch(loadSellOffers.fulfilled(sellOffersTradingPair));
      }
    }
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
    let currentBuyOfferId = (await dispatch(doGetBestOffer(buyToken, sellToken))).value.toNumber();
    dispatch(loadBuyOffers.pending(buyOffersTradingPair));
    while (currentBuyOfferId !== 0) {
      // console.log({currentBuyOfferId})
      dispatch(doSyncOffer(currentBuyOfferId));
      currentBuyOfferId = (await dispatch(doGetWorseOffer(currentBuyOfferId))).value.toNumber();
      --offerCount.buyOfferCount;
      if (!offerCount.buyOfferCount) {
        dispatch(loadBuyOffers.fulfilled(buyOffersTradingPair));
      }
    }
    return loadBuyOffers;
  } catch(e) {
    dispatch(loadBuyOffers.rejected(e));
  }
};
