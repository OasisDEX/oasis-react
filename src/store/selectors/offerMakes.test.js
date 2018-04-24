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
        tokenAddresses: Map({
            "MKR": "0xaaf64bfcc32d0f15873a02163e7e500671a4ffcd",
            "W-ETH": "0xd0a1e359811322d97991e03f863a0c30c2cf029c"
        })
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
