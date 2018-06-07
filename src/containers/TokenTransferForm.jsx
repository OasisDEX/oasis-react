import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";

import { reduxForm, Field } from "redux-form/immutable";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import EthereumAddressInputFieldWrapper from "./EthereumAddressInputField";
import TokenAmountInputFieldWrapper from "./TokenAmountInputField";
import transfers from "../store/selectors/transfers";
import transfersReducer from "../store/reducers/transfers";
import styles from "./TokenTransferForm.scss";
import OasisButton from "../components/OasisButton";
import { SETMAXBTN_HIDE_DELAY_MS } from "../constants";
import platform from "../store/selectors/platform";

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export class TokenTransferFormWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showMaxButton: false
    };
    this.onTotalFieldSectionBlur = this.onTotalFieldSectionBlur.bind(this);
    this.onTotalFieldSectionFocus = this.onTotalFieldSectionFocus.bind(this);
  }
  render() {
    const {
      handleSubmit,
      valid,
      makeTransfer,
      disabled,
      actions,
      transferState,
      globalFormLock,
      onFormChange
    } = this.props;
    return (
      <form method="POST" onSubmit={handleSubmit} onChange={onFormChange}>
        <table className={styles.table}>
          <tbody>
            <tr>
              <th>Recipient</th>
              <td colSpan="2" className={styles.withInput}>
                <EthereumAddressInputFieldWrapper
                  disabled={disabled || globalFormLock}
                  fieldName={"recipient"}
                />
              </td>
            </tr>
            <tr>
              <th>Amount</th>
              <td className={styles.withInput}>
                <div className={styles.formGroup}>
                    <OasisButton
                      hidden={!this.state.showMaxButton}
                      type="button"
                      onClick={actions.transferMax}
                      size="xs"
                      className={styles.setMaxBtn}
                      disabled={disabled || globalFormLock}
                    >
                      transfer max
                    </OasisButton>
                  <div
                    onBlur={this.onTotalFieldSectionBlur}
                    onFocus={this.onTotalFieldSectionFocus}
                  >
                    <TokenAmountInputFieldWrapper
                      disabled={disabled || globalFormLock}
                      fieldName={"tokenAmount"}
                    />
                  </div>
                  <Field
                    component={"input"}
                    type={"text"}
                    name={"token"}
                    disabled={true}
                    hidden
                  />
                </div>
              </td>
              <td className={styles.currency}>{this.props.selectedToken}</td>
            </tr>
          </tbody>
        </table>
        {transferState}
        <div className={styles.footer}>
          <OasisButton
            type="submit"
            onClick={makeTransfer}
            disabled={!valid || disabled || globalFormLock}
          >
            Transfer
          </OasisButton>
        </div>
      </form>
    );
  }

  UNSAFE_componentWillUpdate(nextProps) {
    if (this.props.selectedToken !== nextProps.selectedToken) {
      this.props.change("token", nextProps.selectedToken);
    }
  }

  onTotalFieldSectionFocus() {
    this.setState({ showMaxButton: true });
  }

  onTotalFieldSectionBlur() {
    setTimeout(
      () => this.setState({ showMaxButton: false }),
      SETMAXBTN_HIDE_DELAY_MS
    );
  }
}

export function mapStateToProps(state) {
  return {
    selectedToken: transfers.selectedToken(state),
    globalFormLock: platform.globalFormLock(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    transferMax: transfersReducer.actions.setTransferMax
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

TokenTransferFormWrapper.propTypes = propTypes;
TokenTransferFormWrapper.displayName = "TokenTransferForm";
export default connect(mapStateToProps, mapDispatchToProps)(
  reduxForm({
    form: "tokenTransfer"
  })(TokenTransferFormWrapper)
);
