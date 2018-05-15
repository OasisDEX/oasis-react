import offerMakes from './offerMakes'
import { Map } from 'immutable';

const state = Map({
    tokens: Map({
        activeTradingPair: {
            baseToken: "MKR",
            quoteToken: "W-ETH"
        }
    }),
    network: Map({
      activeNetworkId: 42
    }),
    form: {
        makeBuyOffer: {
            values: {
                price: "1",
                volume: "1",
                total: "1"
            }
        },
        makeSellOffer: {
            values: {
                price: "1",
                volume: "1",
                total: "1"
            }
        }
    }

});

test('activeOfferMakePure/makeBuyOffer', () => {
    expect(offerMakes.activeOfferMakePure(state, 'makeBuyOffer')).toMatchSnapshot();
});

test('activeOfferMakePure/makeSellOffer', () => {
    expect(offerMakes.activeOfferMakePure(state, 'makeSellOffer')).toMatchSnapshot();
});

test('activeOfferMakeBuyToken/makeBuyOffer', () => {
    expect(offerMakes.activeOfferMakeBuyToken(state, 'makeBuyOffer')).toMatchSnapshot();
});

test('activeOfferMakeBuyToken/makeSellOffer', () => {
    expect(offerMakes.activeOfferMakeBuyToken(state, 'makeSellOffer')).toMatchSnapshot();
});
