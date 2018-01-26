import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { List } from 'immutable';

import { trades } from '../utils/tokens/pair';
import OasisBuyOrders from '../components/OasisBuyOrders';
import OasisSellOrders from '../components/OasisSellOrders';
// import OasisMyOrders from '../components/OasisMyOrders';
import OasisMarketHistory from '../components/OasisMarketHistory';
import tradesSelectors from '../store/selectors/trades';
import tokens from '../store/selectors/tokens';
import offers from '../store/selectors/offers';
import offersReducer from '../store/reducers/offers';
import OasisMyOrders from '../components/OasisMyOrders';

const propTypes = PropTypes && {
  actions: PropTypes.object,
};

export class OasisTradeOrdersWrapper extends PureComponent {
  render() {
    const {
      marketData = List(),
      initialMarketHistoryLoaded,
      activeTradingPair,
      loadingBuyOffers,
      loadingSellOffers,
      buyOfferCount,
      sellOfferCount,
      buyOffers,
      sellOffers,
      actions: {
        cancelOffer
      }
    } = this.props;

    const tradesList = trades(marketData, activeTradingPair.baseToken, activeTradingPair.quoteToken);
    return (
      <div>
        <OasisBuyOrders
          activeTradingPair={activeTradingPair}
          // loadingBuyOffers={loadingBuyOffers}
          buyOfferCount={buyOfferCount}
          buyOffers={buyOffers}
          cancelOffer={cancelOffer}
        />
        <OasisSellOrders
          activeTradingPair={activeTradingPair}
          // loadingSellOffers={loadingSellOffers}
          sellOfferCount={sellOfferCount}
          sellOffers={sellOffers}
          cancelOffer={cancelOffer}
        />
        <OasisMyOrders
          sellOffers={sellOffers}
          buyOffers={buyOffers}
          trades={tradesList}
          cancelOffer={cancelOffer}
          activeTradingPair={activeTradingPair}
          initialMarketHistoryLoaded={initialMarketHistoryLoaded}
        />
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
    initialMarketHistoryLoaded: tradesSelectors.initialMarketHistoryLoaded(state),
    // loadingBuyOffers: offers.loadingBuyOffers(state),
    // loadingSellOffers: offers.loadingSellOffers(state),
    buyOfferCount: offers.activeTradingPairBuyOfferCount(state),
    sellOfferCount: offers.activeTradingPairSellOfferCount(state),
    buyOffers: offers.activeTradingPairBuyOffers(state),
    sellOffers: offers.activeTradingPairSellOffers(state),
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    cancelOffer: offersReducer.actions.cancelOfferEpic
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTradeOrdersWrapper.propTypes = propTypes;
OasisTradeOrdersWrapper.displayName = 'OasisTradeOrders';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTradeOrdersWrapper);
