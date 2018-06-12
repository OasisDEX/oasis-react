import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import OasisYourNodeIsSyncing from "../components/OasisYourNodeIsSyncing";
import network from "../store/selectors/network";

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class OasisYourNodeIsSyncingWrapper extends PureComponent {
  render() {
    const { latestBlock, networkId } = this.props;
    return (
      <OasisYourNodeIsSyncing latestBlock={latestBlock} networkId={networkId} />
    );
  }
}

export function mapStateToProps(state) {
  return {
    latestBlock: network.latestBlock(state),
    networkId: network.activeNetworkId(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisYourNodeIsSyncingWrapper.propTypes = propTypes;
OasisYourNodeIsSyncingWrapper.displayName = "OasisYourNodeIsSyncing";
export default connect(mapStateToProps, mapDispatchToProps)(
  OasisYourNodeIsSyncingWrapper
);
