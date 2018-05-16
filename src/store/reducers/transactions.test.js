import thunk from "redux-thunk";
import promiseMiddleware from 'redux-promise-middleware';
import configureMockStore from "redux-mock-store";
import thunk2Data from "../thunk2Data";
import transactions, {TRANSACTION_IS_CONFIRMED, TRANSACTION_IS_REJECTED} from './transactions';

import each from 'jest-each';

const testCases = [
  ['transaction confirmed', () => () => Promise.resolve({value: {status: TRANSACTION_IS_CONFIRMED}})],
  ['transaction rejected', () => () => Promise.resolve({value: {status: TRANSACTION_IS_REJECTED}})],
  ['intermediate error', jest.fn()
    .mockReturnValueOnce(() => Promise.reject("web3js error!"))
    .mockReturnValueOnce(() => Promise.reject("web3js error!"))
    .mockReturnValueOnce(() => Promise.reject("web3js error!"))
    .mockReturnValue(() => Promise.resolve({value: {status: TRANSACTION_IS_CONFIRMED}}))
  ],
];

each(testCases).describe("addTransactionEpic", (description, syncTransaction) => {

  test(description, async () => {

    const store = configureMockStore([thunk])({});

    const latestBlockNumber = jest.fn()
      .mockReturnValueOnce('a')
      .mockReturnValueOnce('b');

    const promise = store.dispatch(transactions.actions.addTransactionEpic(
      {
        txType: "fakeType",
        txHash: "fakeHash",
        txMeta: {},
        txDispatchedTimestamp: 12345,
        txStartTimestamp: 23456
      },
      {
        latestBlockNumber,
        syncTransaction,
        transactionCheckInterval: () => 1
      }));

    let result = undefined;

    try {
      result = await promise;
    } catch (e) {
      result = e;
    }

    result.txStats.txEndTimestamp = 123456;

    expect(result).toMatchSnapshot();
    expect(store.getActions()).toMatchSnapshot();

  })
});