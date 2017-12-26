import { combineReducers } from 'redux-immutable';

import platform from './platform';
import network from './network';
import markets from './markets';
import balances from './balances';
import orders from './orders';
import history from './history';
import limits from './limits';
import offers from './offers';
import tokenEvents from './tokenEvents';
import tokens from './tokens';
import transactions from './transactions';
import weth from './weth';
import wgnt from './wgnt';
import session from './session';
import contracts from './contracts';
import accounts from './accounts';
import trades from './trades';
import widgets from './widgets';

export default combineReducers(
  {
    platform: platform.reducer,
    bootstrap: platform.reducer,
    network: network.reducer,
    markets: markets.reducer,
    balances: balances.reducer,
    orders: orders.reducer,
    history: history.reducer,
    limits: limits.reducer,
    offers: offers.reducer,
    tokenEvents: tokenEvents.reducer,
    tokens: tokens.reducer,
    transactions: transactions.reducer,
    weth: weth.reducer,
    wgnt: wgnt.reducer,
    session: session.reducer,
    contracts: contracts.reducer,
    accounts: accounts.reducer,
    trades: trades.reducer,
    widgets: widgets.reducer
  });
