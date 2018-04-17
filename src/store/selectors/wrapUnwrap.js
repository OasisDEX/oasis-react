import { createSelector } from 'reselect';
import balances from './balances';
import { fromJS } from 'immutable';
import { TOKEN_ETHER } from '../../constants';
import reselect from '../../utils/reselect';
import web3 from '../../bootstrap/web3';
import { ADDRESS_HAS_NO_BROKER } from '../reducers/wrapUnwrap';

const wrapUnwrap = state => state.get('wrapUnwrap');

const wrapperTokenPairs = createSelector(
  wrapUnwrap,
  (s) => s.get('wrapperTokenPairs'),
);

const wrapUnwrapBalances = createSelector(
  wrapperTokenPairs,
  balances.tokenBalances,
  balances.ethBalance,
  (wrapperTokenPairs, tokenBalances, etherBalance) =>
    wrapperTokenPairs.map(
      wtp => {
        const [unwrappedToken, wrapperToken] = [wtp.get('unwrapped'), wtp.get('wrapper')];
        const unwrappedBalance = (
          unwrappedToken !== TOKEN_ETHER ? tokenBalances.get(unwrappedToken) : etherBalance
        );
        return fromJS({
          unwrappedToken,
          wrapperToken,
          unwrappedBalance,
          wrappedBalance: tokenBalances.get(wrapperToken),
        });
      },
    ),
);

const getBrokerAddress = createSelector(
  wrapUnwrap,
  reselect.getProps,
  (s, tokenName) => s.getIn(['brokerAddresses', tokenName])
);

const activeUnwrappedToken = createSelector(
  wrapUnwrap, s => s.get('activeUnwrappedToken')
);

const activeWrappedToken = createSelector(
  wrapperTokenPairs,
  activeUnwrappedToken,
  (wtp, ut) =>
    wtp.find(entry => entry.get('unwrapped') === ut
  ).get('wrapper')
);


const getActiveWrapUnwrapPair = createSelector(
  wrapperTokenPairs,
  activeUnwrappedToken,
  (wtp, aut) => wtp.find(item => item.get('unwrapped')=== aut)
);

const activeUnwrappedTokenBalance = createSelector(
  wrapUnwrapBalances,
  activeUnwrappedToken,
  (wub, activeUnwrappedToken, asBN = true) => {
    if (!activeUnwrappedToken) {
      return null;
    } else {
      const balance = wub.find(item => item.get('unwrappedToken') === activeUnwrappedToken).get('unwrappedBalance');
      if(asBN && balance) {
        return web3.toBigNumber(balance);
      } else {
        return balance;
      }
    }
  }
);

const activeWrappedTokenBalance = createSelector(
  wrapUnwrapBalances,
  activeWrappedToken,
  (wub, activeWrappedToken, asBN = true) => {
    if (!activeWrappedToken) {
      return null;
    } else if (wub) {
      const balances = wub.find(item => item.get('wrapperToken') === activeWrappedToken);
      if(asBN && balances) {
        return web3.toBigNumber(balances.get('wrappedBalance'));
      } else if (balances) {
        return balances.get('wrappedBalance');
      } else {
        return null;
      }
    }
  }
);

const loadedBrokerContractsList = createSelector(
  wrapUnwrap,
  s => s.get('loadedBrokerContracts')
);

const hasTokenBroker = createSelector(
  wrapUnwrap,
  reselect.getProps,
  (s, tokenName) => s.getIn(['brokerAddresses', tokenName]) !== ADDRESS_HAS_NO_BROKER
);

const isTokenBrokerInitiallyLoaded = createSelector(
  wrapUnwrap,
  reselect.getProps,
  (s, tokenName) => s.getIn(['brokerAddresses', tokenName]) !== null
);

const isBrokerContractLoaded = createSelector(
  loadedBrokerContractsList,
  reselect.getProps,
  (lbcl, tokenName) => lbcl.includes(tokenName)
);


const activeTokenWrapStatus = createSelector(
  wrapUnwrap, s => s.get('activeTokenWrapStatus')
);

const activeTokenUnwrapStatus = createSelector(
  wrapUnwrap, s => s.get('activeTokenUnwrapStatus')
);


export default {
  state: wrapUnwrap,
  wrapperTokenPairs,
  wrapUnwrapBalances,
  getBrokerAddress,
  activeUnwrappedToken,
  activeWrappedToken,
  activeUnwrappedTokenBalance,
  activeWrappedTokenBalance,
  getActiveWrapUnwrapPair,
  isBrokerContractLoaded,
  hasTokenBroker,
  isTokenBrokerInitiallyLoaded,
  activeTokenWrapStatus,
  activeTokenUnwrapStatus
};