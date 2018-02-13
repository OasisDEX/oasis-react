import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class WithTransactionWatchWrapper extends PureComponent {
  render() {
    return (
      <div></div>
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

WithTransactionWatchWrapper.propTypes = propTypes;
WithTransactionWatchWrapper.displayName = 'WithTransactionWatch';
export default connect(mapStateToProps, mapDispatchToProps)(WithTransactionWatchWrapper);
