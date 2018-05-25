/* eslint-disable no-unused-vars */
import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

import { fulfilled } from '../../utils/store';
import { createPromiseActions } from '../../utils/createPromiseActions';
import { getMarketContractInstance } from '../../bootstrap/contracts';

const CHECK_IF_MARKET_IS_OPEN = 'MARKETS/CHECK_IF_MARKET_IS_OPEN';
const CHECK_MARKET_CLOSE_TIME = 'MARKETS/CHECK_MARKET_CLOSE_TIME';
const SET_ACTIVE_MARKET_ADDRESS = 'MARKETS/SET_ACTIVE_MARKET_ADDRESS';
const CHECK_IF_ORDER_MATCHING_IS_ENABLED = 'NETWORK/CHECK_IF_ORDER_MATCHING_IS_ENABLED';
const CHECK_IF_BUY_ENABLED = 'MARKETS/CHECK_IF_BUY_ENABLED';


const SUBSCRIBE___LOG_IS_MATCHING_ENABLED_EVENT = 'MARKETS/SUBSCRIBE___LOG_IS_MATCHING_ENABLED_EVENT';

const EVENT___LOG_IS_MATCHING_ENABLED = 'MARKETS/EVENT___LOG_IS_MATCHING_ENABLED';


const MARKET_TYPE_SIMPLE_MARKET = 'MARKET_TYPE_SIMPLE_MARKET';
const MARKET_TYPE_EXPIRING_MARKET = 'MARKET_TYPE_EXPIRING_MARKET';
const MARKET_TYPE_MATCHING_MARKET = 'MARKET_TYPE_MATCHING_MARKET';

const initialState = fromJS({
  closeTime: null,
  isMarketOpen: null,
  isOrderMatchingEnabled: null,
  isBuyEnabled: null,
  activeMarketOriginBlock: {
    number: null,
  },
  activeMarketAddress: null,
  marketType: MARKET_TYPE_MATCHING_MARKET,
});

const checkIfMarketIsOpen = createAction(
  CHECK_IF_MARKET_IS_OPEN,
  async () => getMarketContractInstance().isClosed().then(isClosed => !isClosed),
);

const checkMarketCloseTime = createAction(
  CHECK_MARKET_CLOSE_TIME,
  async () => getMarketContractInstance().close_time(),
);

const eventLogIsMatchingEnabled = createAction(
  EVENT___LOG_IS_MATCHING_ENABLED,
  (isEnabled) => isEnabled,
);

const subscribeLogMatchingEnabled = createPromiseActions(
  SUBSCRIBE___LOG_IS_MATCHING_ENABLED_EVENT
);
const subscribeLogMatchingEnabledEpic = () => async dispatch => {
  dispatch(subscribeLogMatchingEnabled.pending());
  getMarketContractInstance().LogMatchingEnabled({}, { fromBlock: 'latest' })
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
        resolve(await getMarketContractInstance().matchingEnabled());
      }
    });
  },
);

const setActiveMarketAddress = createAction(
  SET_ACTIVE_MARKET_ADDRESS,
  address => address
);

const checkIfBuyEnabled = createAction(
  CHECK_IF_BUY_ENABLED,
  () => getMarketContractInstance().buyEnabled()
);

const isBuyEnabled = createAction('MARKETS/IS_BUY_ENABLED', isEnabled => isEnabled);
const subscribeLogBuyEnabledEventEpic = () => async (dispatch) => {
    getMarketContractInstance().LogBuyEnabled({}, { fromBlock: 'latest' }).then(
      ({ args }) => { dispatch(isBuyEnabled(args)); }
    )
  };


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
  setActiveMarketOriginBlockNumber,
  subscribeLogMatchingEnabledEpic
};

const reducer = handleActions({
  [setActiveMarketOriginBlockNumber]: (state, { payload }) => state.setIn(['activeMarketOriginBlock', 'number'], payload),
  [fulfilled(checkIfMarketIsOpen)]: (state, { payload }) => state.set('isMarketOpen', payload),
  [fulfilled(checkMarketCloseTime)]: (state, { payload }) => state.update('closeTime', () => payload),
  [fulfilled(checkIfOrderMatchingIsEnabled)]: (state, { payload }) => state.update('isOrderMatchingEnabled', () => payload),
  [fulfilled(checkIfBuyEnabled)]: (state, { payload }) => state.set('isBuyEnabled', payload),
  [setActiveMarketAddress]: (state, { payload }) => state.set('activeMarketAddress', payload)

}, initialState);

export default {
  actions,
  reducer,
  events: {
    EVENT___LOG_IS_MATCHING_ENABLED
  }
};
