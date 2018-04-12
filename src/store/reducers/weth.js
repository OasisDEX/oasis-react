import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

const initialState = fromJS({});

const INIT = 'WETH/INIT';
const WATCH_DEPOSIT = 'WETH/WATCH_DEPOSIT';
const WATCH_WITHDRAW = 'WETH/WATCH_WITHDRAW';

const Init = createAction(
  INIT,
  () => null,
);

const WatchDeposit = createAction(
  WATCH_DEPOSIT,
  () => {
    // Transactions.observeRemoved('ethtokens_deposit', (document) => {
    //   if (document.receipt.logs.length === 0) {
    //     Session.set('ETHDepositProgress', 0);
    //     Session.set('ETHDepositProgressMessage', '');
    //     Session.set(
    //         'ETHDepositErrorMessage',
    //         'Wrap went wrong. Please execute the wrap again.',
    //     );
    //   } else {
    //     Session.set('ETHDepositProgress', 100);
    //     Session.set('ETHDepositProgressMessage', 'Wrap Done!');
    //     Meteor.setTimeout(() => {
    //       Session.set('ETHDepositProgress', 0);
    //       Session.set('ETHDepositProgressMessage', '');
    //     }, 10000);
    //   }
    // });
  },
);

const WatchWithdraw = createAction(
  WATCH_WITHDRAW,
  () => {
    // Transactions.observeRemoved('ethtokens_withdraw', (document) => {
    //   if (document.receipt.logs.length === 0) {
    //     Session.set('ETHWithdrawProgress', 0);
    //     Session.set('ETHWithdrawProgressMessage', '');
    //     Session.set(
    //         'ETHWithdrawErrorMessage',
    //         'Unwrapping went wrong. Please execute the withdraw again.',
    //     );
    //   } else {
    //     Session.set('ETHWithdrawProgress', 100);
    //     Session.set('ETHWithdrawProgressMessage', 'Unwrap Done!');
    //     Meteor.setTimeout(() => {
    //       Session.set('ETHWithdrawProgress', 0);
    //       Session.set('ETHWithdrawProgressMessage', '');
    //     }, 10000);
    //   }
    // });
  },
);
const actions = {
  Init,
  WatchDeposit,
  WatchWithdraw,
};

const reducer = handleActions({}, initialState);

export default {
  actions,
  reducer,
};
