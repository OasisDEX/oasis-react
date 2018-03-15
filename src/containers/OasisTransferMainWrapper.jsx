import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisTransferTransfer from '../components/OasisTransferTransfer';
import OasisTransferHistory from '../components/OasisTransferHistory';
import { OasisTokenTransferHistoryWrapper } from './OasisTokenTransferHistory';

const propTypes = PropTypes && {
  actions: PropTypes.object,
};

export class OasisTransferWrapper extends PureComponent {
  render() {
    return (
      <div>
        __OasisTransferWrapper__
        <OasisTokenTransferHistoryWrapper/>
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {};
}

export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTransferWrapper.propTypes = propTypes;
OasisTransferWrapper.displayName = 'OasisTransfer';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTransferWrapper);
