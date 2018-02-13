import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class OasisGasPriceWrapper extends PureComponent {
  render() {
    const  { currentGasPrice } = this.props;

    return (
      <div>
        <span>{ currentGasPrice } gas</span>

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

OasisGasPriceWrapper.propTypes = propTypes;
OasisGasPriceWrapper.displayName = 'OasisGasPrice';
export default connect(mapStateToProps, mapDispatchToProps)(OasisGasPriceWrapper);
