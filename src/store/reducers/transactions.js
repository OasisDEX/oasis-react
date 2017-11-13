import { createAction, handleActions } from 'redux-actions';
import Immutable                       from 'immutable';

import { fulfilled, pending, rejected } from '../../utils/store';

const initialState = Immutable.fromJS({});

const INIT = 'TRANSACTIONS/INIT';
const ADD_TRANSACTION = 'TRANSACTIONS/ADD_TRANSACTION';
const SYNC_TRANSACTION = 'TRANSACTIONS/SYNC_TRANSACTION';
const OBSERVE_REMOVED = 'TRANSACTIONS/OBSERVE_REMOVED';
const SYNC_TRANSACTIONS = 'TRANSACTIONS/SYNC_TRANSACTIONS';

const Init = createAction(
    INIT,
    () => null,
);

const AddTransaction = createAction(
    ADD_TRANSACTION,
    (type, transactionHash, object) => {
      // console.log('tx', type, transactionHash, object);
      // super.insert({ type, tx: transactionHash, object });
    },
);

const FindType = async () => (type) => {
  // return super.find({ type }).map(value => value.object);
};

const ObserveRemoved = createAction(
    OBSERVE_REMOVED,
    (type, callback) => {
      // return super.find({ type }).observe({ removed: callback });
    },
);

const SyncTransaction = createAction(
    SYNC_TRANSACTION,
    (index) => {
      // if (index >= 0 && index < open.length) {
      //   const document = open[index];
      //   web3Obj.eth.getTransactionReceipt(document.tx, (error, result) => {
      //     if (!error && result != null) {
      //       if (result.logs.length > 0) {
      //         console.log('tx_success', document.tx, result.gasUsed);
      //       } else {
      //         console.error('tx_oog', document.tx, result.gasUsed);
      //       }
      //       super.update({tx: document.tx}, {$set: {receipt: result}}, () => {
      //         super.remove({tx: document.tx});
      //       });
      //     }
      //     // Sync next transaction
      //     syncTransaction(index + 1);
      //   });
      // }
    },
);

const SyncTransactions = createAction(
    SYNC_TRANSACTIONS,
    () => {
      // const open = super.find().fetch();
      // Sync all open transactions non-blocking and asynchronously
      // syncTransaction(0);
    },
);

const actions = {
  Init,
  AddTransaction,
  FindType,
  ObserveRemoved,
  SyncTransaction,
};

const reducer = handleActions({}, initialState);

export default {
  actions,
  reducer,
};
