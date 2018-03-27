import { createSelector } from 'reselect';
import balances from './balances';
import { fromJS } from 'immutable';
import { TOKEN_ETHER } from '../../constants';
import reselect from '../../utils/reselect';

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
  (s, tokenName) => s.getIn(['brokers', tokenName])
);

export default {
  state: wrapUnwrap,
  wrapperTokenPairs,
  wrapUnwrapBalances,
  getBrokerAddress
};