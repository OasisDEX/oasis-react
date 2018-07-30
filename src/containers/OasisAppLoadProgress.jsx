import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { appLoadProgress } from "../store/selectors";
import offers from "../store/selectors/offers";
import OasisStatus from "../components/OasisStatus";
import network from "../store/selectors/network";
import trades from "../store/selectors/trades";

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class OasisAppLoadProgressWrapper extends PureComponent {
  networkStatus() {
    const {
      loadProgress,
      activeTradingPairOffersInitiallyLoaded,
      offersLoadProgress,
      networkStatus,
      networkName,
      initialMarketHistoryLoaded
    } = this.props;
    return (
      <OasisStatus
        offersLoadProgress={offersLoadProgress}
        status={networkStatus}
        loadProgress={loadProgress}
        activeTradingPairOffersInitiallyLoaded={
          activeTradingPairOffersInitiallyLoaded
        }
        initialMarketHistoryLoaded={initialMarketHistoryLoaded}
        name={networkName}
      />
    );
  }

  render() {
    return this.networkStatus();
  }
}

export function mapStateToProps(state) {
  return {
    activeTradingPairOffersInitiallyLoaded: offers.activeTradingPairOffersInitiallyLoaded(
      state
    ),
    networkStatus: network.status(state),
    networkName: network.activeNetworkName(state),
    loadProgress: appLoadProgress(state),
    initialMarketHistoryLoaded: trades.initialMarketHistoryLoaded(state),
    offersLoadProgress: offers.activeTradingPairOffersLoadProgress(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisAppLoadProgressWrapper.propTypes = propTypes;
OasisAppLoadProgressWrapper.displayName = "OasisAppLoadProgress";
export default connect(mapStateToProps, mapDispatchToProps)(
  OasisAppLoadProgressWrapper
);
