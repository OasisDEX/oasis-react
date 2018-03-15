import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';

import { reduxForm, Field } from 'redux-form/immutable';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import EthereumAddressInputFieldWrapper from './EthereumAddressInputField';
import TokenAmountInputFieldWrapper  from './TokenAmountInputField';
import transfers from '../store/selectors/transfers';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};


const formFieldStyle = {
  margin: '20px'
};

export class TokenTransferFormWrapper extends PureComponent {
  render() {
    const { handleSubmit, valid, makeTransfer, disabled } = this.props;
    return (
      <div>
        <form method="POST" onSubmit={handleSubmit}>
          <EthereumAddressInputFieldWrapper disabled={disabled} fieldName={'recipient'}/>
          <TokenAmountInputFieldWrapper disabled={disabled} fieldName={'tokenAmount'}/>
          <Field
            component={'input'}
            type={'text'}
            name={'token'}
            hidden
          />
          <div>
            <button onClick={makeTransfer} disabled={!valid || disabled}>Transfer</button>
          </div>
        </form>
      </div>
    );
  }

  componentWillUpdate(nextProps) {
    if (this.props.selectedToken !== nextProps.selectedToken) {
      this.props.change('token', nextProps.selectedToken);
    }
  }
}

export function mapStateToProps(state) {
  return {
    selectedToken: transfers.selectedToken(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

TokenTransferFormWrapper.propTypes = propTypes;
TokenTransferFormWrapper.displayName = 'TokenTransferForm';
export default connect(mapStateToProps, mapDispatchToProps)(
  reduxForm({
    form: 'tokenTransfer'
  })(TokenTransferFormWrapper),
);