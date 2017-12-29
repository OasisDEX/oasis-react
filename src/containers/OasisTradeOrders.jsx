import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { trades } from '../utils/tokens/pair';
// import OasisBuyOrders from '../components/OasisBuyOrders';
// import OasisSellOrders from '../components/OasisSellOrders';
// import OasisMyOrders from '../components/OasisMyOrders';
import OasisMarketHistory from '../components/OasisMarketHistory';
import tradesSelectors from '../store/selectors/trades';
import tokens from '../store/selectors/tokens';

const propTypes = PropTypes && {
  actions: PropTypes.object,
};

export class OasisTradeOrdersWrapper extends PureComponent {
  render() {
    const { marketData = [], initialMarketHistoryLoaded, activeTradingPair } = this.props;
    const tradesList = trades(marketData, activeTradingPair.baseToken, activeTradingPair.quoteToken);
    return (
      <div>
        {/*<OasisBuyOrders/>*/}
        {/*<OasisSellOrders/>*/}
        {/*<OasisMyOrders/>*/}
        <OasisMarketHistory
          trades={tradesList}
          activeTradingPair={activeTradingPair}
          initialMarketHistoryLoaded={initialMarketHistoryLoaded}
        />
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {
    activeTradingPair: tokens.activeTradingPair(state),
    marketData: tradesSelectors.marketsData(state),
    initialMarketHistoryLoaded: tradesSelectors.initialMarketHistoryLoaded(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTradeOrdersWrapper.propTypes = propTypes;
OasisTradeOrdersWrapper.displayName = 'OasisTradeOrders';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTradeOrdersWrapper);
