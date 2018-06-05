import {handleTransaction} from './handleTransaction';
import { fromJS } from "immutable";
import {
  TX_STATUS_ERROR,
  TX_STATUS_CANCELLED_BY_USER,
} from '../../store/reducers/transactions';

describe("handleTransaction", () => {
  test('transactionType not set, should throw error', async () => {
    expect(() => {
      handleTransaction({});
    }).toThrow();
  });

  test('no transactionActionResult', async () => {
    const result = handleTransaction({
      transactionType: 'transactionType',
      transactionDispatcher: () => Promise.resolve(undefined),
    });

    await expect(result).rejects.toEqual({
      status: TX_STATUS_ERROR,
      message: 'No response from transactionDispatcher!'})
  });

  test('transaction rejected', async () => {

    const onTransactionCancelled = jest.fn();
    const onCancelCleanup = jest.fn();

    const result = handleTransaction({
      transactionType: 'transactionType',
      transactionDispatcher: () => Promise.reject(undefined),
      onTransactionCancelled,
      withCallbacks: { onCancelCleanup },
    });

    await expect(result).resolves.toEqual({status: TX_STATUS_CANCELLED_BY_USER});
    expect(onTransactionCancelled.mock.calls.length).toBe(1);
    expect(onCancelCleanup.mock.calls.length).toBe(1);
  });

  test('transaction accepted and completed', async () => {

    const dispatch = jest.fn(x => x);
    const onTransactionPending = jest.fn();
    const onPending = jest.fn();

    const onTransactionCompleted = jest.fn();
    const onCompleted = jest.fn();

    const transaction = { value: 'hash' };
    const transactionDispatcher = jest.fn().mockReturnValueOnce(Promise.resolve(transaction));

    const transactionConfirmation = { _meta: 'transactionConfirmation' };
    const addTransactionEpic = jest.fn().mockReturnValueOnce(Promise.resolve(transactionConfirmation));

    const result = await handleTransaction(
      {
        dispatch,
        transactionType: 'transactionType',
        transactionDispatcher,
        onTransactionPending,
        onTransactionCompleted,
        withCallbacks: { onPending, onCompleted },
      },
      {
        addTransactionEpic
      });

    expect(result.transactionHash).toBe(transaction.value);

    expect(result.transactionConfirmationPromise).resolves.toEqual(fromJS(transactionConfirmation));

    expect(onTransactionPending.mock.calls.length).toBe(1);
    expect(onPending.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls.length).toBe(1);
    expect(onCompleted.mock.calls.length).toBe(1);
    expect(onTransactionCompleted.mock.calls.length).toBe(1);
  });

  test('transaction accepted and failed', async () => {

    const dispatch = jest.fn(x => x);
    const onTransactionPending = jest.fn();
    const onPending = jest.fn();

    const onTransactionRejected = jest.fn();
    const onRejected = jest.fn();

    const transaction = { value: 'hash' };
    const transactionDispatcher = jest.fn().mockReturnValueOnce(Promise.resolve(transaction));

    const transactionRejection = { _meta: 'transactionRejection' };
    const addTransactionEpic = jest.fn().mockReturnValueOnce(Promise.reject(transactionRejection));

    const result = await handleTransaction(
      {
        dispatch,
        transactionType: 'transactionType',
        transactionDispatcher,
        onTransactionPending,
        onTransactionRejected,
        withCallbacks: { onPending, onRejected},
      },
      {
        addTransactionEpic
      });

    expect(result.transactionHash).toBe(transaction.value);

    expect(result.transactionConfirmationPromise).resolves.toEqual(undefined);

    expect(onTransactionPending.mock.calls.length).toBe(1);
    expect(onPending.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls.length).toBe(1);
    expect(onRejected.mock.calls.length).toBe(1);
    expect(onTransactionRejected.mock.calls.length).toBe(1);
  });
});
