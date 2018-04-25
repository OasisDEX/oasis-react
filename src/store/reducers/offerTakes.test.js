import configureMockStore from 'redux-mock-store';
import thunk2Data from '../thunk2Data';
import thunk from 'redux-thunk';
import offerTakes from './offerTakes';
import each from 'jest-each';
import { fromJS } from 'immutable';

describe('take offer form', () => {
  const testCases = [
    ['reasonable amount', '100'],
    ['zero', '0'],
    // ['invalid', 'a'],
    ['negative number', '-1'],
  ]

  each(testCases).describe('volumeFieldValueChangedEpic', (desc, volume) => {
    test(`volume set to: ${desc}(${volume})`, () => {

      const store = configureMockStore([thunk2Data(), thunk])({});

      store.dispatch(offerTakes.actions.volumeFieldValueChangedEpic(
        volume, {formValueSelector: () => () => ({price: "3"})}));

      expect(store.getActions()).toMatchSnapshot();
    });
  });

  each(testCases).describe('volumeFieldValueChangedEpic', (desc, total) => {
    test(`total set to: ${desc}(${total})`, () => {

      const store = configureMockStore([thunk2Data(), thunk])({});

      store.dispatch(offerTakes.actions.totalFieldValueChangedEpic(
        total, {formValueSelector: () => () => ({price: "3"})}));

      expect(store.getActions()).toMatchSnapshot();
    });
  });

});

each([["max lower than offer", 13, 3, 12],
      ["max greater than offer", 1, 3, 12]])
  .test("buyMaxEpic %s", (description, balance, howMutch, price) =>
{
  const store = configureMockStore([thunk2Data(), thunk])({});

  store.dispatch(offerTakes.actions.buyMaxEpic({
    quoteTokenBalance: () => balance,
    offerTakeOfferData: () => fromJS({
      buyHowMuch: howMutch,
      ask_price: price})
  }));

  expect(store.getActions()).toMatchSnapshot();
});

each([["balance greater than the offer", 13, 3, 12],
  ["balance lower than the offer", 1, 3, 12]])
  .test("sellMaxEpic %s", (description, balance, howMutch, price) =>
  {
    const store = configureMockStore([thunk2Data(), thunk])({});

    store.dispatch(offerTakes.actions.sellMaxEpic({
      activeBaseTokenBalance: () => balance,
      activeOfferTakeOfferData: () => fromJS({
        buyHowMuch: howMutch,
        bid_price: price})
    }));

    expect(store.getActions()).toMatchSnapshot();
  });


