/* global describe test expect jest */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import each from 'jest-each';

import BigNumber from 'bignumber.js';
import {Map, List} from 'immutable';

import offers from './offers';
import {OFFER_SYNC_TYPE_INITIAL, OFFER_SYNC_TYPE_NEW_OFFER, OFFER_SYNC_TYPE_UPDATE} from './offers';
import {TYPE_BUY_OFFER} from "./offers";
import conversion from '../../utils/conversion';
import {SYNC_STATUS_PRISTINE} from '../../constants';

each([
  ['initial sync', OFFER_SYNC_TYPE_INITIAL],
  ['new offer sync', OFFER_SYNC_TYPE_NEW_OFFER],
  ['update sync', OFFER_SYNC_TYPE_UPDATE],
]).describe('syncOffer', (description, syncType) => {

  test(description, async () => {
    const store = configureMockStore([thunk])({});

    const setOfferEpic = jest.fn(() => () => null);
    const getTradingPairOfferCount = jest.fn(() => () => null);
    const promise = store.dispatch(offers.testActions.syncOffer('61209', syncType, null, {
      doLoadOffer: () => async () => ({value: [new BigNumber("130350000000000000"), "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", new BigNumber("100000000000000000"), "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2", "0x2495eb6895c2e6c591ae9eb63a07b4a450623220", false, new BigNumber("0")]}),
      doGetOfferTradingPairAndType: () => ({baseToken: "MKR", quoteToken: "W-ETH", offerType: "OFFERS/TYPE_BUY"}),
      doGetTradingPairOfferCount: getTradingPairOfferCount,
      doSetOfferEpic: setOfferEpic,
    }));

    const result = await promise;

    expect(result).toMatchSnapshot();
    expect(store.getActions()).toMatchSnapshot();
    expect(getTradingPairOfferCount.mock.calls).toMatchSnapshot();
    expect(setOfferEpic.mock.calls).toMatchSnapshot();
  });

});

each([
  ['new offer sync / set', OFFER_SYNC_TYPE_NEW_OFFER],
  ['initial sync / update', OFFER_SYNC_TYPE_INITIAL],
  ['initial sync / set', OFFER_SYNC_TYPE_INITIAL, {id: 61210}],
  ['update sync / partial', OFFER_SYNC_TYPE_UPDATE],
  ['update sync / complete', OFFER_SYNC_TYPE_UPDATE, {buyHowMuch: new BigNumber(0)}],
]).describe('setOfferEpic', (description, syncType, overrides = {}) => {

  test(description, async () => {
    const store = configureMockStore([thunk])(Map({
      tokens: Map({
        precision: 18,
        tokenSpecs: Map({
          "MKR": Map({
            precision: 18,
          }),
          "W-ETH": Map({
            precision: 18,
          }),
        }),
      }),
      offers: Map({
        offers: Map()
          .set(Map({baseToken: 'MKR', quoteToken: 'W-ETH'}), Map({
            buyOfferCount: 1,
            buyOffers: List([
              {id: 61209},
            ]),
          })),
      }),
    }));
    conversion.init(store.getState);

    const promise = store.dispatch(offers.testActions.setOfferEpic(Object.assign({
      id: 61209,
      sellHowMuch: new BigNumber("130350000000000000"),
      sellWhichTokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      buyHowMuch: new BigNumber("100000000000000000"),
      buyWhichTokenAddress: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
      owner: "0x2495eb6895c2e6c591ae9eb63a07b4a450623220",
      status: undefined,
      offerType: TYPE_BUY_OFFER,
      syncType: syncType,
      tradingPair: {baseToken: "MKR", quoteToken: "W-ETH"},
      previousOfferState: undefined,
    }, overrides), {
      doGetTokenByAddress: (address) => ({"0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2": "MKR", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "W-ETH"}[address]),
    }));

    const result = await promise;

    expect(result).toMatchSnapshot();
    expect(store.getActions()).toMatchSnapshot();
  });

});

each([
  ['buy(0)', offers.testActions.loadBuyOffersEpic, []],
  ['buy(1)', offers.testActions.loadBuyOffersEpic, [900]],
  ['buy(2)', offers.testActions.loadBuyOffersEpic, [800, 700]],
  ['sell(0)', offers.testActions.loadSellOffersEpic, []],
  ['sell(1)', offers.testActions.loadSellOffersEpic, [900]],
  ['sell(2)', offers.testActions.loadSellOffersEpic, [800, 700]],
]).describe('load(Buy/Sell)OffersEpic', (description, action, offerIds) => {

  test(description, async () => {
    const store = configureMockStore([thunk])({});

    const getOfferIds = offerIds.reduce((a, id) => a.mockReturnValueOnce(id), jest.fn()).mockReturnValue(0);
    const syncOffer = jest.fn(() => () => null);
    const promise = store.dispatch(action({buyOfferCount: 100, sellOfferCount: 100}, "MKR", "W-ETH", {
      doGetBestOffer: () => async () => ({value: new BigNumber(getOfferIds())}),
      doSyncOffer: syncOffer,
      doGetWorseOffer: () => async () => ({value: new BigNumber(getOfferIds())}),
    }));

    const result = await promise;

    expect(result).toMatchSnapshot();
    expect(store.getActions()).toMatchSnapshot();
    expect(syncOffer.mock.calls).toMatchSnapshot();
  });

});

describe('syncOffersEpic', () => {

  test('main', async () => {
    const store = configureMockStore([thunk])(Map({
      tokens: Map({
        activeTradingPair: Map({
          baseToken: "MKR",
          quoteToken: "W-ETH",
        }),
      }),
      offers: Map({
        offers: Map()
          .set(Map({baseToken: 'MKR', quoteToken: 'W-ETH'}), Map({
            initialSyncStatus: SYNC_STATUS_PRISTINE,
          })),
      }),
    }));

    const loadBuyOffersEpic = jest.fn(() => async () => null);
    const loadSellOffersEpic = jest.fn(() => async () => null);
    const promise = store.dispatch(offers.actions.syncOffersEpic({baseToken: "MKR", quoteToken: "W-ETH"}, {
      doGetTradingPairOfferCount: () => async () => ({value: 10}),
      doLoadBuyOffersEpic: loadBuyOffersEpic,
      doLoadSellOffersEpic: loadSellOffersEpic,
    }));

    const result = await promise;

    expect(result).toMatchSnapshot();
    expect(store.getActions()).toMatchSnapshot();
    expect(loadBuyOffersEpic.mock.calls).toMatchSnapshot();
    expect(loadSellOffersEpic.mock.calls).toMatchSnapshot();
  });

});
