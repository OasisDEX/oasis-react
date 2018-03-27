import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';



import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisWrapUnwrapHistory from '../components/OasisWrapUnwrapHistory';
import wrapUnwrapHistory from '../store/selectors/wrapUnwrapHistory';

import wrapUnwrapHistoryReducer from '../store/reducers/wrapUnwrapHistory';
import platform from '../store/selectors/platform';
import network from '../store/selectors/network';
import wrapUnwrapReducer from '../store/reducers/wrapUnwrap';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class OasisWrapUnwrapHistoryWrapper extends PureComponent {
  render() {
    return (
      <OasisWrapUnwrapHistory {...this.props}/>
    );
  }

  async componentWillUpdate({ latestBlockNumber, contractsLoaded, isTokenWrapUnwrapHistoryLoading }) {
    if(latestBlockNumber && contractsLoaded && !isTokenWrapUnwrapHistoryLoading) {
      await this.props.actions.loadGNTBrokerAddress();
      this.props.actions.loadWrapUnwrapsHistory();
    }
  }
}


export function mapStateToProps(state) {
  return {
    activeNetworkName: network.getActiveNetworkName(state),
    contractsLoaded: platform.contractsLoaded(state),
    latestBlockNumber: network.latestBlockNumber(state),
    wrapUnwrapHistoryList: wrapUnwrapHistory.tokenWrapUnwrapHistory(state),
    isTokenWrapUnwrapHistoryLoading: wrapUnwrapHistory.isTokenWrapUnwrapHistoryLoading(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    loadWrapUnwrapsHistory: wrapUnwrapHistoryReducer.actions.loadWrapUnwrapsHistoryEpic,
    loadGNTBrokerAddress: wrapUnwrapReducer.actions.loadGNTBrokerAddressEpic
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisWrapUnwrapHistoryWrapper.propTypes = propTypes;
OasisWrapUnwrapHistoryWrapper.displayName = 'OasisWrapUnwrapHistory';
export default connect(mapStateToProps, mapDispatchToProps)(OasisWrapUnwrapHistoryWrapper);
