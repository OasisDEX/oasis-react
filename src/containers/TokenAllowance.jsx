import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import balances from '../store/selectors/balances';
import {
  ETH_UNIT_ETHER,
  ETH_UNIT_GWEI,
  ETH_UNIT_KWEI,
  ETH_UNIT_MICROETHER,
  ETH_UNIT_MILIETHER,
  ETH_UNIT_MWEI,
} from '../constants';

const propTypes = PropTypes && {
  // actions: PropTypes.object.isRequired,
  tokenName: PropTypes.string.isRequired,
  allowanceUnit: PropTypes.oneOf([
    ETH_UNIT_ETHER,
    ETH_UNIT_GWEI,
    ETH_UNIT_MWEI,
    ETH_UNIT_KWEI,
    ETH_UNIT_MICROETHER,
    ETH_UNIT_MILIETHER,
    ETH_UNIT_ETHER
  ]).isRequired
};

export class TokenAllowanceWrapper extends PureComponent {
  render() {
    const { currentTokenAllowance, tokenName } = this.props;
    return currentTokenAllowance ?
      (<div><b>{tokenName}</b> {currentTokenAllowance.toFormat()}</div>) : (<div>Loading allowance</div>);
  }
}

export function mapStateToProps(state, { tokenName, allowanceUnit }) {
  return {
    currentTokenAllowance: balances.tokenAllowance(state, { tokenName, allowanceUnit })
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

TokenAllowanceWrapper.propTypes = propTypes;
TokenAllowanceWrapper.displayName = 'TokenAllowance';
export default connect(mapStateToProps, mapDispatchToProps)(TokenAllowanceWrapper);
