/* global describe test expect */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import each from 'jest-each';
import {wei, mockDate, mockDatePromise, mockAction, dispatchMockAction} from '../../utils/testHelpers';

import {Map} from 'immutable';

import wrapUnwrap from './wrapUnwrap'

describe('setActiveWrapUnwrappedToken', () => {

  test('main', () => {
    const store = configureMockStore([thunk])(Map({}));

    const result = store.dispatch(wrapUnwrap.actions.setActiveWrapUnwrappedToken("ETH"));

    expect(result).toMatchSnapshot();
    expect(store.getActions()).toMatchSnapshot();
  });

});

describe('setWrapMax', () => {

  test('main', () => {
    const store = configureMockStore([thunk])(Map({
      wrapUnwrap: Map({
        activeUnwrappedToken: "ETH",
      }),
      balances: Map({
        ethBalance: wei(10),
      }),
    }));

    const result = store.dispatch(wrapUnwrap.actions.setWrapMax());

    expect(result).toMatchSnapshot();
    expect(store.getActions()).toMatchSnapshot();
  });

});

describe('setUnwrapMax', () => {

  test('main', () => {
    const store = configureMockStore([thunk])(Map({
      wrapUnwrap: Map({
        activeUnwrappedToken: "ETH",
        wrapperTokenPairs: [
          Map({
            unwrapped: "ETH",
            wrapper: "W-ETH",
          }),
        ],
      }),
      balances: Map({
        tokenBalances: Map({
          "W-ETH": wei(5),
        }),
      }),
    }));

    const result = store.dispatch(wrapUnwrap.actions.setUnwrapMax());

    expect(result).toMatchSnapshot();
    expect(store.getActions()).toMatchSnapshot();
  });

});

describe('resetActiveWrapForm', () => {

  test('main', () => {
    const store = configureMockStore([thunk])(Map({}));

    const result = store.dispatch(wrapUnwrap.actions.resetActiveWrapForm());

    expect(result).toMatchSnapshot();
    expect(store.getActions()).toMatchSnapshot();
  });

});

describe('resetActiveUnwrapForm', () => {

  test('main', () => {
    const store = configureMockStore([thunk])(Map({}));

    const result = store.dispatch(wrapUnwrap.actions.resetActiveUnwrapForm());

    expect(result).toMatchSnapshot();
    expect(store.getActions()).toMatchSnapshot();
  });

});

describe('wrapETHTokenEpic', () => {

  test('main', async () => {
    const store = configureMockStore([thunk])(Map({}));

    const promise = mockDate('2018-06-05', () => store.dispatch(wrapUnwrap.testActions.wrapETHTokenEpic({
      onCancelCleanup: dispatchMockAction('onCancelCleanup', store.dispatch),
      onStart: dispatchMockAction('onStart', store.dispatch),
      onPending: dispatchMockAction('onPending', store.dispatch),
      onCompleted: dispatchMockAction('onCompleted', store.dispatch),
      onRejected: dispatchMockAction('onRejected', store.dispatch),
    }, {
      doWrapEther: () => async () => ({value: '0xabcd'}),
      doAddTransactionEpic: () => async () => ({value: '0xcdef'}),
    })));

    const result = await mockDatePromise('2018-06-05', promise);
    const promise2 = result.transactionConfirmationPromise;
    const result2 = await promise2;

    expect(result).toMatchSnapshot();
    expect(result2).toMatchSnapshot();
    expect(store.getActions()).toMatchSnapshot();
  });

});

describe('unwrapEtherEpic', () => {

  test('main', async () => {
    const store = configureMockStore([thunk])(Map({}));

    const promise = mockDate('2018-06-05', () => store.dispatch(wrapUnwrap.testActions.unwrapEtherEpic({
      onCancelCleanup: dispatchMockAction('onCancelCleanup', store.dispatch),
      onStart: dispatchMockAction('onStart', store.dispatch),
      onPending: dispatchMockAction('onPending', store.dispatch),
      onCompleted: dispatchMockAction('onCompleted', store.dispatch),
      onRejected: dispatchMockAction('onRejected', store.dispatch),
    }, {
      doUnwrapEther: () => async () => ({value: '0xabcd'}),
      doAddTransactionEpic: () => async () => ({value: '0xcdef'}),
    })));

    const result = await mockDatePromise('2018-06-05', promise);
    const promise2 = result.transactionConfirmationPromise;
    const result2 = await promise2;

    expect(result).toMatchSnapshot();
    expect(result2).toMatchSnapshot();
    expect(store.getActions()).toMatchSnapshot();
  });

});

each([
  ['with broker', "0x1234"],
  ['without broker', "0x0"],
]).describe('wrapGNTTokenEpic', (description, brokerAddress) => {

  test(description, async () => {
    const store = configureMockStore([thunk])(Map({
      accounts: Map({
        defaultAccount: 'ACC',
      }),
      wrapUnwrap: Map({
        brokerAddresses: Map({
          "ACC": Map({
            "GNT": brokerAddress,
          }),
        }),
      }),
    }));

    wrapUnwrap.testActions.lastNestedWrapGNT = null;
    const promise = mockDate('2018-06-05', () => store.dispatch(wrapUnwrap.testActions.wrapGNTTokenEpic({
      onCancelCleanup: dispatchMockAction('onCancelCleanup', store.dispatch),
      onStart: dispatchMockAction('onStart', store.dispatch),
      onPending: dispatchMockAction('onPending', store.dispatch),
      onCompleted: dispatchMockAction('onCompleted', store.dispatch),
      onRejected: dispatchMockAction('onRejected', store.dispatch),
    }, {
      doWrapGNTTokenAction: () => async () => ({value: '0xabcd'}),
      doAddTransactionEpic: () => async () => ({value: '0xcdef'}),
      doCreateGNTDepositBroker: () => async () => ({value: '0xef01'}),
      nextTransactionDelay: 0,
      doLoadDepositBrokerContractEpic: mockAction('loadDepositBrokerContractEpic'),
      doClearDepositBrokerEpic: mockAction('clearDepositBrokerEpic'),
      doLoadGNTBrokerAddressEpic: mockAction('loadGNTBrokerAddressEpic'),
      nestedDispatch: (...args) => mockDate('2018-06-06', () => args[0](...args.slice(1))),
    })));

    const result = await mockDatePromise('2018-06-05', promise);
    const promise2 = result.transactionConfirmationPromise;
    const result2 = await promise2;
    const promise3 = wrapUnwrap.testActions.lastNestedWrapGNT;
    const result3 = await mockDatePromise('2018-06-07', promise3);

    expect(result).toMatchSnapshot();
    expect(result2).toMatchSnapshot();
    expect(result3).toMatchSnapshot();
    expect(store.getActions()).toMatchSnapshot();
  });

});

describe('unwrapGNTTokenEpic', () => {

  test('main', async () => {
    const store = configureMockStore([thunk])(Map({}));

    const promise = mockDate('2018-06-05', () => store.dispatch(wrapUnwrap.testActions.unwrapGNTTokenEpic({
      onCancelCleanup: dispatchMockAction('onCancelCleanup', store.dispatch),
      onStart: dispatchMockAction('onStart', store.dispatch),
      onPending: dispatchMockAction('onPending', store.dispatch),
      onCompleted: dispatchMockAction('onCompleted', store.dispatch),
      onRejected: dispatchMockAction('onRejected', store.dispatch),
    }, {
      doUnwrapGNTToken: () => async () => ({value: '0xabcd'}),
      doAddTransactionEpic: () => async () => ({value: '0xcdef'}),
    })));

    const result = await mockDatePromise('2018-06-05', promise);
    const promise2 = result.transactionConfirmationPromise;
    const result2 = await promise2;

    expect(result).toMatchSnapshot();
    expect(result2).toMatchSnapshot();
    expect(store.getActions()).toMatchSnapshot();
  });

});
