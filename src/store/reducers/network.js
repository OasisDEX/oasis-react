import { createAction, handleActions } from 'redux-actions';
import Immutable                       from 'immutable';
import web3                            from '../../bootstrap/web3';

import { fulfilled, pending, rejected } from '../../utils/store';

const initialState = Immutable.fromJS({});

const CHECK_ACCOUNTS = 'NETWORK/CHECK_ACCOUNTS';
const CHECK_IF_USER_HAS_BALANCE_IN_OLD_WRAPPER = 'NETWORK/CHECK_IF_USER_HAS_BALANCE_IN_OLD_WRAPPER';
const CHECK_IF_ORDER_MATCHING_IS_ENABLED = 'NETWORK/CHECK_IF_ORDER_MATCHING_IS_ENABLED';
const CHECK_IF_BUY_ENABLED = 'NETWORK/CHECK_IF_BUY_ENABLED';
const DENOTE_PRECISION = 'NETWORK/DENOTE_PRECISION';
const INIT_NETWORK = 'NETWORK/INIT_NETWORK';
const CHECK_IF_MARKET_IS_OPEN = 'NETWORK/CHECK_IF_MARKET_IS_OPEN';
const CHECK_NETWORK = 'NETWORK/CHECK_NETWORK';

// Check which accounts are available and if defaultAccount is still available,
// Otherwise set it to localStorage, Session, or first element in accounts

const CheckAccounts = createAction(
    CHECK_ACCOUNTS,
    function checkAccounts() {
      return new Promise((resolve, reject) => {
        // web3Obj.eth.getAccounts((error, accounts) => {
        //   if (!error) {
        //     if (!_.contains(accounts, web3Obj.eth.defaultAccount)) {
        //       if (_.contains(accounts, localStorage.getItem('address'))) {
        //         web3Obj.eth.defaultAccount = localStorage.getItem('address');
        //       } else if (_.contains(accounts, Session.get('address'))) {
        //         web3Obj.eth.defaultAccount = Session.get('address');
        //       } else if (accounts.length > 0) {
        //         web3Obj.eth.defaultAccount = accounts[0];
        //       } else {
        //         web3Obj.eth.defaultAccount = undefined;
        //       }
        //     }
        //     localStorage.setItem('address', web3Obj.eth.defaultAccount);
        //     Session.set('address', web3Obj.eth.defaultAccount);
        //     Session.set('accounts', accounts);
        //     resolve(web3Obj.eth.defaultAccount);
        //   } else {
        //     reject();
        //   }
        // });
      });
    },
);

const CheckIfUserHasBalanceInOldWrapper = createAction(
    CHECK_IF_USER_HAS_BALANCE_IN_OLD_WRAPPER,
    function checkIfUserHasBalanceInOldWrapper(userAddress) {
      // Named the old wrapper - OW-ETH
      // Dapple.getToken('OW-ETH', (error, token) => {
      //   if (!error) {
      //     if (token) {
      //       token.balanceOf(userAddress, (err, balance) => {
      //         if (!error) {
      //           if (balance.toString(10) > 0) {
      //             $('#wrapperUpdate').modal({
      //                                         keyboard: false,
      //                                         show: true,
      //                                         backdrop: false,
      //                                       });
      //             $('#wrapperUpdate').on('shown.bs.modal', () => {
      //               $('.amount').
      //                   text(Blaze._globalHelpers.formatBalance(balance, 3, '',
      //                                                           false,
      //                   ));
      //               Session.set('oldWrapperBalance', balance.toString(10));
      //             });
      //           }
      //         } else {
      //           console.debug(`Couldn't get balance for ${userAddress}.`, error);
      //         }
      //       });
      //     }
      //   } else {
      //     console.debug(`Cannot extract information for ${token} `, error);
      //   }
      // });
    }
);


const CheckIfOrderMatchingIsEnabled = createAction(
    CHECK_IF_ORDER_MATCHING_IS_ENABLED,
    async function checkIfOrderMatchingEnabled(marketType) {
      // return new Promise((resolve, reject) => {
      //   if (marketType !== 'MatchingMarket') {
      //     Session.set('isMatchingEnabled', false);
      //     resolve();
      //   } else {
      //     Dapple['maker-otc'].objects.otc.matchingEnabled((error, status) => {
      //       if (!error) {
      //         Session.set('isMatchingEnabled', status);
      //         resolve();
      //       } else {
      //         console.debug('Cannot identify order matching status. ', error);
      //         reject(error);
      //       }
      //     });
      //
      //     Dapple['maker-otc'].objects.otc.LogMatchingEnabled(
      //         {},
      //         { fromBlock: 'latest' },
      //         (err, status) => {
      //           if (!err) {
      //             Session.set(
      //                 'isMatchingEnabled',
      //                 status.args.isEnabled,
      //             );
      //           }
      //         },
      //     );
      //   }
      // });
    }
);

const CheckIfBuyEnabled = createAction(
    CHECK_IF_BUY_ENABLED,
    function checkIfBuyEnabled(marketType) {
      return new Promise((resolve, reject) => {
        // if (marketType !== 'MatchingMarket') {
        //   Session.set('isBuyEnabled', true);
        //   resolve();
        // } else {
        //   const abi = Dapple['maker-otc'].objects.otc.abi;
        //   const addr = Dapple['maker-otc'].environments[Dapple.env].otc.value;
        //
        //   const contract = web3Obj.eth.contract(abi).at(addr);
        //   contract.buyEnabled((error, result) => {
        //     if (!error) {
        //       Session.set('isBuyEnabled', result);
        //       resolve();
        //     } else {
        //       reject();
        //     }
        //   });
        //
        //   Dapple['maker-otc'].objects.otc.LogBuyEnabled({}, { fromBlock: 'latest' },
        //                                                 (err, status) => {
        //                                                   if (!err) {
        //                                                     Session.set(
        //                                                         'isBuyEnabled',
        //                                                         status.args.isEnabled,
        //                                                     );
        //                                                   }
        //                                                 },
        //   );
        // }
      });
    }
);

const DenotePrecision = createAction(
    DENOTE_PRECISION,
    function denotePrecision() {
      // const basePrecision = Dapple.getTokenSpecs(
      //     Session.get('baseCurrency')).precision;
      // const quotePrecision = Dapple.getTokenSpecs(
      //     Session.get('quoteCurrency')).precision;
      // const precision = basePrecision < quotePrecision ?
      //     basePrecision :
      //     quotePrecision;
      // Session.set('precision', precision);
      // // TODO: find away to place ROUNDING_MODE in here.
      // // Right now no matter where It is put , it's overridden with ROUNDING_MODE: 1 from web3 package config.
      // BigNumber.config({ DECIMAL_PLACES: precision });
    }
);


// Initialize everything on new network
const InitNetwork = createAction(
    INIT_NETWORK,
    function initNetwork(newNetwork) {
      // Dapple.init(newNetwork);
      // const market = Dapple['maker-otc'].environments.kovan.otc;
      // checkAccounts().then(checkIfUserHasBalanceInOldWrapper);
      // const isMatchingEnabled = checkIfOrderMatchingEnabled(market.type);
      // const isBuyEnabled = checkIfBuyEnabled(market.type);
      // Promise.all([isMatchingEnabled, isBuyEnabled]).then(() => {
      //   Session.set('network', newNetwork);
      //   Session.set('isConnected', true);
      //   Session.set('latestBlock', 0);
      //   Session.set('startBlock', 0);
      //   doHashChange();
      //   denotePrecision();
      //   Tokens.sync();
      //   Limits.sync();
      //   Offers.sync();
      // });
    }

)

// Check the closing time of the market and if it's open now
const CheckIfMarketIsOpen = createAction(
    CHECK_IF_MARKET_IS_OPEN,
    function checkMarketOpen() {
      // Offers.checkMarketOpen();
    }
)

// CHECK FOR NETWORK
const CheckNetwork = createAction(
    CHECK_NETWORK,
    function checkNetwork() {
      // if (Session.get('web3ObjReady') && typeof web3Obj !== 'undefined') {
      //   web3Obj.version.getNode((error) => {
      //     const isConnected = !error;
      //
      //     // Check if we are synced
      //     if (isConnected) {
      //       web3Obj.eth.getBlock('latest', (e, res) => {
      //         if (!e) {
      //           if (res && res.number >= Session.get('latestBlock')) {
      //             Session.set('outOfSync', e != null ||
      //                 (new Date().getTime() / 1000) - res.timestamp > 600);
      //             Session.set('latestBlock', res.number);
      //             if (Session.get('startBlock') === 0) {
      //               console.log(`Setting startblock to ${res.number - 6000}`);
      //               Session.set('startBlock', (res.number - 6000));
      //             }
      //           } else {
      //             // XXX MetaMask frequently returns old blocks
      //             // https://github.com/MetaMask/metamask-plugin/issues/504
      //             console.debug('Skipping old block');
      //           }
      //         } else {
      //           console.debug('There is error while getting the latest block! ', e);
      //         }
      //       });
      //     }
      //
      //     // Check which network are we connected to
      //     // https://github.com/ethereum/meteor-dapp-wallet/blob/90ad8148d042ef7c28610115e97acfa6449442e3/app/client/lib/ethereum/walletInterface.js#L32-L46
      //     if (!Session.equals('isConnected', isConnected)) {
      //       if (isConnected === true) {
      //         web3Obj.version.getNetwork((e, res) => {
      //           let network = false;
      //           if (!e) {
      //             switch (res) {
      //               case '1':
      //                 network = 'main';
      //                 Session.set('AVGBlocksPerDay', 5760);
      //                 break;
      //               case '42':
      //                 network = 'kovan';
      //                 Session.set('AVGBlocksPerDay', 21600);
      //                 break;
      //               default:
      //                 network = 'private';
      //             }
      //           }
      //           if (!Session.equals('network', network)) {
      //             initNetwork(network, isConnected);
      //           }
      //         });
      //       } else {
      //         Session.set('isConnected', isConnected);
      //         Session.set('network', false);
      //         Session.set('latestBlock', 0);
      //       }
      //     }
      //   });
      // }
    }
)

// $(window).on('hashchange', () => {
//   const baseBeforeChange = Session.get('baseCurrency');
//   const quoteBeforeChange = Session.get('quoteCurrency');
//   doHashChange();
//   const baseAfterChange = Session.get('baseCurrency');
//   const quoteAfterChange = Session.get('quoteCurrency');
//
//   if (Session.get('isMatchingEnabled')) {
//     if (baseAfterChange !== baseBeforeChange ||
//         quoteAfterChange !== quoteBeforeChange) {
//       Offers.sync();
//     }
//   }
//
//   denotePrecision();
// });

/***
 * Moved to session reducer
 */
// function initSession() {
//   Session.set('network', false);
//   Session.set('loading', false);
//   Session.set('loadingBuyOrders', true);
//   Session.set('loadingSellOrders', true);
//   Session.set('loadingProgress', 0);
//   Session.set('loadingCounter', 0);
//   Session.set('outOfSync', false);
//   Session.set('syncing', false);
//   Session.set('isConnected', false);
//   Session.set('latestBlock', 0);
//
//   Session.set('balanceLoaded', false);
//   Session.set('allowanceLoaded', false);
//   Session.set('limitsLoaded', false);
//
//   Session.set('ETHDepositProgress', 0);
//   Session.set('ETHDepositProgressMessage', '');
//   Session.set('ETHDepositErrorMessage', '');
//   Session.set('ETHWithdrawProgress', 0);
//   Session.set('ETHWithdrawProgressMessage', '');
//   Session.set('ETHWithdrawErrorMessage', '');
//   Session.set('GNTDepositProgress', 0);
//   Session.set('GNTDepositProgressMessage', '');
//   Session.set('GNTDepositErrorMessage', '');
//   Session.set('GNTWithdrawProgress', 0);
//   Session.set('GNTWithdrawProgressMessage', '');
//   Session.set('GNTWithdrawErrorMessage', '');
//   Session.set('loadingTradeHistory', true);
//   Session.set('loadingIndividualTradeHistory', false); // this will be loading only if the user filter by closed status of orders
//   Session.set('AVGBlocksPerDay', null);
//   Session.set('watchedEvents', false);
//   if (!Session.get('volumeSelector')) {
//     Session.set('volumeSelector', 'quote');
//   }
// }

const actions = {};

const reducer = handleActions({}, initialState);

export default {
  actions,
  reducer,
};
