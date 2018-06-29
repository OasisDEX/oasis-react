import { createAction, handleActions } from "redux-actions";
import { fromJS } from "immutable";
import { fulfilled } from "../../utils/store";
import { convertTo18Precision } from "../../utils/conversion";
import { TOKEN_DAI, TOKEN_DIGIX, TOKEN_MAKER, TOKEN_RHOC, TOKEN_WRAPPED_ETH } from '../../constants';

const initialState = fromJS({
  limitsLoaded: false,
  tokens: {
    [TOKEN_WRAPPED_ETH]: { minSell: null, maxSell: "100000000000000000000000" },
    [TOKEN_DAI]:         { minSell: null, maxSell: "100000000000000000000000000" },
    [TOKEN_MAKER]:       { minSell: null, maxSell: "100000000000000000000000" },
    [TOKEN_DIGIX]:       { minSell: null, maxSell: null },
    [TOKEN_RHOC]:        { minSell: null, maxSell: null },
  }
});

const init = createAction("LIMITS/INIT", () => null);

/**
 *
 */
const getTokenMinSell = createAction(
  "LIMITS/GET_MIN_SELL",
  () => async () => {}
);

/**
 * Get min sell limits for all tokens traded.
 */
const getAllTradedTokenMinSellLimits = createAction(
  "LIMITS/GET_ALL_TRADED_TOKENS_MIN_SELL",
  async (marketContract, tokensContractsLists) =>
    Promise.all(
      Object.entries(tokensContractsLists).map(([, tokenContract]) =>
        marketContract.getMinSell(tokenContract.address)
      )
    ).then(tokensMinSellLimits => {
      const limitsByTokenName = {};
      Object.keys(tokensContractsLists).forEach(
        (key, i) =>
          (limitsByTokenName[key] = convertTo18Precision(
            tokensMinSellLimits[i].toNumber(),
            key
          )).toString()
      );
      return limitsByTokenName;
    })
);

const actions = {
  init,
  getTokenMinSell,
  getAllTradedTokenMinSellLimits
};

const reducer = handleActions(
  {
    [fulfilled(getAllTradedTokenMinSellLimits)]: (state, { payload }) =>
      state
        .update("tokens", tokens => {
          Object.entries(payload).forEach(
            ([tokenName, tokenMinSell]) =>
              (tokens = tokens.setIn([tokenName, "minSell"], tokenMinSell))
          );
          return tokens;
        })
        .set("limitsLoaded", true)
  },
  initialState
);

export default {
  actions,
  reducer
};
