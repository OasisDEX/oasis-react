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
import tableStyles from "../styles/modules/_table.scss";
import widgetStyles from "./OasisWidgetFrame.scss";
import OasisButton from "../components/OasisButton";
import { SETMAXBTN_HIDE_DELAY_MS } from "../constants";
import platform from "../store/selectors/platform";
import CSSModules from "react-css-modules";
import OasisPleaseProvideEthereumAddress from "../components/OasisPleaseProvideEthereumAddress";

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  onFormChange: PropTypes.func.isRequired,
  txStatus: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
};

export class TokenTransferFormWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showMaxButton: false
    };
    this.componentIsUnmounted = false;
    this.onEthereumAddressInputValidityChange = this.onEthereumAddressInputValidityChange.bind(
      this
    );
    this.onFormChange = this.onFormChange.bind(this);
    this.onTotalFieldSectionBlur = this.onTotalFieldSectionBlur.bind(this);
    this.onTotalFieldSectionFocus = this.onTotalFieldSectionFocus.bind(this);
  }

  onFormChange() {
    const { onFormChange, anyTouched } = this.props;
    if (this.componentIsUnmounted === false) {
      onFormChange && onFormChange(anyTouched);
    }
  }

  onEthereumAddressInputValidityChange(isValid) {
    if (this.componentIsUnmounted === false) {
      this.setState({
        showPleaseProvideEthereumAddressWarning: !isValid
      });
    }
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
      selectedToken
    } = this.props;
    return (
      <form method="POST" onSubmit={handleSubmit} onChange={this.onFormChange}>
        <table className={`${tableStyles.table} ${styles.transferTable}`}>
          <thead>
            <tr>
              <td className={styles.thHeader} />
              <td />
              <td className={styles.thCurrency} />
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Recipient</th>
              <td colSpan="2" className={tableStyles.withInput}>
                <EthereumAddressInputFieldWrapper
                  required={true}
                  disabled={disabled || globalFormLock}
                  fieldName={"recipient"}
                  onValidityChange={this.onEthereumAddressInputValidityChange}
                />
              </td>
            </tr>
            <tr>
              <th>Amount</th>
              <td
                className={`${tableStyles.withInput} ${
                  styles.tdWithErrorMessages
                }`}
              >
                <div className={tableStyles.inputGroup}>
                  <OasisButton
                    style={{ fontSize: "10px" }}
                    hidden={!this.state.showMaxButton}
                    type="button"
                    onClick={actions.transferMax}
                    size="xs"
                    className={tableStyles.inputBtn}
                    disabled={disabled || globalFormLock}
                  >
                    transfer max
                  </OasisButton>
                  <div
                    className={tableStyles.inputGroupEventHandlerChild}
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
              <td className={tableStyles.currency}>{selectedToken}</td>
            </tr>
          </tbody>
        </table>
        {transferState}
        <div>
          <div>
            {this.state.showPleaseProvideEthereumAddressWarning && (
              <OasisPleaseProvideEthereumAddress />
            )}
          </div>
        </div>
        <div className={`${widgetStyles.OasisWidgetFooter} ${styles.footer}`}>
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
    if (this.componentIsUnmounted === false) {
      this.setState({ showMaxButton: true });
    }
  }

  onTotalFieldSectionBlur() {
    if (this.componentIsUnmounted === false) {
      setTimeout(
        () => this.setState({ showMaxButton: false }),
        SETMAXBTN_HIDE_DELAY_MS
      );
    }
  }

  componentWillUnmount() {
    this.componentIsUnmounted = true;
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
  })(
    CSSModules(
      TokenTransferFormWrapper,
      { styles, tableStyles, widgetStyles },
      { allowMultiple: true }
    )
  )
);
