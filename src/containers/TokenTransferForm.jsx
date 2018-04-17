import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import { reduxForm, Field } from 'redux-form/immutable';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import EthereumAddressInputFieldWrapper from './EthereumAddressInputField';
import TokenAmountInputFieldWrapper  from './TokenAmountInputField';
import transfers from '../store/selectors/transfers';
import transfersReducer from '../store/reducers/transfers';
import styles from './TokenTransferForm.scss';
import OasisButton from "../components/OasisButton";

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};


export class TokenTransferFormWrapper extends PureComponent {
  render() {
    const { handleSubmit, valid, makeTransfer, disabled, actions } = this.props;
    return (
      <form method="POST" onSubmit={handleSubmit}>
        <table className={styles.table}>
          <tbody>
          <tr>
            <th>Recipient</th>
            <td colSpan="2" className={styles.withInput}>
              <EthereumAddressInputFieldWrapper disabled={disabled} fieldName={'recipient'}/>
            </td>
          </tr>
          <tr>
            <th>Amount</th>
            <td className={styles.withInput}>
              <div className={styles.formGroup}>
                <OasisButton
                  type="button"
                  onClick={actions.transferMax}
                  size="xs"
                  className={styles.setMaxBtn}
                >
                  transfer max
                </OasisButton>
                <TokenAmountInputFieldWrapper disabled={disabled} fieldName={'tokenAmount'}/>
                <Field
                  component={'input'}
                  type={'text'}
                  name={'token'}
                  hidden
                />
              </div>
            </td>
          </tr>
          </tbody>
        </table>
        <div className={styles.footer}>
          <OasisButton
            onClick={makeTransfer}
            disabled={!valid || disabled}
          >Transfer</OasisButton>
        </div>
      </form>
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
    transferMax: transfersReducer.actions.setTransferMax
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