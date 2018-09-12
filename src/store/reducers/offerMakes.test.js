import thunk from 'redux-thunk';
import thunk2Data from '../thunk2Data';
import configureMockStore from 'redux-mock-store'
import {MAKE_BUY_OFFER, MAKE_SELL_OFFER} from '../../constants'
import { fromJS } from 'immutable';

import offerMakes from './offerMakes'

import each from 'jest-each';

describe('make offer form', () => {
    const testCases = [
        ["reasonable amount", "100", MAKE_BUY_OFFER],
        ["zero", "0", MAKE_BUY_OFFER],
        ["invalid", "a", MAKE_BUY_OFFER],
        ["negative number", "-1", MAKE_BUY_OFFER],
        ["reasonable amount", "100", MAKE_SELL_OFFER],
        ["zero", "0", MAKE_SELL_OFFER],
        ["invalid", "a", MAKE_SELL_OFFER],
        ["negative number", "-1", MAKE_SELL_OFFER]
    ]

    each(testCases).describe("volumeFieldValueChangedEpic", (desc, volume, offerMakeType) => {
        test(`volume set to: ${desc}(${volume}) for: ${offerMakeType}`, () => {

            const store = configureMockStore([thunk2Data(), thunk])({});

            store.dispatch(offerMakes.actions.volumeFieldValueChangedEpic(
              offerMakeType, volume, {localFormValueSelector: () => () => 3}));

            expect(store.getActions()).toMatchSnapshot();
        });
    });

    each(testCases).describe("totalFieldValueChangedEpic", (desc, total, offerMakeType) => {
        test(`total set to: ${desc}(${total}) for: ${offerMakeType}`, () => {

          const store = configureMockStore([thunk2Data(), thunk])({});

          store.dispatch(offerMakes.actions.totalFieldValueChangedEpic(
            offerMakeType, total, {localFormValueSelector: () => () => 3}))

          expect(store.getActions()).toMatchSnapshot();
        });
    });


    each(testCases).describe("priceFieldChangedEpic", (desc, price, offerMakeType) => {
        test(`price set to: ${desc}(${price}) for: ${offerMakeType}`, () => {
          const store = configureMockStore([thunk2Data(), thunk])({});

          store.dispatch(offerMakes.actions.totalFieldValueChangedEpic(
            offerMakeType, price, {localFormValueSelector: () => () => 3}))

          expect(store.getActions()).toMatchSnapshot();
        });
    });
});

describe("make offer modal", () => {
    test("setOfferMakeModalOpenEpic", () => {
        const store = configureMockStore([thunk2Data(), thunk])({});
        store.dispatch(offerMakes.actions.setOfferMakeModalOpenEpic(MAKE_BUY_OFFER));
        expect(store.getActions()).toMatchSnapshot();
    });
    test("setOfferMakeModalClosedEpic", () => {
        const store = configureMockStore([thunk2Data(), thunk])({});
        store.dispatch(offerMakes.actions.setOfferMakeModalClosedEpic(MAKE_BUY_OFFER));
        expect(store.getActions()).toMatchSnapshot();
    })
});

each([[MAKE_BUY_OFFER], [MAKE_SELL_OFFER]]).test("buyMaxEpic", (offerMakeType) => {
    const store = configureMockStore([thunk2Data(), thunk])({});

    store.dispatch(offerMakes.actions.buyMaxEpic(offerMakeType, { activeQuoteTokenBalance: () => 33}));

    expect(store.getActions()).toMatchSnapshot();
});

each([[MAKE_BUY_OFFER], [MAKE_SELL_OFFER]]).test("sellMaxEpic", (offerMakeType) => {

  const store = configureMockStore([thunk2Data(), thunk])({});

  store.dispatch(offerMakes.actions.sellMaxEpic(
    offerMakeType,
    { activeBaseTokenBalance: () => 100,
      currentFormValues: () => () => ({price: 0.8})
    }));

  expect(store.getActions()).toMatchSnapshot();
});

each([[true], [false]]).test("updateTransactionGasCostEstimateEpic", (canMakeOffer) => {
  const store = configureMockStore([thunk2Data(), thunk])(
    fromJS({ transactions: {}})
  );

  store.dispatch(offerMakes.actions.updateTransactionGasCostEstimateEpic(
    MAKE_BUY_OFFER,
    { canMakeOffer: () => canMakeOffer,
      activeOfferMakePure: () => fromJS({
        sellTokenAddress: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
        buyTokenAddress: "0xaaf64bfcc32d0f15873a02163e7e500671a4ffcd",
        offerData: {
          payAmount: "1000000000000000000",
          buyAmount: "1000000000000000000",
        }
      })
    }));
  expect(store.getActions()).toMatchSnapshot();
});
