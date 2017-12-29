import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { trades as tokenPairTrades } from '../utils/tokens/pair';
import OasisBuyOrders from '../components/OasisBuyOrders';
import OasisSellOrders from '../components/OasisSellOrders';
import OasisMyOrders from '../components/OasisMyOrders';
import OasisMarketHistory from '../components/OasisMarketHistory';
import  trades from '../store/selectors/trades';
import tokens from '../store/selectors/tokens';

const propTypes = PropTypes && {
  actions: PropTypes.object,
};

export class OasisTradeOrdersWrapper extends PureComponent {
  render() {
    const { marketData = [], initialMarketHistoryLoaded, activeTradingPair } = this.props;
    const trades = tokenPairTrades(marketData, activeTradingPair.baseToken, activeTradingPair.quoteToken);
    return (
      <div>
        {/*<OasisBuyOrders/>*/}
        {/*<OasisSellOrders/>*/}
        {/*<OasisMyOrders/>*/}
        <OasisMarketHistory
          trades={trades}
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
    marketData: trades.marketsData(state),
    initialMarketHistoryLoaded: trades.initialMarketHistoryLoaded(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTradeOrdersWrapper.propTypes = propTypes;
OasisTradeOrdersWrapper.displayName = 'OasisTradeOrders';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTradeOrdersWrapper);
