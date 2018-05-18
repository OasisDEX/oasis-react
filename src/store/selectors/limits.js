import {createSelector } from 'reselect';
import tokens from './tokens';
import web3 from '../../bootstrap/web3';
import reselect from '../../utils/reselect';
const limits = s => s.get('limits');


const tokenLimitsList = createSelector(
  limits,
  s => s.get('tokens')
);


const tokenMinSellLimitInWei = createSelector(
  tokenLimitsList,
  reselect.getProps,
  (s, tokenName) => s.getIn([tokenName, 'minSell'])
);


const tokenMinSellLimitInEther = createSelector(
  tokenLimitsList,
  reselect.getProps,
  (s, tokenName) => web3.fromWei(s.getIn([tokenName, 'minSell']))
);


const quoteTokenMinSellLimitInWei = createSelector(
  tokenLimitsList,
  tokens.activeTradingPairBaseToken,
  (s, quoteToken) => s.getIn([quoteToken, 'minSell'])
);

const quoteTokenMinSellLimitInEther = createSelector(
  tokenLimitsList,
  tokens.activeTradingPairBaseToken,
  (s, quoteToken) => web3.fromWei(s.getIn([quoteToken, 'minSell']))
);


export default {
  state: limits,
  quoteTokenMinSellLimitInWei,
  quoteTokenMinSellLimitInEther,
  tokenMinSellLimitInWei,
  tokenMinSellLimitInEther
};