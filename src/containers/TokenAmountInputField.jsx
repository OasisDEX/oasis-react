import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import tokenSelectors from '../store/selectors/tokenSelectors';
import balances from '../store/selectors/balances';
import { Field } from 'redux-form/immutable';
import TokenAmountInput from '../components/TokenAmountInput';
import web3 from '../bootstrap/web3';

const propTypes = PropTypes && {
  fieldName: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  maxAmountLimit: PropTypes.string,
  disabled: PropTypes.bool,
  onValidityChange: PropTypes.func
};

export const VALIDATION_ERROR__VALUE_GREATER_THAN_BALANCE = 'VALIDATION_ERROR/VALUE_GREATER_THAN_BALANCE';
export const VALIDATION_ERROR__NON_NUMERIC_VALUE = 'VALIDATION_ERROR/NON_NUMERIC_VALUE';

const validateIsNonZeroNumber = value => {
  const parsedValue = parseFloat(value);
  if (isNaN(parsedValue) || parsedValue === 0) {
    return [VALIDATION_ERROR__NON_NUMERIC_VALUE]
  }
};

export class TokenAmountInputFieldWrapper extends PureComponent {

  constructor(props) {
    super(props);
    this.validateTokenAmount = this.validateTokenAmount.bind(this);
    this.onValidityChange = this.onValidityChange.bind(this);
  }

  onValidityChange(validationError) {
    const { onValidityChange } = this.props;
    onValidityChange && onValidityChange(validationError);
  }
  validateTokenAmount(value) {
    if (web3.toBigNumber(this.props.maxAmountLimit).lt(value)) {
      this.onValidityChange(false);
      return [ VALIDATION_ERROR__VALUE_GREATER_THAN_BALANCE ];
    } else {
      return this.onValidityChange(true);
    }
  }

  render() {
    const { selectedToken, maxAmountLimit, fieldName, disabled } = this.props;
    return (
      <Field
        autoComplete="off"
        disabled={!maxAmountLimit || disabled}
        maxAmountLimit={maxAmountLimit}
        required
        validate={[validateIsNonZeroNumber, this.validateTokenAmount]}
        component={TokenAmountInput}
        selectedToken={selectedToken}
        name={fieldName}
      />
    );
  }
}

export function mapStateToProps(state) {
  const selectedToken = tokenSelectors.selectedToken(state, 'tokenTransfer');
  return {
    selectedToken,
    maxAmountLimit: balances.tokenBalance(state, { tokenName: selectedToken, toBigNumber: false })
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

TokenAmountInputFieldWrapper.propTypes = propTypes;
TokenAmountInputFieldWrapper.displayName = 'TokenAmountInputField';
export default connect(mapStateToProps, mapDispatchToProps)(TokenAmountInputFieldWrapper);
