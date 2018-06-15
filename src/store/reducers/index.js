import { combineReducers } from "redux-immutable";
import { routerReducer } from "react-router-redux";

import platform from "./platform";
import network from "./network";
import markets from "./markets";
import balances from "./balances";
import history from "./transferHistory";
import limits from "./limits";
import offers from "./offers";
import tokens from "./tokens";
import transactions from "./transactions";
import session from "./session";
import accounts from "./accounts";
import trades from "./trades";
import offerTakes from "./offerTakes";
import { reducer as formReducer } from "redux-form/immutable";
import transactionWatchers from "./transactionWatchers";
import offerMakes from "./offerMakes";
import transferHistory from "./transferHistory";
import transfers from "./transfers";
import tokenSelectors from "./tokenSelectors";
import wrapUnwrap from "./wrapUnwrap";
import wrapUnwrapHistory from "./wrapUnwrapHistory";
import userTrades from "./userTrades";

export default combineReducers({
  router: routerReducer,
  platform: platform.reducer,
  network: network.reducer,
  markets: markets.reducer,
  balances: balances.reducer,
  history: history.reducer,
  limits: limits.reducer,
  offers: offers.reducer,
  tokens: tokens.reducer,
  transactions: transactions.reducer,
  session: session.reducer,
  accounts: accounts.reducer,
  trades: trades.reducer,
  userTrades: userTrades.reducer,
  offerTakes: offerTakes.reducer,
  offerMakes: offerMakes.reducer,
  form: formReducer,
  transactionWatchers: transactionWatchers.reducer,
  transferHistory: transferHistory.reducer,
  transfers: transfers.reducer,
  tokenSelectors: tokenSelectors.reducer,
  wrapUnwrap: wrapUnwrap.reducer,
  wrapUnwrapHistory: wrapUnwrapHistory.reducer
});
