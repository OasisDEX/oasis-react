import offers from '../../store/selectors/offers';
import { TYPE_BUY_OFFER, TYPE_SELL_OFFER } from '../../store/reducers/offers';
import { SYNC_STATUS_PRISTINE } from '../../constants';

const findOffer = (offerId, state) => {
  let searchedOffer, offerTradingPair = null, offerType = null;
  offers.allOffers(state).entrySeq().find(
    ([pair, offers]) => {
       if ((offers.get('initialSyncStatus') !== SYNC_STATUS_PRISTINE)) {
        const buyOffer = offers.get('buyOfferCount') ?
          offers.get('buyOffers').find(bo => parseInt(bo.id) === parseInt(offerId)) : null;
        const sellOffer = offers.get('sellOfferCount') ?
          offers.get('sellOffers').find(so => parseInt(so.id) === parseInt(offerId)) : null;
        if(buyOffer) {

          offerType = TYPE_BUY_OFFER;
          offerTradingPair = pair;
          searchedOffer = buyOffer;
          return buyOffer;

        } else if (sellOffer) {

          offerType = TYPE_SELL_OFFER;
          searchedOffer = sellOffer;
          offerTradingPair = pair;
          return sellOffer;

        }
      }
  });

  if(searchedOffer) {
    return ({
      offer: searchedOffer,
      offerId: searchedOffer.id,
      offerType,
      tradingPair: offerTradingPair.toJSON()
    });
  }
};

export default findOffer;