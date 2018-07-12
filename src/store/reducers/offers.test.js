/* global describe test expect jest */

import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import each from "jest-each";
import { mockAction, mockEpic, asyncMock } from "../../utils/testHelpers";

import BigNumber from "bignumber.js";
import { Map, List } from "immutable";

import config from "../../configs";
import offers from "./offers";
import {
  OFFER_SYNC_TYPE_INITIAL,
  OFFER_SYNC_TYPE_NEW_OFFER,
  OFFER_SYNC_TYPE_UPDATE
} from "./offers";
import { TYPE_BUY_OFFER } from "./offers";
import conversion from "../../utils/conversion";
import { SYNC_STATUS_PRISTINE } from "../../constants";
import { getMarketContractInstance } from '../../bootstrap/contracts';

const TOKEN_ADDRS = config.tokens.kovan;

each([
  ["initial sync", OFFER_SYNC_TYPE_INITIAL],
  ["new offer sync", OFFER_SYNC_TYPE_NEW_OFFER],
  ["update sync", OFFER_SYNC_TYPE_UPDATE]
]).describe("syncOffer", (description, syncType) => {
  test(description, async () => {
    const store = configureMockStore([thunk])(
      Map({
        network: Map({ latestBlockNumber: 1 }),
        tokens: Map({
          precision: 18,
          tokenSpecs: Map({
            MKR: Map({}),
            "W-ETH": Map({})
          }),
          tradingPairs: List([
            Map({
              base: "MKR",
              quote: "W-ETH"
            })
          ])
        })
      })
    );

    const promise = store.dispatch(
      offers.testActions.syncOffer("61209", syncType, null, {
        doLoadOffer: () => async () => ({
          value: [
            new BigNumber("130350000000000000"),
            TOKEN_ADDRS["W-ETH"],
            new BigNumber("100000000000000000"),
            TOKEN_ADDRS["MKR"],
            "0x2495eb6895c2e6c591ae9eb63a07b4a450623220",
            false,
            new BigNumber("0")
          ]
        }),
        doSetOfferEpic: mockAction("OFFERS/SET_OFFER"),
        doGetTradingPairOfferCount:  mockAction('OFFERS/GET_TRADING_PAIR_OFFERS_COUNT')
      })
    );

    const result = await promise;

    expect(result).toMatchSnapshot();
    expect(store.getActions()).toMatchSnapshot();
  });
});

each([
  ["new offer sync / set", OFFER_SYNC_TYPE_NEW_OFFER],
  ["initial sync / update", OFFER_SYNC_TYPE_INITIAL],
  ["initial sync / set", OFFER_SYNC_TYPE_INITIAL, { id: 61210 }],
  ["update sync / partial", OFFER_SYNC_TYPE_UPDATE],
  [
    "update sync / complete",
    OFFER_SYNC_TYPE_UPDATE,
    { buyHowMuch: new BigNumber(0) }
  ]
]).describe("setOfferEpic", (description, syncType, overrides = {}) => {
  test(description, async () => {
    const store = configureMockStore([thunk])(
      Map({
        network: Map({ latestBlockNumber: 1 }),
        tokens: Map({
          precision: 18,
          tokenSpecs: Map({
            MKR: Map({
              precision: 18
            }),
            "W-ETH": Map({
              precision: 18
            })
          })
        }),
        offers: Map({
          offers: Map().set(
            Map({ baseToken: "MKR", quoteToken: "W-ETH" }),
            Map({
              buyOfferCount: 1,
              buyOffers: List([{ id: 61209 }])
            })
          )
        })
      })
    );
    conversion.init(store.getState);

    const promise = store.dispatch(
      offers.testActions.setOfferEpic(
        Object.assign(
          {
            id: 61209,
            sellHowMuch: new BigNumber("130350000000000000"),
            sellWhichTokenAddress: TOKEN_ADDRS["W-ETH"],
            buyHowMuch: new BigNumber("100000000000000000"),
            buyWhichTokenAddress: TOKEN_ADDRS["MKR"],
            owner: "0x2495eb6895c2e6c591ae9eb63a07b4a450623220",
            status: undefined,
            offerType: TYPE_BUY_OFFER,
            syncType: syncType,
            tradingPair: { baseToken: "MKR", quoteToken: "W-ETH" },
            previousOfferState: undefined
          },
          overrides
        )
      )
    );

    const result = await promise;

    expect(result).toMatchSnapshot();
    expect(store.getActions()).toMatchSnapshot();
  });
});

each([
  [
    "buy empty",
    offers.testActions.loadBuyOffersEpic,
    [[{id: 0, sell: 0, buy: 0}]],
    [[{id: 0, sell: 0, buy: 0}]],
  ],
  [
    "buy one page",
    offers.testActions.loadBuyOffersEpic,
    [[{id: 1, sell: 100, buy: 100}, {id: 0, sell: 0, buy: 0}]],
    [[{id: 0, sell: 0, buy: 0}]],
  ],
  [
    "buy two pages",
    offers.testActions.loadBuyOffersEpic,
    [[{id: 1, sell: 100, buy: 100}, {id: 2, sell: 100, buy: 100}]],
    [[{id: 2, sell: 200, buy: 200}, {id: 0, sell: 0, buy: 0}]],
  ],
  [
    "buy removed from first page",
    offers.testActions.loadBuyOffersEpic,
    [[{id: 1, sell: 100, buy: 100}, {id: 2, sell: 100, buy: 100}], [{id: 1, sell: 200, buy: 200}, {id: 0, sell: 0, buy: 0}]],
    [[{id: 0, sell: 0, buy: 0}]]
  ],
  [
    "buy removed from next page",
    offers.testActions.loadBuyOffersEpic,
    [[{id: 1, sell: 100, buy: 100}, {id: 2, sell: 100, buy: 100}], [{id: 1, sell: 150, buy: 150}, {id: 2, sell: 250, buy: 250}]],
    [[{id: 2, sell: 200, buy: 200}, {id: 3, sell: 100, buy: 100}], [{id: 0, sell: 0, buy: 0}], [{id: 2, sell: 300, buy: 300}, {id: 0, sell: 0, buy: 0}]],
  ],
  [
    "sell empty",
    offers.testActions.loadSellOffersEpic,
    [[{id: 0, sell: 0, buy: 0}]],
    [[{id: 0, sell: 0, buy: 0}]],
  ],
  [
    "sell one page",
    offers.testActions.loadSellOffersEpic,
    [[{id: 1, sell: 100, buy: 100}, {id: 0, sell: 0, buy: 0}]],
    [[{id: 0, sell: 0, buy: 0}]],
  ],
  [
    "sell two pages",
    offers.testActions.loadSellOffersEpic,
    [[{id: 1, sell: 100, buy: 100}, {id: 2, sell: 100, buy: 100}]],
    [[{id: 2, sell: 200, buy: 200}, {id: 0, sell: 0, buy: 0}]],
  ],
  [
    "sell removed from first page",
    offers.testActions.loadSellOffersEpic,
    [[{id: 1, sell: 100, buy: 100}, {id: 2, sell: 100, buy: 100}], [{id: 1, sell: 200, buy: 200}, {id: 0, sell: 0, buy: 0}]],
    [[{id: 0, sell: 0, buy: 0}]]
  ],
  [
    "sell removed from next page",
    offers.testActions.loadSellOffersEpic,
    [[{id: 1, sell: 100, buy: 100}, {id: 2, sell: 100, buy: 100}], [{id: 1, sell: 150, buy: 150}, {id: 2, sell: 250, buy: 250}]],
    [[{id: 2, sell: 200, buy: 200}, {id: 3, sell: 100, buy: 100}], [{id: 0, sell: 0, buy: 0}], [{id: 2, sell: 300, buy: 300}, {id: 0, sell: 0, buy: 0}]],
  ],
]).describe("loadSellOffersEpic", (description, action, firstCalls, nextCalls) => {
  test(description, async () => {
    const store = configureMockStore([thunk])(
      Map({
        tokens: Map({
          precision: 18,
          tokenSpecs: Map({
            MKR: Map({
              precision: 18,
            }),
            "W-ETH": Map({
              precision: 18,
            })
          }),
          tradingPairs: List([
            Map({
              base: "MKR",
              quote: "W-ETH",
            })
          ]),
        }),
        offers: Map({
          offers: Map().set(
            Map({ baseToken: "MKR", quoteToken: "W-ETH" }),
            Map({
              buyOfferCount: 0,
              buyOffers: List(),
            })
          ),
        }),
      })
    );

    const obj2web3 = o => o.map(c => [
      c.map(v => new BigNumber(v.id)),
      c.map(v => new BigNumber(v.sell)),
      c.map(v => new BigNumber(v.buy)),
      [],
      [],
    ]);
    const promise = store.dispatch(action(null, 'MKR', 'W-ETH', {
      firstPage: asyncMock(obj2web3(firstCalls).reduce((a, e) => a.mockReturnValueOnce(e), jest.fn())),
      nextPage: asyncMock(obj2web3(nextCalls).reduce((a, e) => a.mockReturnValueOnce(e), jest.fn())),
      pageSize: 2,
    }));

    const result = await promise;
    expect(result).toMatchSnapshot();
    expect(store.getActions()).toMatchSnapshot();
  });
});

describe("syncOffersEpic", () => {
  test("main", async () => {
    const store = configureMockStore([thunk])(
      Map({
        network: Map({ latestBlockNumber: 1 }),
        tokens: Map({
          activeTradingPair: Map({
            baseToken: "MKR",
            quoteToken: "W-ETH"
          })
        }),
        offers: Map({
          offers: Map().set(
            Map({ baseToken: "MKR", quoteToken: "W-ETH" }),
            Map({
              initialSyncStatus: SYNC_STATUS_PRISTINE
            })
          )
        })
      })
    );

    const promise = store.dispatch(
      offers.actions.syncOffersEpic(
        { baseToken: "MKR", quoteToken: "W-ETH" },
        {
          doGetBestOffer: mockEpic('OFFERS/GET_BEST_OFFER', store.dispatch)(
            (t1) => ({value: {"MKR": "1000", "W-ETH": "2000"}[t1]})
          ),
          doGetTradingPairOfferCount: () => async () => ({ value: 10 }),
          doLoadBuyOffersEpic: mockAction("OFFERS/LOAD_BUY_OFFERS"),
          doLoadSellOffersEpic: mockAction("OFFERS/LOAD_SELL_OFFERS")
        }
      )
    );

    const result = await promise;

    expect(result).toMatchSnapshot();
    expect(store.getActions()).toMatchSnapshot();
  });
});

describe("subscribeNewOffersFilledInEpic", () => {
  test("main", async () => {
    const store = configureMockStore([thunk])(Map({}));

    const LogMake = jest.fn(() => ({
      then: onSuccess => onSuccess(null, { args: { id: 123 } })
    }));
    const promise = store.dispatch(
      offers.testActions.subscribeNewOffersFilledInEpic(
        1,
        {},
        {
          doGetMarketContractInstance: () => ({
            LogMake: LogMake
          })
        }
      )
    );

    const result = await promise;

    expect(result).toMatchSnapshot();
    expect(store.getActions()).toMatchSnapshot();
    expect(LogMake.mock.calls).toMatchSnapshot();
  });
});

describe("subscribeCancelledOrdersEpic", () => {
  test("main", async () => {
    const store = configureMockStore([thunk])(
      Map({
        offers: Map({
          offers: Map().set(
            Map({ baseToken: "MKR", quoteToken: "W-ETH" }),
            Map({
              buyOfferCount: 1,
              buyOffers: List([{ id: 61211 }])
            })
          )
        })
      })
    );

    const LogKill = jest.fn(() => ({
      then: onSuccess => onSuccess(null, { args: { id: 61211 } })
    }));
    const promise = store.dispatch(
      offers.testActions.subscribeCancelledOrdersEpic(
        1,
        {},
        {
          doGetMarketContractInstance: () => ({
            LogKill: LogKill
          }),
          doGetTradingPairOfferCount: mockAction(
            "GET_TRADING_PAIR_OFFERS_COUNT"
          )
        }
      )
    );

    const result = await promise;

    expect(result).toMatchSnapshot();
    expect(store.getActions()).toMatchSnapshot();
    expect(LogKill.mock.calls).toMatchSnapshot();
  });
});

each([
  ["active new", 61212, true],
  ["active update", 61211, true],
  ["passive new", 61212, false],
  ["passive update offerTake", 61211, false, 61211],
  ["passive update", 61211, false]
]).describe(
  "subscribeFilledOffersEpic",
  (description, id, active, offerTake = null) => {
    test(description, async () => {
      const store = configureMockStore([thunk])(
        Map({
          offers: Map({
            offers: Map().set(
              Map({ baseToken: "MKR", quoteToken: "W-ETH" }),
              Map({
                buyOfferCount: 1,
                buyOffers: List([{ id: 61211 }])
              })
            )
          }),
          offerTakes: Map({
            activeOfferTakeOfferId: String(offerTake)
          })
        })
      );

      const LogItemUpdate = jest.fn(() => ({
        then: onSuccess => onSuccess(null, { args: { id: new BigNumber(id) } })
      }));
      const promise = store.dispatch(
        offers.testActions.subscribeFilledOffersEpic(
          1,
          {},
          {
            doGetMarketContractInstance: () => ({
              LogItemUpdate: LogItemUpdate
            }),
            doCheckOfferIsActive: () => async () => ({ value: active }),
            doSyncOffer: mockAction("SYNC_OFFER")
          }
        )
      );

      const result = await promise;

      expect(result).toMatchSnapshot();
      expect(store.getActions()).toMatchSnapshot();
      expect(LogItemUpdate.mock.calls).toMatchSnapshot();
    });
  }
);
