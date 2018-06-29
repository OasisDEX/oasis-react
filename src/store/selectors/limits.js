import {createSelector } from 'reselect';
import tokens from './tokens';
import web3 from '../../bootstrap/web3';
import reselect from '../../utils/reselect';
import {memoize} from 'lodash';

const limits = s => s.get('limits');

const tokenLimitsList = createSelector(
  limits,
  s => s.get('tokens')
);


const tokenMinSellLimitInWei = createSelector(
  tokenLimitsList,
  s => memoize(tokenName =>
    s.getIn([tokenName, 'minSell'])
  )
);

const tokenMaxSellLimitInWei = createSelector(
  tokenLimitsList,
  reselect.getProps,
  (s, tokenName) => s.getIn([tokenName, 'maxSell'])
);

const activeTradingPairQuoteTokenMaxLimitInWei = createSelector(
  tokenLimitsList,
  tokens.activeTradingPairQuoteToken,
  (s, tokenName) => s.getIn([tokenName, 'maxSell'])
);

const activeTradingPairQuoteTokenMaxLimitInEther = createSelector(
  tokenLimitsList,
  tokens.activeTradingPairQuoteToken,
  (s, tokenName) => web3.fromWei(s.getIn([tokenName, 'maxSell']))
);

const tokenMaxSellLimitInEther = createSelector(
  tokenLimitsList,
  reselect.getProps,
  (s, tokenName) => web3.fromWei(s.getIn([tokenName, 'maxSell']))
);


const tokenMinSellLimitInEther = createSelector(
  tokenLimitsList,
  s => memoize(tokenName =>
    web3.fromWei(s.getIn([tokenName, 'minSell']))
  )
);


const quoteTokenMinSellLimitInWei = createSelector(
  tokenLimitsList,
  tokens.activeTradingPairQuoteToken,
  (s, quoteToken) => s.getIn([quoteToken, 'minSell'])
);

const quoteTokenMinSellLimitInEther = createSelector(
  tokenLimitsList,
  tokens.activeTradingPairQuoteToken,
  (s, quoteToken) => web3.fromWei(s.getIn([quoteToken, 'minSell']))
);

export default {
  state: limits,
  tokenLimitsList,
  quoteTokenMinSellLimitInWei,
  quoteTokenMinSellLimitInEther,
  tokenMinSellLimitInWei,
  tokenMinSellLimitInEther,
  tokenMaxSellLimitInWei,
  tokenMaxSellLimitInEther,
  activeTradingPairQuoteTokenMaxLimitInWei,
  activeTradingPairQuoteTokenMaxLimitInEther
};
