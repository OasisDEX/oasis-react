import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import OasisWrapUnwrapHistory from "../components/OasisWrapUnwrapHistory";
import wrapUnwrapHistory from "../store/selectors/wrapUnwrapHistory";

import wrapUnwrapHistoryReducer from "../store/reducers/wrapUnwrapHistory";
import platform from "../store/selectors/platform";
import network from "../store/selectors/network";
import wrapUnwrapReducer from "../store/reducers/wrapUnwrap";
import accounts from "../store/selectors/accounts";

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class OasisWrapUnwrapHistoryWrapper extends PureComponent {
  async componentDidMount() {
    const { latestBlockNumber, contractsLoaded, hasAccountEntry } = this.props;
    if (latestBlockNumber && contractsLoaded && !hasAccountEntry) {
      // await this.props.actions.loadGNTBrokerAddress();
      this.props.actions.loadWrapUnwrapsHistory();
    }
  }
  render() {
    return <OasisWrapUnwrapHistory {...this.props} />;
  }

  async UNSAFE_componentWillUpdate({
    latestBlockNumber,
    contractsLoaded,
    hasAccountEntry
  }) {
    if (latestBlockNumber && contractsLoaded && !hasAccountEntry) {
      // await this.props.actions.loadGNTBrokerAddress();
      this.props.actions.loadWrapUnwrapsHistory();
    }
  }
}

export function mapStateToProps(state) {
  return {
    defaultAccount: accounts.defaultAccount(state),
    activeNetworkName: network.activeNetworkName(state),
    contractsLoaded: platform.contractsLoaded(state),
    latestBlockNumber: network.latestBlockNumber(state),
    wrapUnwrapHistoryList: wrapUnwrapHistory.tokenWrapUnwrapHistory(state),
    isTokenWrapUnwrapHistoryLoaded: wrapUnwrapHistory.isTokenWrapUnwrapHistoryLoaded(
      state
    ),
    hasAccountEntry: wrapUnwrapHistory.hasAccountEntry(
      state,
      accounts.defaultAccount(state)
    )
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    loadWrapUnwrapsHistory:
      wrapUnwrapHistoryReducer.actions.loadWrapUnwrapsHistoryEpic,
    loadGNTBrokerAddress: wrapUnwrapReducer.actions.loadGNTBrokerAddressEpic
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisWrapUnwrapHistoryWrapper.propTypes = propTypes;
OasisWrapUnwrapHistoryWrapper.displayName = "OasisWrapUnwrapHistory";
export default connect(mapStateToProps, mapDispatchToProps)(
  OasisWrapUnwrapHistoryWrapper
);
