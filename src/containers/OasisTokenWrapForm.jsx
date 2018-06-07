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
import CSSModules from "react-css-modules";
import OasisTransactionStatusWrapperInfoBox from "./OasisTransactionStatusInfoBox";
import { formatAmount } from "../utils/tokens/pair";
import { TX_WRAP } from "../store/reducers/transactions";
import MaskedTokenAmountInput from "../components/MaskedTokenAmountInput";
import platform from "../store/selectors/platform";
import {SETMAXBTN_HIDE_DELAY_MS, TOKEN_ETHER} from "../constants";
import OasisDontWrapAllEther from '../components/OasisDontWrapAllEther';

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
      showMaxButton: false
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
    const { transactionState: { txStatus, txStartTimestamp } } = this.props;
    return (
      <OasisTransactionStatusWrapperInfoBox
        txStatus={txStatus}
        infoText={this.transactionInfoBlock}
        localStatus={txStatus}
        txTimestamp={txStartTimestamp}
        txType={TX_WRAP}
      />
    );
  }
  renderDontWrapAllEtherWarning() {
    const { activeUnwrappedToken, activeUnwrappedTokenBalance } = this.props;
    if(activeUnwrappedToken === TOKEN_ETHER && activeUnwrappedTokenBalance && activeUnwrappedTokenBalance.gt(0)) {
      return (<OasisDontWrapAllEther/>);
    } else { return <div></div>; }
  }

  render() {
    const {
      valid,
      handleSubmit,
      activeUnwrappedToken,
      disabled,
      globalFormLock,
      onFormChange
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
                      disabled={disabled || globalFormLock}
                    >
                      wrap max
                    </OasisButton>
                  )}
                  <div
                    style={{ display: "inlineBlock" }}
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
        <div className={styles.footer}>
          {this.renderDontWrapAllEtherWarning()}
          <OasisButton type="submit" disabled={!valid || disabled} className={styles.footerBtn}>
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
    setTimeout(
      () => this.setState({ showMaxButton: false }),
      SETMAXBTN_HIDE_DELAY_MS
    );
  }
}

export function mapStateToProps(state) {
  return {
    activeUnwrappedTokenBalance: wrapUnwrap.activeUnwrappedTokenBalance(
      state,
      true
    ),
    wrapTokenAmount: wrapUnwrap.wrapTokenAmount(state),
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
  reduxForm({
    form: "wrapToken"
  })(
    CSSModules(
      OasisTokenWrapFormWrapper,
      { tableStyles, styles },
      { allowMultiple: true }
    )
  )
);
