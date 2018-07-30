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
import OasisInsufficientAmountOfToken from "../components/OasisInsufficientAmountOfToken";

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
    this.currentSetMaxTimeout = null;

    this.onFormChange = this.onFormChange.bind(this);
    this.onTotalFieldSectionBlur = this.onTotalFieldSectionBlur.bind(this);
    this.onTotalFieldSectionFocus = this.onTotalFieldSectionFocus.bind(this);
    this.onSetMaxFocus = this.onSetMaxFocus.bind(this);
    this.onSetMaxBlur = this.onSetMaxBlur.bind(this);
    this.onEthereumAddressInputValidityChange = this.onEthereumAddressInputValidityChange.bind(
      this
    );
    this.onTokenAmountInputValidityChange = this.onTokenAmountInputValidityChange.bind(
      this
    );
  }

  onFormChange() {
    const { onFormChange, anyTouched } = this.props;
    if (this.componentIsUnmounted === false) {
      onFormChange && onFormChange(anyTouched);
    }
  }

  onTokenAmountInputValidityChange(isValid) {
    if (this.componentIsUnmounted === false) {
      this.setState({
        showInsufficientTokenAmountWarning: !isValid
      });
    }
  }
  onEthereumAddressInputValidityChange(isValid) {
    if (this.componentIsUnmounted === false) {
      this.setState({
        showPleaseProvideEthereumAddressWarning: !isValid
      });
    }
  }

  renderWarningSectionContent() {
    const { selectedToken } = this.props;
    const {
      showInsufficientTokenAmountWarning,
      showPleaseProvideEthereumAddressWarning
    } = this.state;

    return showInsufficientTokenAmountWarning ? (
      <OasisInsufficientAmountOfToken noBorder tokenName={selectedToken} />
    ) : (
      showPleaseProvideEthereumAddressWarning && (
        <OasisPleaseProvideEthereumAddress />
      )
    );
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
                className={`${tableStyles.withInput}`}
              >
                <div className={tableStyles.inputGroup}>
                  <OasisButton
                    hidden={!this.state.showMaxButton}
                    type="button"
                    onClick={actions.transferMax}
                    onFocus={this.onSetMaxFocus}
                    onBlur={this.onSetMaxBlur}
                    size="xs"
                    className={tableStyles.inputBtn}
                    disabled={disabled || globalFormLock}
                  >
                    <span className={styles.transferMaxButton}>
                      <span className="d-none d-sm-block">transfer</span> max
                    </span>
                  </OasisButton>
                  <div
                    className={tableStyles.inputGroupEventHandlerChild}
                    onBlur={this.onTotalFieldSectionBlur}
                    onFocus={this.onTotalFieldSectionFocus}
                  >
                    <TokenAmountInputFieldWrapper
                      onValidityChange={this.onTokenAmountInputValidityChange}
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
        <div className={styles.footer}>
          <div className={styles.validationErrorsBox}>
            {this.renderWarningSectionContent()}
          </div>
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

  componentDidUpdate(prevProps) {
    if (this.props.selectedToken !== prevProps.selectedToken) {
      this.props.change("token", this.props.selectedToken);
      this.onFormChange();
      this.setState({
        showInsufficientTokenAmountWarning: false,
        showPleaseProvideEthereumAddressWarning: false
      })
    }
  }

  onSetMaxFocus() {
    clearTimeout(this.currentSetMaxTimeout);
  }

  onSetMaxBlur() {
    this.setState({ showMaxButton: false });
  }

  onTotalFieldSectionFocus() {
    if (this.componentIsUnmounted === false) {
      this.setState({ showMaxButton: true });
    }
  }

  onTotalFieldSectionBlur() {
    if (this.componentIsUnmounted === false) {
      this.currentSetMaxTimeout = setTimeout(
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
