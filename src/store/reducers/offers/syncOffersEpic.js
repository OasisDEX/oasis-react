import offers from '../../selectors/offers';
import {createPromiseActions} from '../../../utils/createPromiseActions';
import {loadBuyOffersEpic, loadSellOffersEpic} from './loadOffers';
import {createAction} from 'redux-actions';
import {SYNC_STATUS_PRISTINE} from '../../../constants';
import {getMarketContractInstance, getTokenContractInstance} from '../../../bootstrap/contracts';
import {handleTransaction} from '../../../utils/transactions/handleTransaction';
import {TX_OFFER_CANCEL} from '../transactions';
import {CANCEL_GAS} from '../offers';
import {getTradingPairOfferCount} from './getTradingPairOffersCount';

export const tradingPairOffersAlreadyLoaded = createAction('OFFERS/TRADING_PAIR_ALREADY_LOADED');


export const updateOffer = createAction(
  'OFFERS/UPDATE_OFFER',
  ({ offer, baseToken, quoteToken, offerType, previousOfferState }) =>
    ({ offer, baseToken, quoteToken, offerType, previousOfferState }),
);

const resetOffers = createAction(
  'OFFERS/RESET_OFFERS',
  ({ baseToken, quoteToken }) => ({ baseToken, quoteToken }),
);

export const getBestOffer = createAction(
  'OFFERS/GET_BEST_OFFER',
  async (sellToken, buyToken) => {
    const sellTokenAddress = getTokenContractInstance(sellToken).address;
    const buyTokenAddress = getTokenContractInstance(buyToken).address;
    return getMarketContractInstance().getBestOffer(sellTokenAddress, buyTokenAddress);
  },
);

export const cancelOffer = createAction(
  'OFFERS/CANCEL_OFFER',
  (offerId) =>
    getMarketContractInstance().cancel(offerId, { gas: CANCEL_GAS }),
);
export const cancelOfferEpic = (offer, withCallbacks = {}) => dispatch => {
  return handleTransaction({
    dispatch,
    transactionDispatcher: () => dispatch(cancelOffer(offer.get('id'))),
    transactionType: TX_OFFER_CANCEL,
    txMeta: { offerId: offer.id },
    withCallbacks
  });
};

export const getWorseOffer = createAction(
  'OFFERS/GET_WORSE_OFFER',
  offerId => getMarketContractInstance().getWorseOffer(offerId),
);

export const loadOffer = createAction(
  'OFFERS/LOAD_OFFER',
  async (offerId) => getMarketContractInstance().offers(offerId),
);


export const syncOffers = createPromiseActions('OFFERS/SYNC_OFFERS');
export const syncOffersEpic = ({ baseToken, quoteToken }, {
  doGetTradingPairOfferCount = getTradingPairOfferCount,
  doLoadBuyOffersEpic = loadBuyOffersEpic,
  doLoadSellOffersEpic = loadSellOffersEpic,
} = {}) => async (dispatch, getState) => {

  if (offers.activeTradingPairOffersInitialLoadStatus(getState()) !== SYNC_STATUS_PRISTINE) {
    return dispatch(tradingPairOffersAlreadyLoaded({ baseToken, quoteToken }));
  }
  dispatch(syncOffers.pending({ baseToken, quoteToken }));
  dispatch(resetOffers({ baseToken, quoteToken }));
  const offerCount = (await dispatch(doGetTradingPairOfferCount(baseToken, quoteToken))).value;
  return Promise.all([
    dispatch(doLoadBuyOffersEpic(offerCount, baseToken, quoteToken)),
    dispatch(doLoadSellOffersEpic(offerCount, baseToken, quoteToken)),
  ]).then(() => dispatch(syncOffers.fulfilled({ baseToken, quoteToken })));
};
