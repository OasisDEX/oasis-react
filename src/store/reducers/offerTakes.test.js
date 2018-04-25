import configureMockStore from 'redux-mock-store';
import thunk2Data from '../thunk2Data';
import thunk from 'redux-thunk';
import offerTakes from './offerTakes';
import each from 'jest-each';

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