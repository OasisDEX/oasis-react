/* eslint-disable no-unused-vars */
import transactions, {
  TX_STATUS_AWAITING_CONFIRMATION,
  TX_STATUS_AWAITING_USER_ACCEPTANCE,
  TX_STATUS_CANCELLED_BY_USER,
  TX_STATUS_CONFIRMED,
  TX_STATUS_ERROR
} from "../../store/reducers/transactions";
import { fromJS } from "immutable";
import { getTimestamp } from "../time";

/**
 *

 * @param dispatch                              The dispatch function passed from Epic.

 * @param transactionDispatcher    [required]   The callback that returns dispatched action (payload !must be a promose! )

 * @param transactionType          [required]   Transaction type ( one of the types defined in transactions reducer )

 * @param txMeta:                  [optional]   Transaction meta data ( can me any type ).

 * @param onTransactionCancelled   [optional]   Function passed from within the Epic -> handles user cancel.
 * @param onTransactionPending     [optional]   Function passed from within the Epic -> handles transaction start.
 * @param onTransactionCompleted  [optional]    Function passed from within the Epic -> handles transaction complete (with success !).

 * @param onTransactionRejected   [optional]    Function passed from within the Epic -> handles transaction complete (with failure !).
 * @param callsNext               [optional]    Needs to be set to true if we call next transaction from *onCallNextTransaction*
 * @param onCallNextTransaction   [optional]    Called when callsNext is set to true.
 * @param nextTransactionDelay    [optional]    Delay *onCallNextTransaction* by n ms.
 * @param onStart                 [optional]    Function passed from the component dispatching the action
 *                                              called on before start (just after users calls action creator ).
 * @param onPending               [optional]    Function passed from the component dispatching the action
 *                                              called on transaction start (just after users calls action creator ).
 * @param onCompleted             [optional]    Function passed from the component dispatching the action
 *                                              called on transaction completion ).
 * @param onCancelCleanup         [optional]    Function passed from the component dispatching the action.

 * @param onRejected
 * @param addTransactionEpic
 * @returns {Promise}
 */
const handleTransaction = (
  {
    dispatch,
    transactionDispatcher,
    transactionType,
    txMeta,
    onTransactionCancelled,
    onTransactionPending,
    onTransactionCompleted,
    onTransactionRejected,
    callsNext,
    onCallNextTransaction,
    nextTransactionDelay,
    withCallbacks: {
      onCancelCleanup,
      onStart,
      onPending,
      onCompleted,
      onRejected
    } = {}
  },
  { addTransactionEpic = transactions.actions.addTransactionEpic } = {}
) => {
  // console.log('handleTransaction');

  if (!transactionType) {
    throw new Error("Transaction type not set!");
  }

  return new Promise(async (resolve, reject) => {
    const txDispatchedTimestamp = getTimestamp();
    onStart && onStart(txDispatchedTimestamp, txMeta);

    const transactionActionResult = await transactionDispatcher().catch(() => {
      /**
       *  First call Epic clean up.
       */
      onTransactionCancelled && onTransactionCancelled();
      /**
       * Then continue with component calling the action
       */
      onCancelCleanup && onCancelCleanup();
      resolve({status: TX_STATUS_CANCELLED_BY_USER});
    });

    // console.log('transactionActionResult', transactionActionResult);

    if (transactionActionResult) {
      const txStartTimestamp = getTimestamp();
      const transactionHash = transactionActionResult.value;
      onTransactionPending &&
        onTransactionPending({
          txHash: transactionHash,
          txStartTimestamp,
          txMeta
        });
      const transactionConfirmationPromise = dispatch(
        addTransactionEpic({
          txType: transactionType,
          txHash: transactionHash,
          txMeta,
          txDispatchedTimestamp,
          txStartTimestamp
        })
      );

      onPending && onPending({ txHash: transactionHash, txStartTimestamp });

      resolve({
        status: TX_STATUS_CONFIRMED,
        transactionConfirmationPromise: transactionConfirmationPromise
          .then(to => {
            //First run Epic completion handler
            onTransactionCompleted && onTransactionCompleted(to);
            //Then continue with component calling the action
            onCompleted && onCompleted(to, callsNext);
            if (callsNext) {
              if (nextTransactionDelay) {
                setTimeout(
                  () => onCallNextTransaction(to, txMeta),
                  nextTransactionDelay
                );
              } else {
                onCallNextTransaction(to, txMeta);
              }
            }
            return fromJS(to);
          })
          .catch(to => {
            onTransactionRejected && onTransactionRejected(to);
            onRejected && onRejected(to);
          }),
        transactionHash
      });
    } else {
      reject({
        status: TX_STATUS_ERROR,
        message: "No response from transactionDispatcher!"
      });
    }
  });
};

export { handleTransaction };
