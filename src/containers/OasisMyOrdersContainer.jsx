import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisMyOrders from '../components/OasisMyOrders';
import tokens from '../store/selectors/tokens';
import network from '../store/selectors/network';
import accounts from '../store/selectors/accounts';
import offers from '../store/selectors/offers';
import tradesSelectors from '../store/selectors/trades';
import userTrades from '../store/selectors/userTrades';
import userTradesReducer from '../store/reducers/userTrades';
import offersReducer from '../store/reducers/offers';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
};

export class OasisMyOrdersContainerWrapper extends PureComponent {
  render() {
    const {
      initialMarketHistoryLoaded,
      activeTradingPair,
      buyOffers,
      sellOffers,
      activeNetworkName,
      userTradesList,
      loadingUserMarketHistory,
      defaultAccount,
      activeTradingPairOffersInitiallyLoaded,
      actions: {
        cancelOffer,
        fetchAndSubscribeUserTradesHistory,
        removeOrderCancelledByTheOwner,
      }
    } = this.props;

    return (
      <OasisMyOrders
        activeTradingPairOffersInitiallyLoaded={activeTradingPairOffersInitiallyLoaded}
        defaultAccount={defaultAccount}
        activeNetworkName={activeNetworkName}
        sellOffers={sellOffers}
        buyOffers={buyOffers}
        trades={userTradesList}
        cancelOffer={cancelOffer}
        activeTradingPair={activeTradingPair}
        initialMarketHistoryLoaded={initialMarketHistoryLoaded}
        onFetchAndSubscribeUserTradesHistory={
          fetchAndSubscribeUserTradesHistory
        }
        loadingUserMarketHistory={loadingUserMarketHistory}
        removeOrderCancelledByTheOwner={removeOrderCancelledByTheOwner}
      />
    );
  }
}

export function mapStateToProps(state) {
  return {
    defaultAccount: accounts.defaultAccount(state),
    activeTradingPair: tokens.activeTradingPair(state),
    activeTradingPairOffersInitiallyLoaded: offers.activeTradingPairOffersInitiallyLoaded(state),
    initialMarketHistoryLoaded: tradesSelectors.initialMarketHistoryLoaded(
      state
    ),
    buyOfferCount: offers.activeTradingPairBuyOfferCount(state),
    sellOfferCount: offers.activeTradingPairSellOfferCount(state),
    buyOffers: offers.activeTradingPairBuyOffers(state),
    sellOffers: offers.activeTradingPairSellOffers(state),
    activeNetworkName: network.activeNetworkName(state),
    userTradesList: userTrades.marketsData(state),
    loadingUserMarketHistory: userTrades.loadindUserMarketHistory(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    fetchAndSubscribeUserTradesHistory:
    userTradesReducer.actions.fetchAndSubscribeUserTradesHistoryEpic,
    removeOrderCancelledByTheOwner: offersReducer.actions.removeOrderCancelledByTheOwner

  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisMyOrdersContainerWrapper.propTypes = propTypes;
OasisMyOrdersContainerWrapper.displayName = 'OasisMyOrdersContainer';
export default connect(mapStateToProps, mapDispatchToProps)(OasisMyOrdersContainerWrapper);
