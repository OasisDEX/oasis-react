import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import CSSModules from "react-css-modules";
import styles from "./EthereumAddressInput.scss";
// import ImmutablePropTypes from 'react-immutable-proptypes';
const propTypes = PropTypes && {};
const defaultProps = {};

const inputStyle = { textAlign: "right", paddingRight: "30px" };

class EthereumAddressInput extends PureComponent {
  render() {
    return (
      <input
        {...this.props.input}
        disabled={this.props.disabled}
        style={inputStyle}
        autoComplete="off"
        required={this.props.required}
        placeholder={"0x"}
        type="text"
      />
    );
  }
}

EthereumAddressInput.displayName = "EthereumAddressInput";
EthereumAddressInput.propTypes = propTypes;
EthereumAddressInput.defaultProps = defaultProps;
export default CSSModules(EthereumAddressInput, styles);
