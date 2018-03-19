import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import EthereumAddressInput from '../components/EthereumAddressInput';
import { Field } from 'redux-form/immutable';
import web3 from '../bootstrap/web3';

const propTypes = PropTypes && {
  fieldName: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  disabled: PropTypes.bool
};


export const VALIDATION_ERROR__NOT_ETHEREUM_ADDRESS_FORMAT = 'VALIDATION_ERROR/NOT_ETHEREUM_ADDRESS_FORMAT';

const validateEthereumAddress = (value, allValues, props, name) => {
  if (!web3.isAddress(value)) {
    return VALIDATION_ERROR__NOT_ETHEREUM_ADDRESS_FORMAT;
  }
};

export class EthereumAddressInputFieldWrapper extends PureComponent {
  render() {
    const { fieldName, disabled } = this.props;
    return (
      <Field
        disabled={disabled}
        required
        validate={validateEthereumAddress}
        component={EthereumAddressInput}
        name={fieldName}
      />
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

EthereumAddressInputFieldWrapper.propTypes = propTypes;
EthereumAddressInputFieldWrapper.displayName = 'EthereumAddressInputField';
export default connect(mapStateToProps, mapDispatchToProps)(EthereumAddressInputFieldWrapper);
