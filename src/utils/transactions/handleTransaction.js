/* eslint-disable no-unused-vars */
import transactions, {
  TX_STATUS_AWAITING_CONFIRMATION, TX_STATUS_AWAITING_USER_ACCEPTANCE,
  TX_STATUS_CANCELLED_BY_USER, TX_STATUS_CONFIRMED,
} from '../../store/reducers/transactions';
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
 * @param onTransactionCompleted  [optional]    Function passed from within the Epic -> handles transaction complete.

 * @param onStart                 [optional]    Function passed from the component dispatching the action
 *                                              called on before start (just after users calls action creator ).
 * @param onPending               [optional]    Function passed from the component dispatching the action
 *                                              called on transaction start (just after users calls action creator ).
 * @param onCompleted             [optional]    Function passed from the component dispatching the action
 *                                              called on transaction completion ).
 * @param onCancelCleanup         [optional]    Function passed from the component dispatching the action.

 * @returns {Promise}
 */
const handleTransaction = async ({
  dispatch,
  transactionDispatcher,
  transactionType,
  txMeta,
  onTransactionCancelled,
  onTransactionPending,
  onTransactionCompleted,
  withCallbacks: { onCancelCleanup, onStart, onPending, onCompleted }
}) =>
  new Promise(async (resolve, reject) => {
    if (!transactionType) {
      throw new Error("Transaction type not set!");
    }

    const txDispatchedTimestamp = getTimestamp();
    onStart && onStart(txDispatchedTimestamp);
    const transactionActionResult = await transactionDispatcher().catch(() => {
      /**
       *  First call Epic clean up.
       */
      onTransactionCancelled && onTransactionCancelled();
      /**
       * Then continue with component calling the action
       */
      onCancelCleanup && onCancelCleanup();
      reject(TX_STATUS_CANCELLED_BY_USER);
    });

    if (transactionActionResult) {
      const txStartTimestamp = getTimestamp();
      const transactionHash = transactionActionResult.value;
      onTransactionPending && onTransactionPending();
      const transactionConfirmationPromise = dispatch(
        transactions.actions.addTransactionEpic({
          txType: transactionType,
          txHash: transactionHash,
          txMeta,
          txDispatchedTimestamp,
          txStartTimestamp
        })
      );
      onPending && onPending(txStartTimestamp);
      resolve({
        transactionConfirmationPromise: transactionConfirmationPromise.then(
          to => {
            /**
             * First run Epic completion handler
             */
            onTransactionCompleted && onTransactionCompleted();
            /**
             * Then continue with component calling the action
             */
            onCompleted && onCompleted();
            return fromJS(to);
          }
        ),
        transactionHash
      });
    }
  });

/**
 *
 * @param updateState function that handles component state modification ( typically *setState* )
 * @param transactionAction action creator function that dispatches the transaction
 */
const withHandleTransaction = (updateState, transactionAction) => {
  updateState({
    transaction: fromJS({
      txStatus: TX_STATUS_AWAITING_USER_ACCEPTANCE
    })
  });

  console.log(TX_STATUS_AWAITING_USER_ACCEPTANCE, Date.now());
  transactionAction().then(
    async ({ transactionConfirmationPromise, transactionHash }) => {
      updateState({
        transaction: fromJS({
          txStatus: TX_STATUS_AWAITING_CONFIRMATION,
          timestamp: Date.now(),
          txHash: transactionHash
        })
      });
      updateState({
        transaction: fromJS({
          txStatus: TX_STATUS_CONFIRMED,
          transactionReceipt: await transactionConfirmationPromise
        })
      });
    },
    transactionRejection => {
      updateState({
        transaction: fromJS({ txStatus: TX_STATUS_CANCELLED_BY_USER })
      });

      return transactionRejection;
    }
  );
};

const isTransactionConfirmed = ({ transaction }) =>
  transaction && transaction.get("txStatus") === TX_STATUS_CONFIRMED;

export { handleTransaction, withHandleTransaction, isTransactionConfirmed };
