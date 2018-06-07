import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { formatAmount } from "../utils/tokens/pair";
import OasisLoadingIndicator from "./OasisLoadingIndicator";
import OasisSignificantDigitsWrapper from "../containers/OasisSignificantDigits";
import { ETH_UNIT_ETHER } from '../constants';

const propTypes = PropTypes && {
  balance: PropTypes.string,
  inWei: PropTypes.bool,
  token: PropTypes.string
};
const defaultProps = {};

class OasisInlineTokenBalance extends PureComponent {
  render() {
    const { balance, token, inWei, fractionalZerosGrey } = this.props;
    if (!!balance && token) {
      return (
        <span>
          <OasisSignificantDigitsWrapper
            fullPrecisionUnit={ETH_UNIT_ETHER}
            fullPrecisionAmount={balance}
            amount={formatAmount(balance, inWei)}
            fractionalZerosGrey={fractionalZerosGrey}
          />{" "}
          <b>{token}</b>
        </span>
      );
    } else {
      return <OasisLoadingIndicator />;
    }
  }
}

OasisInlineTokenBalance.displayName = "OasisInlineTokenBalance";
OasisInlineTokenBalance.propTypes = propTypes;
OasisInlineTokenBalance.defaultProps = defaultProps;
export default OasisInlineTokenBalance;
