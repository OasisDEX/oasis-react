import { combineReducers } from 'redux-immutable';
import { routerReducer } from 'react-router-redux'

import platform from './platform';
import network from './network';
import markets from './markets';
import balances from './balances';
import orders from './orders';
import history from './transferHistory';
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
import offerTakes from './offerTakes';
import { reducer as formReducer } from 'redux-form/immutable'
import transactionWatchers from './transactionWatchers';
import timers from './timers';
import offerMakes from './offerMakes';
import transferHistory from './transferHistory';
import transfers from './transfers';
import tokenSelectors from './tokenSelectors';

export default combineReducers(
  {

    router: routerReducer,
    platform: platform.reducer,
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
    widgets: widgets.reducer,
    offerTakes: offerTakes.reducer,
    offerMakes: offerMakes.reducer,
    form: formReducer,
    transactionWatchers: transactionWatchers.reducer,
    timers: timers.reducer,
    transferHistory: transferHistory.reducer,
    transfers: transfers.reducer,
    tokenSelectors: tokenSelectors.reducer
  });
