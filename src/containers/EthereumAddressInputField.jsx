import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import EthereumAddressInput from "../components/EthereumAddressInput";
import { Field } from "redux-form/immutable";
import web3 from "../bootstrap/web3";
import CSSModule from "react-css-modules";
import style from "./EthereumAddressInputField.scss";
import { VALIDATION_VALUE_IS_REQUIRED } from '../constants';

const propTypes = PropTypes && {
  fieldName: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  onValidityChange: PropTypes.func
};

export const VALIDATION_ERROR__NOT_ETHEREUM_ADDRESS_FORMAT =
  "VALIDATION_ERROR/NOT_ETHEREUM_ADDRESS_FORMAT";

export class EthereumAddressInputFieldWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.componentIsUnmounted = false;
    this.validateEthereumAddress = this.validateEthereumAddress.bind(this);
  }

  render() {
    const { fieldName, disabled } = this.props;
    return (
      <div className={style.EthereumAddressInputField}>
        <Field
          normalize={(value) => {
            if (web3.isAddress(value) && value.indexOf("0x")!==0){
              return `0x${value}`;
            }
            return value;
          }}
          disabled={disabled}
          required={this.props.required}
          validate={this.validateEthereumAddress}
          component={EthereumAddressInput}
          name={fieldName}
        />
      </div>
    );
  }

  validateEthereumAddress(value) {
    const { onValidityChange } = this.props;
    if (this.props.required) {
      if (!value) {
        return VALIDATION_VALUE_IS_REQUIRED;
      }
    }
    if (value && !web3.isAddress(value)) {
      if (this.componentIsUnmounted === false) {
        onValidityChange && onValidityChange(false);
      }
      return VALIDATION_ERROR__NOT_ETHEREUM_ADDRESS_FORMAT;
    } else {
      if (this.componentIsUnmounted === false) {
        onValidityChange && onValidityChange(true);
      }
    }
  }

  componentWillUnmount() {
    this.componentIsUnmounted = true;
  }
}

export function mapStateToProps() {
  return {};
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

EthereumAddressInputFieldWrapper.propTypes = propTypes;
EthereumAddressInputFieldWrapper.displayName = "EthereumAddressInputField";
export default connect(mapStateToProps, mapDispatchToProps)(
  CSSModule(EthereumAddressInputFieldWrapper, style)
);
