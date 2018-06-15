import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Field, reduxForm } from "redux-form/immutable";
import wrapUnwrap from "../store/selectors/wrapUnwrap";
import web3 from "../bootstrap/web3";
import wrapUnwrapReducer, {
  WRAP_UNWRAP_CLEAR_DEPOSIT_BROKER,
  WRAP_UNWRAP_CREATE_DEPOSIT_BROKER
} from "../store/reducers/wrapUnwrap";
import OasisButton from "../components/OasisButton";
import tableStyles from "../styles/modules/_table.scss";
import styles from "./OasisTokenWrapForm.scss";
import widgetStyles from "./OasisWidgetFrame.scss";
import CSSModules from "react-css-modules";
import OasisTransactionStatusWrapperInfoBox from "./OasisTransactionStatusInfoBox";
import { formatAmount } from "../utils/tokens/pair";
import MaskedTokenAmountInput from "../components/MaskedTokenAmountInput";
import platform from "../store/selectors/platform";
import { SETMAXBTN_HIDE_DELAY_MS, TOKEN_ETHER } from "../constants";
import OasisDontWrapAllEther from "../components/OasisDontWrapAllEther";
import isNumericAndGreaterThanZero from "../utils/numbers/isNumericAndGreaterThanZero";
import OasisInsufficientAmountOfToken from '../components/OasisInsufficientAmountOfToken';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  wrapTokenAmount: PropTypes.string,
  onFormChange: PropTypes.func
};

const inputStyle = { textAlign: "right", width: "100%" };

export class OasisTokenWrapFormWrapper extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      showMaxButton: false,
      txState: undefined,
      txStartTimestamp: undefined
    };

    this.validate = this.validate.bind(this);
    this.setWrapMax = this.setWrapMax.bind(this);
    this.transactionInfoBlock = this.transactionInfoBlock.bind(this);
    this.onTotalFieldSectionFocus = this.onTotalFieldSectionFocus.bind(this);
    this.onTotalFieldSectionBlur = this.onTotalFieldSectionBlur.bind(this);
  }

  validate(value) {
    const { activeUnwrappedTokenBalance } = this.props;
    if (!value || value == 0) {
      return "VALIDATE_ERROR/VALUE_IS_REQUIRED";
    } else if (web3.fromWei(activeUnwrappedTokenBalance).lt(value)) {
      return "VALIDATE_ERROR/WRAP_AMOUNT_GREATER_THAN_TOKEN_BALANCE";
    }
  }

  setWrapMax() {
    this.props.actions.setWrapMax();
  }

  transactionInfoBlock(txMeta) {
    const {
      wrapTokenAmount,
      activeUnwrappedToken,
      transactionState: { txStartMeta }
    } = this.props;
    const metaData = txStartMeta || txMeta;
    if (metaData) {
      switch (metaData.txSubType) {
        case WRAP_UNWRAP_CREATE_DEPOSIT_BROKER:
          return (
            <div>
              Create <b>{activeUnwrappedToken}</b> broker
            </div>
          );
        case WRAP_UNWRAP_CLEAR_DEPOSIT_BROKER:
          return (
            <div>
              Clear <b>{activeUnwrappedToken}</b> broker
            </div>
          );
      }
    }
    return (
      <div>
        Wrap{" "}
        <b>
          {formatAmount(wrapTokenAmount, false, null, 5)} {activeUnwrappedToken}
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
  renderDoNotWrapAllEtherWarning() {
    const { activeUnwrappedToken, activeUnwrappedTokenBalance } = this.props;
    if (
      activeUnwrappedToken === TOKEN_ETHER &&
      activeUnwrappedTokenBalance &&
      activeUnwrappedTokenBalance.gt(0)
    ) {
      return <OasisDontWrapAllEther />;
    } else {
      return <div />;
    }
  }

  render() {
    const {
      valid,
      handleSubmit,
      activeUnwrappedToken,
      disabled,
      globalFormLock,
      onFormChange,
      wrapTokenAmount,
      activeUnwrappedTokenBalance
    } = this.props;
    return (
      <form onChange={onFormChange} onSubmit={handleSubmit}>
        <table className={tableStyles.table}>
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
                      onClick={this.setWrapMax}
                      disabled={disabled || globalFormLock || !isNumericAndGreaterThanZero(activeUnwrappedTokenBalance)}
                    >
                      <span style={{ fontSize: "10px" }}>wrap max</span>
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
                      disabled={disabled || globalFormLock}
                    />
                  </div>
                </div>
              </td>
              <td className={tableStyles.currency}>{activeUnwrappedToken}</td>
            </tr>
          </tbody>
        </table>
        <div>{this.renderTransactionStatus()}</div>
        <div>
          {activeUnwrappedTokenBalance < wrapTokenAmount && (
            <OasisInsufficientAmountOfToken tokenName={activeUnwrappedToken} />
          )}
        </div>
        <div className={`${styles.footer} ${widgetStyles.OasisWidgetFooter}`}>
          {this.renderDoNotWrapAllEtherWarning()}
          <OasisButton
            type="submit"
            disabled={
              !valid ||
              disabled ||
              !isNumericAndGreaterThanZero(wrapTokenAmount)
            }
            className={styles.footerBtn}
          >
            Wrap
          </OasisButton>
        </div>
      </form>
    );
  }

  onTotalFieldSectionFocus() {
    this.setState({ showMaxButton: true });
  }

  onTotalFieldSectionBlur() {
    if (!this.isUnmounted) {
      setTimeout(
        () => this.setState({ showMaxButton: false }),
        SETMAXBTN_HIDE_DELAY_MS
      );
    }
  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }
}

export function mapStateToProps(state, { form }) {
  return {
    activeUnwrappedTokenBalance: wrapUnwrap.activeUnwrappedTokenBalance(
      state,
      true
    ),
    wrapTokenAmount: wrapUnwrap.wrapTokenAmount(state, form),
    globalFormLock: platform.globalFormLock(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    setWrapMax: wrapUnwrapReducer.actions.setWrapMax
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTokenWrapFormWrapper.propTypes = propTypes;
OasisTokenWrapFormWrapper.displayName = "OasisTokenWrapForm";
export default connect(mapStateToProps, mapDispatchToProps)(
  reduxForm({})(
    CSSModules(
      OasisTokenWrapFormWrapper,
      { tableStyles, styles, widgetStyles },
      { allowMultiple: true }
    )
  )
);
