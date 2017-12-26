import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';
import web3 from '../../bootstrap/web3';

import { fulfilled } from '../../utils/store';
import { createPromiseActions } from '../../utils/createPromiseActions';

const CHECK_IF_MARKET_IS_OPEN = 'MARKETS/CHECK_IF_MARKET_IS_OPEN';
const CHECK_MARKET_CLOSE_TIME = 'MARKETS/CHECK_MARKET_CLOSE_TIME';
const SET_ACTIVE_MARKET_ADDRESS = 'MARKETS/SET_ACTIVE_MARKET_ADDRESS';
const CHECK_IF_ORDER_MATCHING_IS_ENABLED = 'NETWORK/CHECK_IF_ORDER_MATCHING_IS_ENABLED';
const CHECK_IF_BUY_ENABLED = 'MARKETS/CHECK_IF_BUY_ENABLED';
const DENOTE_PRECISION = 'MARKETS/DENOTE_PRECISION';


const SUBSCRIBE___LOG_IS_MATCHING_ENABLED_EVENT = 'MARKETS/SUBSCRIBE___LOG_IS_MATCHING_ENABLED_EVENT';

const EVENT___LOG_IS_MATCHING_ENABLED = 'MARKETS/EVENT___LOG_IS_MATCHING_ENABLED';


const MARKET_TYPE_SIMPLE_MARKET = 'MARKET_TYPE_SIMPLE_MARKET';
const MARKET_TYPE_EXPIRING_MARKET = 'MARKET_TYPE_EXPIRING_MARKET';
const MARKET_TYPE_MATCHING_MARKET = 'MARKET_TYPE_MATCHING_MARKET';

const initialState = Immutable.fromJS({
  closeTime: null,
  isMarketOpen: null,
  isOrderMatchingEnabled: null,
  activeMarketOriginBlock: {
    number: null,
  },
  activeMarketAddress: null,
  marketType: MARKET_TYPE_MATCHING_MARKET,
});

const checkIfMarketIsOpen = createAction(
  CHECK_IF_MARKET_IS_OPEN,
  async () => window.contracts.market.isClosed().then(isClosed => !isClosed),
);

const checkMarketCloseTime = createAction(
  CHECK_MARKET_CLOSE_TIME,
  async () => window.contracts.market.close_time(),
);

const eventLogIsMatchingEnabled = createAction(
  EVENT___LOG_IS_MATCHING_ENABLED,
  (isEnabled) => isEnabled,
);

const subscribeLogMatchingEnabled = createPromiseActions(
  SUBSCRIBE___LOG_IS_MATCHING_ENABLED_EVENT
);
const subscribeLogMatchingEnabledEpic = () => async (dispatch, getState) => {
  dispatch(subscribeLogMatchingEnabled.pending());
  window.contracts.market.LogMatchingEnabled({}, { fromBlock: 'latest' })
    .then(
      status => dispatch(eventLogIsMatchingEnabled(status.args.isEnabled)),
    )
    .catch(
      e => dispatch(subscribeLogMatchingEnabled.rejected(e)),
    );
  dispatch(subscribeLogMatchingEnabled.fulfilled());
};

const checkIfOrderMatchingIsEnabled = createAction(
  CHECK_IF_ORDER_MATCHING_IS_ENABLED,
  async function checkIfOrderMatchingEnabled(marketType = MARKET_TYPE_MATCHING_MARKET) {
    return new Promise(async (resolve) => {
      if (marketType !== MARKET_TYPE_MATCHING_MARKET) {
        resolve(false);
      } else {
        resolve(await window.contracts.market.matchingEnabled());
      }
    });
  },
);

const setActiveMarketAddress = createAction(
  SET_ACTIVE_MARKET_ADDRESS,
  (address) => address
);

const checkIfBuyEnabled = createAction(
  CHECK_IF_BUY_ENABLED,
  () => window.contracts.market.buyEnabled()
);

const subscribeLogBuyEnabledEventEpic = () =>
  async () =>
    window.contracts.market.LogBuyEnabled({}, { fromBlock: 'latest' });

const DenotePrecision = createAction(
  DENOTE_PRECISION,
  function denotePrecision() {
    // const basePrecision = Dapple.getTokenSpecs(
    //     Session.get('baseCurrency')).precision;
    // const quotePrecision = Dapple.getTokenSpecs(
    //     Session.get('quoteCurrency')).precision;
    // const precision = basePrecision < quotePrecision ?
    //     basePrecision :
    //     quotePrecision;
    // Session.set('precision', precision);
    // // TODO: find away to place ROUNDING_MODE in here.
    // // Right now no matter where It is put , it's overridden with ROUNDING_MODE: 1 from web3 package config.
    // BigNumber.config({ DECIMAL_PLACES: precision });
  },
);


const GetTokenPairPrecision = createAction(
  DENOTE_PRECISION,
  () => {
    // const basePrecision = Dapple.getTokenSpecs(
    //     Session.get('baseCurrency')).precision;
    // const quotePrecision = Dapple.getTokenSpecs(
    //     Session.get('quoteCurrency')).precision;
    // const precision = basePrecision < quotePrecision ?
    //     basePrecision :
    //     quotePrecision;
    // Session.set('precision', precision);
    // // TODO: find away to place ROUNDING_MODE in here.
    // // Right now no matter where It is put , it's overridden with ROUNDING_MODE: 1 from web3 package config.
    // BigNumber.config({ DECIMAL_PLACES: precision });
  },
);

const setActiveMarketOriginBlockNumber = createAction(
  'MARKETS/SET_ACTIVE_MARKET_ORIGIN_BLOCK_NUMBER',
  blockNumber => blockNumber
);


const actions = {
  checkIfMarketIsOpen,
  checkMarketCloseTime,
  checkIfOrderMatchingIsEnabled,
  subscribeLogBuyEnabledEventEpic,
  checkIfBuyEnabled,
  setActiveMarketAddress,
  setActiveMarketOriginBlockNumber
};

const reducer = handleActions({
  [setActiveMarketOriginBlockNumber]: (state, { payload }) => state.setIn(['activeMarketOriginBlock', 'number'], payload),
  [fulfilled(checkIfMarketIsOpen)]: (state, { payload }) => state.set('isMarketOpen', payload),
  [fulfilled(checkMarketCloseTime)]: (state, { payload }) => state.update('closeTime', () => payload),
  [fulfilled(checkIfOrderMatchingIsEnabled)]: (state, { payload }) => state.update('isOrderMatchingEnabled', () => payload),
  [fulfilled(checkIfBuyEnabled)]: (state, { payload }) => state.update('isBuyEnabled', () => payload),
  [setActiveMarketAddress]: (state, { payload }) => state.set('activeMarketAddress', payload)

}, initialState);

export default {
  actions,
  reducer,
  events: {
    EVENT___LOG_IS_MATCHING_ENABLED
  }
};
