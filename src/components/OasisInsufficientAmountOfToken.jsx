import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import textStyles from "../styles/modules/_typography.scss";
import { InfoBoxWithIco } from "./InfoBoxWithIco";

const propTypes = PropTypes && {
  tokenName: PropTypes.string.isRequired,
  noBorder: PropTypes.bool
};
const defaultProps = {};

class OasisInsufficientAmountOfToken extends PureComponent {
  render() {
    const { noBorder, tokenName, ...props } = this.props;
    const content = (
      <span>
        You do not have enough <strong>{tokenName}</strong> tokens.
      </span>
    );
    return (
      <InfoBoxWithIco
        noBorder={noBorder}
        color="danger"
        icon="warning"
        {...props}
      >
        {content}
      </InfoBoxWithIco>
    );
  }
}

OasisInsufficientAmountOfToken.displayName = "OasisInsufficientAmountOfToken";
OasisInsufficientAmountOfToken.propTypes = propTypes;
OasisInsufficientAmountOfToken.defaultProps = defaultProps;
export default OasisInsufficientAmountOfToken;
