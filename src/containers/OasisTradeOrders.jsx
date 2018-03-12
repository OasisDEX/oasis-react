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
import offerTakesReducer, { TAKE_BUY_OFFER } from '../store/reducers/offerTakes';
import OasisTakeOfferModalWrapper  from './OasisTakeOfferModal';
import offerTakes from '../store/selectors/offerTakes';
import OasisMakeBuyOfferWrapper  from './OasisMakeBuyOffer';
import OasisMakeSellOfferWrapper  from './OasisMakeSellOffer';

const propTypes = PropTypes && {
  actions: PropTypes.object,
};


export class OasisTradeOrdersWrapper extends PureComponent {

  offerTakeModal() {

    const {
      isOfferTakeModalOpen,
      activeOfferTakeType,
      activeOfferTake
    } = this.props;

    return isOfferTakeModalOpen && (
      <OasisTakeOfferModalWrapper
        activeOfferTake={activeOfferTake}
        offerTakeType={activeOfferTakeType}
      />
    )
  }

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
        cancelOffer,
        setOfferTakeModalOpen,
        setActiveOfferTakeOfferId,
        checkOfferIsActive,
        resetCompletedOfferCheck
      }
    } = this.props;

    const tradesList = trades(marketData, activeTradingPair.baseToken, activeTradingPair.quoteToken);
    return (
      <div>
        <div>
          <OasisMakeBuyOfferWrapper/>
          <OasisMakeSellOfferWrapper/>
        </div>
        <div>{this.offerTakeModal()}</div>
        <OasisBuyOrders
          onSetOfferTakeModalOpen={setOfferTakeModalOpen}
          activeTradingPair={activeTradingPair}
          // loadingBuyOffers={loadingBuyOffers}
          buyOfferCount={buyOfferCount}
          buyOffers={buyOffers}
          cancelOffer={cancelOffer}
          onSetActiveOfferTakeOfferId={setActiveOfferTakeOfferId}
          onCheckOfferIsActive={checkOfferIsActive}
          onResetCompletedOfferCheck={resetCompletedOfferCheck}
        />
        <OasisSellOrders
          onSetOfferTakeModalOpen={setOfferTakeModalOpen}
          activeTradingPair={activeTradingPair}
          // loadingSellOffers={loadingSellOffers}
          sellOfferCount={sellOfferCount}
          sellOffers={sellOffers}
          cancelOffer={cancelOffer}
          onSetActiveOfferTakeOfferId={setActiveOfferTakeOfferId}
          onCheckOfferIsActive={checkOfferIsActive}
          onResetCompletedOfferCheck={resetCompletedOfferCheck}
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
    activeOfferTakeType: offerTakes.activeOfferTakeType(state),
    isOfferTakeModalOpen: offerTakes.isOfferTakeModalOpen(state),
    activeOfferTake: offerTakes.activeOfferTake(state)

  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    cancelOffer: offersReducer.actions.cancelOfferEpic,
    setOfferTakeModalOpen: offerTakesReducer.actions.setOfferTakeModalOpenEpic,
    setActiveOfferTakeOfferId: offerTakesReducer.actions.setActiveOfferTakeOfferId,
    checkOfferIsActive: offerTakesReducer.actions.checkIfOfferTakeSubjectStillActiveEpic,
    resetCompletedOfferCheck: offerTakesReducer.actions.resetCompletedOfferCheck
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTradeOrdersWrapper.propTypes = propTypes;
OasisTradeOrdersWrapper.displayName = 'OasisTradeOrders';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTradeOrdersWrapper);
