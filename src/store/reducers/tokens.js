import { createAction, handleActions } from "redux-actions";
import { fromJS } from "immutable";

import {
  BASE_TOKENS,
  QUOTE_TOKENS,
  TOKEN_1ST,
  TOKEN_AUGUR,
  TOKEN_BAT,
  TOKEN_DAI,
  TOKEN_DIGIX,
  TOKEN_GOLEM,
  TOKEN_GUP,
  TOKEN_ICONOMI,
  TOKEN_MAKER,
  TOKEN_MLN,
  TOKEN_NMR,
  TOKEN_PLUTON,
  TOKEN_RHOC,
  TOKEN_SAI,
  TOKEN_SINGULARDTV,
  TOKEN_TIME,
  TOKEN_VSL,
  TOKEN_WRAPPED_ETH,
  TOKEN_WRAPPED_GNT
} from "../../constants";
import { generateTradingPairs } from "../../utils/generateTradingPairs";
import tokens from "../selectors/tokens";
import offersReducer from "./offers";
import offers from "../selectors/offers";
import { STATUS_PRISTINE } from "./platform";
import { createPromiseActions } from "../../utils/createPromiseActions";
import balancesReducer from "./balances";

const initialState = fromJS({
  allTokens: [
    TOKEN_WRAPPED_ETH,
    TOKEN_MAKER,
    TOKEN_DIGIX,
    TOKEN_GOLEM,
    TOKEN_WRAPPED_GNT,
    TOKEN_AUGUR,
    TOKEN_ICONOMI,
    TOKEN_1ST,
    TOKEN_SINGULARDTV,
    TOKEN_VSL,
    TOKEN_PLUTON,
    TOKEN_MLN,
    TOKEN_RHOC,
    TOKEN_TIME,
    TOKEN_GUP,
    TOKEN_BAT,
    TOKEN_NMR,
    TOKEN_SAI,
    TOKEN_DAI
  ],
  erc20Tokens: [
    TOKEN_WRAPPED_ETH,
    TOKEN_DAI,
    TOKEN_SAI,
    TOKEN_MAKER,
    TOKEN_WRAPPED_GNT,
    TOKEN_AUGUR,
    TOKEN_TIME,
    TOKEN_SINGULARDTV,
    TOKEN_1ST,
    TOKEN_DIGIX,
    TOKEN_BAT,
    TOKEN_ICONOMI,
    TOKEN_MLN,
    TOKEN_PLUTON,
    TOKEN_RHOC,
    TOKEN_NMR,
    TOKEN_VSL
  ],
  baseTokens: BASE_TOKENS,
  quoteTokens: QUOTE_TOKENS,
  defaultBaseToken: TOKEN_MAKER,
  defaultQuoteToken: TOKEN_WRAPPED_ETH,
  precision: null,
  tradingPairs: generateTradingPairs(BASE_TOKENS, QUOTE_TOKENS),
  tokenSpecs: {
    "OW-ETH": { precision: 18, format: "0,0.00[0000000000000000]" },
    [TOKEN_WRAPPED_ETH]: { precision: 18, format: "0,0.00[0000000000000000]" },
    [TOKEN_DAI]: { precision: 18, format: "0,0.00[0000000000000000]" },
    [TOKEN_SAI]: { precision: 18, format: "0,0.00[0000000000000000]" },
    [TOKEN_MAKER]: { precision: 18, format: "0,0.00[0000000000000000]" },
    [TOKEN_DIGIX]: { precision: 9, format: "0,0.00[0000000]" },
    [TOKEN_GOLEM]: { precision: 18, format: "0,0.00[0000000000000000]" },
    [TOKEN_WRAPPED_GNT]: { precision: 18, format: "0,0.00[0000000000000000]" },
    [TOKEN_AUGUR]: { precision: 18, format: "0,0.00[0000000000000000]" },
    [TOKEN_ICONOMI]: { precision: 18, format: "0,0.00[0000000000000000]" },
    [TOKEN_1ST]: { precision: 18, format: "0,0.00[0000000000000000]" },
    [TOKEN_SINGULARDTV]: { precision: 0, format: "0,0" },
    [TOKEN_VSL]: { precision: 18, format: "0,0.00[0000000000000000]" },
    [TOKEN_PLUTON]: { precision: 18, format: "0,0.00[0000000000000000]" },
    [TOKEN_MLN]: { precision: 18, format: "0,0.00[0000000000000000]" },
    [TOKEN_RHOC]: { precision: 8, format: "0,0.00[000000]" },
    [TOKEN_TIME]: { precision: 8, format: "0,0.00[000000]" },
    [TOKEN_GUP]: { precision: 3, format: "0,0.00[0]" },
    [TOKEN_BAT]: { precision: 18, format: "0,0.00[0000000000000000]" },
    [TOKEN_NMR]: { precision: 18, format: "0,0.00[0000000000000000]" }
  },
  defaultTradingPair: { baseToken: TOKEN_MAKER, quoteToken: TOKEN_WRAPPED_ETH },
  activeTradingPair: null
});

const INIT = "TOKENS/INIT";
const SET_DEFAULT_TRADING_PAIR = "TOKENS/SET_DEFAULT_TRADING_PAIR";

const Init = createAction(INIT, () => null);

const setDefaultTradingPair = createAction(
  SET_DEFAULT_TRADING_PAIR,
  (baseToken, quoteToken) => ({ baseToken, quoteToken })
);

const setActiveTradingPair = createAction(
  "TOKENS/SET_ACTIVE_TRADING_PAIR",
  tradingPair => tradingPair
);

const setActiveTradingPairEpic = (args, sync = true) => (
  dispatch,
  getState
) => {
  const previousActiveTradingPair = tokens.activeTradingPair(getState());
  if (previousActiveTradingPair) {
    dispatch(getActiveTradingPairAllowanceStatus());
  }
  if (
    previousActiveTradingPair === null ||
    previousActiveTradingPair.baseToken !== args.baseToken ||
    previousActiveTradingPair.quoteToken !== args.quoteToken
  ) {
    dispatch(setActiveTradingPair(args));
    const currentActiveTradingPair = tokens.activeTradingPair(getState());
    if (
      sync &&
      offers.activeTradingPairOffersInitialLoadStatus(getState()) ===
        STATUS_PRISTINE
    ) {
      dispatch(offersReducer.actions.syncOffersEpic(currentActiveTradingPair));
    }
  }
};

const setPrecision = createAction(
  "TOKENS/SET_PRECISION",
  precision => precision
);

const denotePrecision = () => (dispatch, getState) => {
  const { baseToken, quoteToken } = tokens.activeTradingPair(getState());
  const basePrecision = tokens
    .getTokenSpecs(getState(), baseToken)
    .get("precision");
  const quotePrecision = tokens
    .getTokenSpecs(getState(), quoteToken)
    .get("precision");
  const precision =
    basePrecision < quotePrecision ? basePrecision : quotePrecision;
  dispatch(setPrecision(precision));
  // Session.set('precision', precision);
  // // TODO: find away to place ROUNDING_MODE in here.
  // // Right now no matter where It is put , it's overridden with ROUNDING_MODE: 1 from web3 package config.
  // BigNumber.config({ DECIMAL_PLACES: precision });
};

const getActiveTradingPairAllowanceStatus$ = createPromiseActions(
  "TOKENS/GET_ACTIVE_TRADING_PAIR_ALLOWANCE_STATUS"
);

const getActiveTradingPairAllowanceStatus = () => async (
  dispatch,
  getState
) => {
  dispatch(getActiveTradingPairAllowanceStatus$.pending());
  const tradingPair = tokens.activeTradingPair(getState()) !== null
    ? fromJS(tokens.activeTradingPair(getState()))
    : tokens.defaultTradingPair(getState());
  const [baseToken, quoteToken] = [
    tradingPair.get("baseToken"),
    tradingPair.get("quoteToken")
  ];
  await dispatch(
    balancesReducer.actions.getDefaultAccountTokenAllowanceForMarket(baseToken)
  );
  await dispatch(
    balancesReducer.actions.getDefaultAccountTokenAllowanceForMarket(quoteToken)
  );

  dispatch(getActiveTradingPairAllowanceStatus$.fulfilled());
};

const actions = {
  Init,
  setDefaultTradingPair,
  setActiveTradingPairEpic,
  denotePrecision,
  getActiveTradingPairAllowanceStatus
};

const reducer = handleActions(
  {
    [setDefaultTradingPair]: (state, { payload }) =>
      state.update("defaultTradingPair", () => payload),
    [setActiveTradingPair]: (state, { payload }) =>
      state.set("activeTradingPair", payload),
    [setPrecision]: (state, { payload }) => state.set("precision", payload)
  },
  initialState
);

export default {
  actions,
  reducer
};
