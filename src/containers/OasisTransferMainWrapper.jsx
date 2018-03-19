import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisTokenTransferHistoryWrapper  from './OasisTokenTransferHistory';
import OasisTokenTransferWrapper  from './OasisTokenTransfer';
import transfers from '../store/selectors/transfers';

const propTypes = PropTypes && {
  actions: PropTypes.object,
};

export class OasisTransferMainWrapper extends PureComponent {
  render() {
    const { selectedToken } = this.props;
    return (
      <div>
        <OasisTokenTransferWrapper selectedToken={selectedToken}/>
        <OasisTokenTransferHistoryWrapper/>
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {
    selectedToken: transfers.selectedToken(state),
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTransferMainWrapper.propTypes = propTypes;
OasisTransferMainWrapper.displayName = 'OasisTransfer';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTransferMainWrapper);
