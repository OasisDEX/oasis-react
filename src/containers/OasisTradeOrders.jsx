import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import OasisBuyOrders from "../components/OasisBuyOrders";
import OasisSellOrders from "../components/OasisSellOrders";
import OasisMarketHistory from "../components/OasisMarketHistory";
import tradesSelectors from "../store/selectors/trades";
import tokens from "../store/selectors/tokens";
import offers from "../store/selectors/offers";
import offersReducer from "../store/reducers/offers";
import offerTakesReducer from "../store/reducers/offerTakes";
import OasisTakeOfferModalWrapper from "./OasisTakeOfferModal";
import offerTakes from "../store/selectors/offerTakes";
import network from "../store/selectors/network";
import { FlexBox } from "../components/FlexBox";
import accounts from "../store/selectors/accounts";
import userTradesReducer from "../store/reducers/userTrades";
import userTrades from "../store/selectors/userTrades";
import OasisMyOrdersContainerWrapper  from './OasisMyOrdersContainer';

const propTypes = PropTypes && {
  actions: PropTypes.object,
  isOfferTakeModalOpen: PropTypes.bool,
  activeTradingPair: PropTypes.object.isRequired
};

export class OasisTradeOrdersWrapper extends PureComponent {
  offerTakeModal() {
    const { isOfferTakeModalOpen, activeOfferTakeType } = this.props;

    return (
      isOfferTakeModalOpen && (
        <OasisTakeOfferModalWrapper offerTakeType={activeOfferTakeType} />
      )
    );
  }

  render() {
    const {
      tokenTrades,
      initialMarketHistoryLoaded,
      activeTradingPair,
      buyOfferCount,
      sellOfferCount,
      buyOffers,
      sellOffers,
      loadingBuyOffers,
      loadingSellOffers,
      activeNetworkName,
      actions: {
        cancelOffer,
        setOfferTakeModalOpen,
        setActiveOfferTakeOfferId,
        checkOfferIsActive,
        resetCompletedOfferCheck,
      }
    } = this.props;

    return (
      <FlexBox wrap>
        <div>{this.offerTakeModal()}</div>
        <OasisBuyOrders
          loadingBuyOffers={loadingBuyOffers}
          onSetOfferTakeModalOpen={setOfferTakeModalOpen}
          activeTradingPair={activeTradingPair}
          buyOfferCount={buyOfferCount}
          buyOffers={buyOffers}
          cancelOffer={cancelOffer}
          onSetActiveOfferTakeOfferId={setActiveOfferTakeOfferId}
          onCheckOfferIsActive={checkOfferIsActive}
          onResetCompletedOfferCheck={resetCompletedOfferCheck}
        />
        <OasisSellOrders
          loadingSellOffers={loadingSellOffers}
          onSetOfferTakeModalOpen={setOfferTakeModalOpen}
          activeTradingPair={activeTradingPair}
          sellOfferCount={sellOfferCount}
          sellOffers={sellOffers}
          cancelOffer={cancelOffer}
          onSetActiveOfferTakeOfferId={setActiveOfferTakeOfferId}
          onCheckOfferIsActive={checkOfferIsActive}
          onResetCompletedOfferCheck={resetCompletedOfferCheck}
        />
        <OasisMyOrdersContainerWrapper/>
        <OasisMarketHistory
          trades={tokenTrades}
          activeTradingPair={activeTradingPair}
          initialMarketHistoryLoaded={initialMarketHistoryLoaded}
          activeNetworkName={activeNetworkName}
        />
      </FlexBox>
    );
  }
}

export function mapStateToProps(state) {
  return {
    defaultAccount: accounts.defaultAccount(state),
    activeTradingPair: tokens.activeTradingPair(state),
    marketData: tradesSelectors.marketsData(state),
    tokenTrades: tradesSelectors.tokenTrades(state),
    initialMarketHistoryLoaded: tradesSelectors.initialMarketHistoryLoaded(
      state
    ),
    loadingBuyOffers: offers.loadingBuyOffers(state),
    loadingSellOffers: offers.loadingSellOffers(state),
    buyOfferCount: offers.activeTradingPairBuyOfferCount(state),
    sellOfferCount: offers.activeTradingPairSellOfferCount(state),
    buyOffers: offers.activeTradingPairBuyOffers(state),
    sellOffers: offers.activeTradingPairSellOffers(state),
    activeOfferTakeType: offerTakes.activeOfferTakeType(state),
    isOfferTakeModalOpen: offerTakes.isOfferTakeModalOpen(state),
    activeNetworkName: network.activeNetworkName(state),
    userTrades: userTrades.marketsData(state),
    loadingUserMarketHistory: userTrades.loadindUserMarketHistory(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    cancelOffer: offersReducer.actions.cancelOfferEpic,
    setOfferTakeModalOpen: offerTakesReducer.actions.setOfferTakeModalOpenEpic,
    setActiveOfferTakeOfferId:
      offerTakesReducer.actions.setActiveOfferTakeOfferId,
    checkOfferIsActive:
      offerTakesReducer.actions.checkIfOfferTakeSubjectStillActiveEpic,
    resetCompletedOfferCheck:
      offerTakesReducer.actions.resetCompletedOfferCheck,
    fetchAndSubscribeUserTradesHistory:
      userTradesReducer.actions.fetchAndSubscribeUserTradesHistoryEpic,
    removeOrderCancelledByTheOwner: offersReducer.actions.removeOrderCancelledByTheOwner
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTradeOrdersWrapper.propTypes = propTypes;
OasisTradeOrdersWrapper.displayName = "OasisTradeOrders";
export default connect(mapStateToProps, mapDispatchToProps)(
  OasisTradeOrdersWrapper
);
