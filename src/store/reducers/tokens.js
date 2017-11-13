import { createAction, handleActions } from 'redux-actions';
import Immutable                       from 'immutable';

import { fulfilled, pending, rejected } from '../../utils/store';

const initialState = Immutable.fromJS({});

const INIT = 'TOKENS/INIT';
const SYNC_TOKENS = 'TOKENS/SYNC_TOKENS';

const Init = createAction(
    INIT,
    () => null,
);

const Sync = createAction(
    SYNC_TOKENS,
    () => {
      //   const network = Session.get('network');
      //   const address = web3Obj.eth.defaultAccount;
      //   if (address) {
      //     web3Obj.eth.getBalance(address, (error, balance) => {
      //       const newETHBalance = balance.toString(10);
      //       if (!error && !Session.equals('ETHBalance', newETHBalance)) {
      //         Session.set('ETHBalance', newETHBalance);
      //       }
      //     });
      //
      //     // Get GNTBalance
      //     // XXX EIP20
      //     Dapple.getToken('GNT', (error, token) => {
      //       if (!error) {
      //         token.balanceOf(address, (callError, balance) => {
      //           const newGNTBalance = balance.toString(10);
      //           if (!error && !Session.equals('GNTBalance', newGNTBalance)) {
      //             Session.set('GNTBalance', newGNTBalance);
      //           }
      //         });
      //         const broker = Session.get('GNTBroker');
      //         if (typeof broker === 'undefined' || broker === '0x0000000000000000000000000000000000000000') {
      //           Session.set('GNTBrokerBalance', 0);
      //         } else {
      //           token.balanceOf(broker, (callError, balance) => {
      //             if (!callError) {
      //               const newGNTBrokerBalance = balance.toString(10);
      //               Session.set('GNTBrokerBalance', newGNTBrokerBalance);
      //             }
      //           });
      //         }
      //       }
      //     });
      //
      //     // const ALL_TOKENS = _.uniq([Session.get('quoteCurrency'), Session.get('baseCurrency')]);
      //     const ALL_TOKENS = Dapple.getTokens();
      //
      //     if (network !== 'private') {
      //       // Sync token balances and allowances asynchronously
      //       ALL_TOKENS.forEach((tokenId) => {
      //         // XXX EIP20
      //         Dapple.getToken(tokenId, (error, token) => {
      //           if (!error) {
      //             token.balanceOf(address, (callError, balance) => {
      //               if (!error) {
      //                 super.upsert(tokenId, { $set: {
      //                     balance: convertTo18Precision(balance, tokenId).toString(10),
      //                     realBalance: balance.toString(10),
      //                   } });
      //                 Session.set('balanceLoaded', true);
      //                 if (tokenId === 'W-GNT') {
      //                   /**
      //                    * https://github.com/makerdao/token-wrapper/blob/master/src/wrapper.sol#L63
      //                    *
      //                    * Basically the argument is not used but since some changes in web3
      //                    * https://github.com/ethereum/web3.js/pull/866/commits/77da88a6718cf6eeb45e470104f95b8832f30e34
      //                    *
      //                    * which enforces you to use all arguments of a given method,
      //                    * we pass arbitrary address in order to circumvent the issue.
      //                    *
      //                    * Usage of Session.get('address') has NO MEANING whatsoever.
      //                    */
      //                   token.getBroker.call(Session.get('address'), (e, broker) => {
      //                     if (!e) {
      //                       super.upsert('W-GNT', { $set: { broker } });
      //                       Session.set('GNTBroker', broker);
      //                     }
      //                   });
      //                 }
      //               }
      //             });
      //             const contractAddress = Dapple['maker-otc'].environments[Dapple.env].otc.value;
      //             token.allowance(address, contractAddress, (callError, allowance) => {
      //               if (!error) {
      //                 super.upsert(tokenId, { $set: {
      //                     allowance: convertTo18Precision(allowance, tokenId).toString(10),
      //                     realAllowance: allowance.toString(10),
      //                   } });
      //                 Session.set('allowanceLoaded', true);
      //               }
      //             });
      //           }
      //         });
      //       });
      //     } else {
      //       ALL_TOKENS.forEach((token) => {
      //         super.upsert(token, { $set: { balance: '0', allowance: '0' } });
      //       });
      //     }
      //   }
    },
);

const actions = {
  Init,
  Sync,
};

const reducer = handleActions({}, initialState);

export default {
  actions,
  reducer,
};
