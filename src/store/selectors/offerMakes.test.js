import offerMakes from "./offerMakes";
import { Map } from "immutable";
import { TOKEN_MAKER, TOKEN_WRAPPED_ETH } from '../../constants';
import { fromJS } from 'immutable';

const state = fromJS({
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
  },
  offers: {
    [Map({ baseToken: TOKEN_WRAPPED_ETH, quoteToken: TOKEN_MAKER })]: {
      loadingBuyOffers: "SYNC_STATUS_COMPLETED",
      initialSyncMeta: {
        syncStartBlockNumber: 8449045,
        syncEndBlockNumber: 8449045,
        syncTimestamps: { syncStartTimestamp: null, syncEndTimestamp: null }
      },
      sellOfferCount: 0,
      loadingSellOffers: "SYNC_STATUS_COMPLETED",
      sellOffers: [],
      initialSyncStatus: "SYNC_STATUS_COMPLETED",
      buyOfferCount: 2,
      reSyncOffersSet: [],
      buyOffers: [
        {
          id: "785",
          owner: "0xf0e90739550992fcf37fe4dcb0b47708ca0ff609",
          buyWhichTokenAddress: "0xaaf64bfcc32d0f15873a02163e7e500671a4ffcd",
          buyWhichToken: "MKR",
          sellWhichTokenAddress: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
          sellWhichToken: "W-ETH",
          buyHowMuch: "16400000000000000000",
          sellHowMuch: "16400000000000000000",
          buyHowMuch_filter: 16400000000000000000,
          sellHowMuch_filter: 16400000000000000000,
          ask_price: "1",
          bid_price: "1",
          ask_price_sort: 1,
          bid_price_sort: 1
        },
        {
          id: "1312",
          owner: "0xfce1bae0f16c07377dbb680fcd0aa94b011eb7af",
          buyWhichTokenAddress: "0xaaf64bfcc32d0f15873a02163e7e500671a4ffcd",
          buyWhichToken: "MKR",
          sellWhichTokenAddress: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
          sellWhichToken: "W-ETH",
          buyHowMuch: "4000000000000000000",
          sellHowMuch: "4000000000000000000",
          buyHowMuch_filter: 4000000000000000000,
          sellHowMuch_filter: 4000000000000000000,
          ask_price: "1",
          bid_price: "1",
          ask_price_sort: 1,
          bid_price_sort: 1
        },
      ]
    }
  }
});

test("activeOfferMakePure/makeBuyOffer", () => {
  expect(
    offerMakes.activeOfferMakePure(state, "makeBuyOffer")
  ).toMatchSnapshot();
});

test("activeOfferMakePure/makeSellOffer", () => {
  expect(
    offerMakes.activeOfferMakePure(state, "makeSellOffer")
  ).toMatchSnapshot();
});

test("activeOfferMakeBuyToken/makeBuyOffer", () => {
  expect(
    offerMakes.activeOfferMakeBuyToken(state, "makeBuyOffer")
  ).toMatchSnapshot();
});

test("activeOfferMakeBuyToken/makeSellOffer", () => {
  expect(
    offerMakes.activeOfferMakeBuyToken(state, "makeSellOffer")
  ).toMatchSnapshot();
});
