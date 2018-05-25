import thunk from "redux-thunk";
import configureMockStore from "redux-mock-store";
import transactions, {TRANSACTION_IS_CONFIRMED, TRANSACTION_IS_REJECTED} from './transactions';

import each from 'jest-each';

const testCases = [
  ['transaction confirmed', () => () => Promise.resolve({value: {status: TRANSACTION_IS_CONFIRMED}})],
  ['transaction rejected', () => () => Promise.resolve({value: {status: TRANSACTION_IS_REJECTED}})],
  ['intermediate error', jest.fn()
    .mockReturnValueOnce(() => Promise.reject("web3js test error!"))
    .mockReturnValueOnce(() => Promise.reject("web3js test error!"))
    .mockReturnValueOnce(() => Promise.reject("web3js test error!"))
    .mockReturnValue(() => Promise.resolve({value: {status: TRANSACTION_IS_CONFIRMED}}))
  ],
];

each(testCases).describe("addTransactionEpic", (description, sync) => {

  test(description, async () => {

    const store = configureMockStore([thunk])({});

    const latestBlockNumber = jest.fn()
      .mockReturnValueOnce('a')
      .mockReturnValueOnce('b')
      .mockReturnValueOnce('c')
      .mockReturnValueOnce('d');

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
        sync,
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