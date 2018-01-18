import offers from '../../store/selectors/offers';
import { TYPE_BUY_OFFER, TYPE_SELL_OFFER } from '../../store/reducers/offers';

const findOffer = (offerId, state) => {

    const offer = offers.activeTradingPairSellOffers(state).find(
      buyOffer => parseInt(buyOffer.id) === parseInt(offerId)
    );

    if (offer) { return offer ? { offer, offerType: TYPE_SELL_OFFER } : { offer: null }; }
    else {
      const offer = offers.activeTradingPairBuyOffers(state).find(
        sellOffer => parseInt(sellOffer.id) === parseInt(offerId)
      );
      return offer ? { offer, offerType: TYPE_BUY_OFFER } : { offer: null };
    }
};

export default findOffer;