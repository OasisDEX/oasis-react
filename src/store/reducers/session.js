import { createAction, handleActions } from 'redux-actions';
import Immutable                       from 'immutable';
import web3                            from '../../bootstrap/web3';

import { fulfilled, pending, rejected } from '../../utils/store';

const TRADES_LIMIT = 0;
const OFFER_LIMIT = 0;

const initialState = Immutable.fromJS({
                                        limitsLoaded: false,
                                        lastTradesLimit: TRADES_LIMIT,
                                        orderBookLimit: OFFER_LIMIT,
                                        'network': false,
                                        'loading': false,
                                        'loadingBuyOrders': true,
                                        'loadingSellOrders': true,
                                        'loadingProgress': 0,
                                        'loadingCounter': 0,
                                        'outOfSync': false,
                                        'syncing': false,
                                        'isConnected': false,
                                        'latestBlock': 0,
                                        'balanceLoaded': false,
                                        'allowanceLoaded': false,
                                        'ETHDepositProgress': 0,
                                        'ETHDepositProgressMessage': '',
                                        'ETHDepositErrorMessage': '',
                                        'ETHWithdrawProgress': 0,
                                        'ETHWithdrawProgressMessage': '',
                                        'ETHWithdrawErrorMessage': '',
                                        'GNTDepositProgress': 0,
                                        'GNTDepositProgressMessage': '',
                                        'GNTDepositErrorMessage': '',
                                        'GNTWithdrawProgress': 0,
                                        'GNTWithdrawProgressMessage': '',
                                        'GNTWithdrawErrorMessage': '',
                                        'loadingTradeHistory': true,
                                        'loadingIndividualTradeHistory': false, // this will be loading only if the user filter by closed status of orders
                                        'AVGBlocksPerDay': null,
                                        'watchedEvents': false,
//   if !Session.get'volumeSelector' {
//     'volumeSelector': 'quote':
//   }
                                      });

const INIT = 'SESSION/INIT';

const Init = createAction(
    INIT,
);

const actions = {};

const reducer = handleActions({}, initialState);

export default {
  actions,
  reducer,
};
