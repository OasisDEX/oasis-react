import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';


export const TRANSFER_TO_BROKER_GAS = 150000;
export const CLEAR_BROKER_GAS = 150000;

const initialState = Immutable.fromJS({});

const INIT = 'WGNT/INIT';
const WATCH_BROKER_CREATION = 'WGNT/WATCH_BROKER_CREATION';
const WATCH_BROKER_TRANSFER = 'WGNT/WATCH_BROKER_TRANSFER';
const WATCH_BROKER_CLEAR = 'WGNT/WATCH_BROKER_CLEAR';
const WATCH_WITHDRAW = 'WGNT/WATCH_WITHDRAW';

const init = createAction(
  INIT,
  () => null,
);

const actions = {
  init,

};

// const WatchBrokerCreation = createAction(
//   WATCH_BROKER_CREATION,
//   () => {
    // Transactions.observeRemoved('gnttokens_create_broker', (document) => {
    //   if (document.receipt.logs.length === 0) {
    //     Session.set('GNTDepositProgress', 0);
    //     Session.set('GNTDepositProgressMessage', '');
    //     Session.set('GNTDepositErrorMessage', 'Creating Broker went wrong. Please execute the desposit again.');
    //   } else {
    //     const broker = document.receipt.logs[0].topics[1];
    //     console.log('Broker: ', broker);
    //     Session.set('GNTDepositProgress', 40);
    //     Session.set('GNTDepositProgressMessage', 'Transfering to Broker... (Waiting for your approval)');
    //     // We get the broker, we transfer GNT to it
    //     Dapple.getToken('GNT', (err, gntToken) => {
    //       gntToken.transfer(broker, web3Obj.toWei(document.object.amount), { gas: TRANSFER_TO_BROKER_GAS },
    //                         (txError, tx) => {
    //                           if (!txError) {
    //                             console.log('TX Transfer to Broker:', tx);
    //                             Session.set('GNTDepositProgress', 50);
    //                             Session.set('GNTDepositProgressMessage',
    //                                         'Transfering to Broker... (waiting for transaction confirmation)');
    //                             Transactions.add('gnttokens_transfer', tx, { type: 'deposit', broker });
    //                           } else {
    //                             Session.set('GNTDepositProgress', 0);
    //                             Session.set('GNTDepositProgressMessage', '');
    //                             Session.set('GNTDepositErrorMessage', formatError(txError));
    //                           }
    //                         });
    //     });
    //   }
    // });
//   },
// );
// const WatchBrokerTransfer = createAction(
//   WATCH_BROKER_TRANSFER,
//   () => {
    // Transactions.observeRemoved('gnttokens_transfer', (document) => {
    //   if (document.receipt.logs.length === 0) {
    //     Session.set('GNTDepositProgress', 0);
    //     Session.set('GNTDepositProgressMessage', '');
    //     Session.set(
    //         'GNTDepositErrorMessage',
    //         'Transfering to Broker went wrong. Please execute the desposit again.',
    //     );
    //   } else {
    //     console.log('Transfer to Broker done');
    //     Session.set('GNTDepositProgress', 75);
    //     Session.set(
    //         'GNTDepositProgressMessage',
    //         'Clearing Broker... (Waiting for your approval)',
    //     );
    //     Dapple['token-wrapper'].classes.DepositBroker.at(
    //         document.object.broker.slice(-40))
    //                            .clear({ gas: CLEAR_BROKER_GAS },
    //                                   (txError, tx) => {
    //                                     if (!txError) {
    //                                       console.log('TX Clear Broker:', tx);
    //                                       Session.set(
    //                                           'GNTDepositProgress', 90);
    //                                       Session.set(
    //                                           'GNTDepositProgressMessage',
    //                                           'Clearing Broker... (waiting for transaction confirmation)',
    //                                       );
    //                                       Transactions.add(
    //                                           'gnttokens_clear', tx,
    //                                           { type: 'deposit' },
    //                                       );
    //                                     } else {
    //                                       Session.set(
    //                                           'GNTDepositProgress', 0);
    //                                       Session.set(
    //                                           'GNTDepositProgressMessage',
    //                                           '',
    //                                       );
    //                                       Session.set(
    //                                           'GNTDepositErrorMessage',
    //                                           formatError(txError),
    //                                       );
    //                                     }
    //                                   },
    //                            );
    //   }
    // });
  // },
// );

// const WatchBrokerClear = createAction(
//   WATCH_BROKER_CLEAR,
//   () => {
    // Transactions.observeRemoved('gnttokens_clear', (document) => {
    //   if (document.receipt.logs.length === 0) {
    //     Session.set('GNTDepositProgress', 0);
    //     Session.set('GNTDepositProgressMessage', '');
    //     Session.set(
    //         'GNTDepositErrorMessage',
    //         'Clearing Broker went wrong. Please execute the clearing manually again to get the wrapped coin.',
    //     );
    //   } else {
    //     Session.set('GNTDepositProgress', 100);
    //     Session.set('GNTDepositProgressMessage', 'Wrap Done!');
    //     Meteor.setTimeout(() => {
    //       Session.set('GNTDepositProgress', 0);
    //       Session.set('GNTDepositProgressMessage', '');
    //     }, 10000);
    //   }
    // });
  // },
// );

// const WatchWithdraw = createAction(
//   WATCH_WITHDRAW,
  // () => {
  //   Transactions.observeRemoved('gnttokens_withdraw', (document) => {
  //     if (document.receipt.logs.length === 0) {
  //       Session.set('GNTWithdrawProgress', 0);
  //       Session.set('GNTWithdrawProgressMessage', '');
  //       Session.set(
  //           'GNTWithdrawErrorMessage',
  //           'Withdrawing went wrong. Please execute the withdraw again.',
  //       );
  //     } else {
  //       Session.set('GNTWithdrawProgress', 100);
  //       Session.set('GNTWithdrawProgressMessage', 'Withdraw Done!');
  //       Meteor.setTimeout(() => {
  //         Session.set('GNTWithdrawProgress', 0);
  //         Session.set('GNTWithdrawProgressMessage', '');
  //       }, 10000);
  //     }
  //   });
  // },
// );

const reducer = handleActions({}, initialState);

export default {
  actions,
  reducer,
};
