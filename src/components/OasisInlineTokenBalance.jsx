import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { formatAmount } from '../utils/tokens/pair';
import OasisLoadingIndicator from './OasisLoadingIndicator';


const propTypes = PropTypes && {
  balance: PropTypes.string,
  inWei: PropTypes.bool,
  token: PropTypes.string
};
const defaultProps = {};


class OasisInlineTokenBalance extends PureComponent {
  render() {
    const { balance, token, inWei } = this.props;
    if ((!!balance) && token) {
      return (
        <span>
          {formatAmount(balance, inWei)} <b>{token}</b>
        </span>
      );
    } else {
      return (<OasisLoadingIndicator/>);
    }
  }
}

OasisInlineTokenBalance.displayName = 'OasisInlineTokenBalance';
OasisInlineTokenBalance.propTypes = propTypes;
OasisInlineTokenBalance.defaultProps = defaultProps;
export default OasisInlineTokenBalance;
