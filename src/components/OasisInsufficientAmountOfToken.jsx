import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import { InfoBoxWithIco } from "./InfoBoxWithIco";

const propTypes = PropTypes && {
  tokenName: PropTypes.string.isRequired,
  noBorder: PropTypes.bool
};
const defaultProps = {};

class OasisInsufficientAmountOfToken extends PureComponent {
  render() {
    const { noBorder, tokenName, ...props } = this.props;
    return (
      <InfoBoxWithIco
        noBorder={noBorder}
        color="danger"
        icon="warning"
        {...props}
      >
        <span>
          You do not have enough <strong>{tokenName}</strong> tokens.
        </span>
      </InfoBoxWithIco>
    );
  }
}

OasisInsufficientAmountOfToken.displayName = "OasisInsufficientAmountOfToken";
OasisInsufficientAmountOfToken.propTypes = propTypes;
OasisInsufficientAmountOfToken.defaultProps = defaultProps;
export default OasisInsufficientAmountOfToken;
