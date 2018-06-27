import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Field, reduxForm } from "redux-form/immutable";
import wrapUnwrap from "../store/selectors/wrapUnwrap";
import web3 from "../bootstrap/web3";
import wrapUnwrapReducer from "../store/reducers/wrapUnwrap";
import OasisButton from "../components/OasisButton";
import tableStyles from "../styles/modules/_table.scss";
import styles from "./OasisTokenUnwrapForm.scss";
import widgetStyles from "./OasisWidgetFrame.scss";
import CSSModules from "react-css-modules";
import OasisTransactionStatusWrapperInfoBox from "./OasisTransactionStatusInfoBox";
import { AMOUNT_DECIMALS, formatAmount } from "../utils/tokens/pair";
import MaskedTokenAmountInput from "../components/MaskedTokenAmountInput";
import platform from "../store/selectors/platform";
import { SETMAXBTN_HIDE_DELAY_MS, TOKEN_WRAPPED_ETH, TOKEN_WRAPPED_GNT } from '../constants';
import isNumericAndGreaterThanZero from "../utils/numbers/isNumericAndGreaterThanZero";
import OasisInsufficientAmountOfToken from "../components/OasisInsufficientAmountOfToken";

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  activeUnwrappedTokenBalance: PropTypes.string,
  onFormChange: PropTypes.func,
  wrappedToken: PropTypes.oneOf([
    TOKEN_WRAPPED_ETH,
    TOKEN_WRAPPED_GNT
  ])
};

const inputStyle = { textAlign: "right", width: "100%" };

export class OasisTokenUnwrapFormWrapper extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      showMaxButton: false,
      txStatus: undefined,
      txStartTimestamp: undefined
    };

    this.componentIsUnmounted = false;
    this.currentSetMaxTimeout = null;

    this.validate = this.validate.bind(this);
    this.setUnwrapMax = this.setUnwrapMax.bind(this);
    this.onSetMaxFocus = this.onSetMaxFocus.bind(this);
    this.onSetMaxBlur = this.onSetMaxBlur.bind(this);
    this.onTotalFieldSectionFocus = this.onTotalFieldSectionFocus.bind(this);
    this.onTotalFieldSectionBlur = this.onTotalFieldSectionBlur.bind(this);
    this.onFormChange = this.onFormChange.bind(this);
    this.transactionInfoBlock = this.transactionInfoBlock.bind(this);
  }

  validate(value) {
    const { activeWrappedTokenBalance } = this.props;
    if (!value || value == 0) {
      return "VALIDATE_ERROR/VALUE_IS_REQUIRED";
    } else if (web3.fromWei(activeWrappedTokenBalance).lt(value)) {
      return "VALIDATE_ERROR/WRAP_AMOUNT_GREATER_THAN_TOKEN_BALANCE";
    }
  }

  setUnwrapMax() {
    this.props.actions.setUnwrapMax();
    this.onFormChange();
  }

  transactionInfoBlock() {
    const { unwrapTokenAmount, wrappedToken } = this.props;
    return (
      <div>
        Unwrap{" "}
        <b>
          {formatAmount(unwrapTokenAmount, false, null, AMOUNT_DECIMALS)}{" "}
          {wrappedToken}
        </b>
      </div>
    );
  }

  renderTransactionStatus() {
    const {
      txType,
      transactionState: { txStatus, txStartTimestamp }
    } = this.props;
    return (
      <OasisTransactionStatusWrapperInfoBox
        txStatus={txStatus}
        infoText={this.transactionInfoBlock}
        localStatus={txStatus}
        txTimestamp={txStartTimestamp}
        txType={txType}
      />
    );
  }

  renderInsufficientBalanceWarning() {
    const {
      activeWrappedTokenBalance,
      unwrapTokenAmount,
      wrappedToken,
      transactionState: { txStatus }
    } = this.props;
    return !txStatus ? (
      <div>
        {isNumericAndGreaterThanZero(unwrapTokenAmount) &&
          web3.fromWei(activeWrappedTokenBalance).lt(unwrapTokenAmount) && (
            <OasisInsufficientAmountOfToken tokenName={wrappedToken} noBorder />
          )}
      </div>
    ) : null;
  }


  onFormChange() {
    const { onFormChange } = this.props;
    onFormChange && onFormChange();
  }
  render() {
    const {
      valid,
      handleSubmit,
      initialized,
      wrappedToken,
      disabled,
      globalFormLock,
      unwrapTokenAmount,
      activeWrappedTokenBalance
    } = this.props;

    return (
      <form onChange={this.onFormChange} onSubmit={handleSubmit}>
        <table className={`${tableStyles.table} ${styles.form}`}>
          <tbody>
            <tr>
              <th>Amount</th>
              <td className={tableStyles.withInput}>
                <div className={tableStyles.inputGroup}>
                  {this.state.showMaxButton && (
                    <OasisButton
                      type="button"
                      size="xs"
                      className={tableStyles.inputBtn}
                      onClick={this.setUnwrapMax}
                      onFocus={this.onSetMaxFocus}
                      onBlur={this.onSetMaxBlur}
                      disabled={
                        disabled ||
                        globalFormLock ||
                        !isNumericAndGreaterThanZero(activeWrappedTokenBalance)
                      }
                    >
                      <span style={{ fontSize: "10px" }}>unwrap max</span>
                    </OasisButton>
                  )}
                  <div
                    className={tableStyles.inputGroupEventHandlerChild}
                    onFocus={this.onTotalFieldSectionFocus}
                    onBlur={this.onTotalFieldSectionBlur}
                  >
                    <Field
                      style={inputStyle}
                      required
                      validate={this.validate}
                      autoComplete="off"
                      name="amount"
                      component={MaskedTokenAmountInput}
                      placeholder={0}
                      type="text"
                      disabled={disabled || globalFormLock}
                    />
                  </div>
                </div>
              </td>
              <td className={tableStyles.currency}>{wrappedToken}</td>
            </tr>
          </tbody>
        </table>
        <div>{this.renderTransactionStatus()}</div>
        <div className={styles.footer}>
          <div>
            {this.renderInsufficientBalanceWarning()}
          </div>
          <OasisButton
            type="submit"
            disabled={
              !valid ||
              disabled ||
              globalFormLock ||
              initialized ||
              !isNumericAndGreaterThanZero(unwrapTokenAmount)
            }
            className={styles.footerBtn}
          >
            Unwrap
          </OasisButton>
        </div>
      </form>
    );
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

export function mapStateToProps(state, { form }) {
  return {
    activeWrappedTokenBalance: wrapUnwrap.activeWrappedTokenBalance(
      state,
      true
    ),
    unwrapTokenAmount: wrapUnwrap.unwrapTokenAmount(state, form),
    globalFormLock: platform.globalFormLock(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    setUnwrapMax: wrapUnwrapReducer.actions.setUnwrapMax
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTokenUnwrapFormWrapper.propTypes = propTypes;
OasisTokenUnwrapFormWrapper.displayName = "OasisTokenUnwrapForm";
export default connect(mapStateToProps, mapDispatchToProps)(
  reduxForm({})(
    CSSModules(
      OasisTokenUnwrapFormWrapper,
      { tableStyles, styles, widgetStyles },
      { allowMultiple: true }
    )
  )
);
