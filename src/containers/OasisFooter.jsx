import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class OasisFooterWrapper extends PureComponent {
  render() {
    return (
      <div className="row">
        <div className="col-sm-4"></div>
        <div className="col-sm-4"></div>
        <div className="col-sm-4"></div>
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

OasisFooterWrapper.propTypes = propTypes;
OasisFooterWrapper.displayName = 'OasisFooterWrapper';
export default connect(mapStateToProps, mapDispatchToProps)(OasisFooterWrapper);
