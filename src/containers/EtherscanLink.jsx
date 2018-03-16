import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import EtherscanLink from '../components/EtherscanLink';

const propTypes = PropTypes && {
  // actions: PropTypes.object.isRequired,
  address: PropTypes.string.isRequired
};

export class EthercanLinkWrapper extends PureComponent {
  render() {
    return (
      <EtherscanLink/>
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

EthercanLinkWrapper.propTypes = propTypes;
EthercanLinkWrapper.displayName = 'EthercanLink';

export default connect(mapStateToProps, mapDispatchToProps)(EthercanLinkWrapper);
