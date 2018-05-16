import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Field, reduxForm } from "redux-form/immutable";
import { normalize } from "../utils/forms/offers";
import wrapUnwrap from "../store/selectors/wrapUnwrap";
import web3 from "../bootstrap/web3";
import wrapUnwrapReducer from "../store/reducers/wrapUnwrap";
import OasisButton from "../components/OasisButton";
import tableStyles from "../styles/modules/_table.scss";
import styles from "./OasisTokenWrapForm.scss";
import CSSModules from "react-css-modules";
import OasisTransactionStatusWrapper from "./OasisTransactionStatus";
import { formatAmount } from "../utils/tokens/pair";
import { TX_WRAP } from "../store/reducers/transactions";

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  wrapTokenAmount: PropTypes.string
};

const inputStyle = { textAlign: "right", width: "100%" };

export class OasisTokenWrapFormWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.validate = this.validate.bind(this);
    this.setWrapMax = this.setWrapMax.bind(this);
  }

  validate(value) {
    const { activeUnwrappedTokenBalance } = this.props;
    if (!value) {
      return "VALIDATE_ERROR/VALUE_IS_REQUIRED";
    } else if (web3.fromWei(activeUnwrappedTokenBalance).lt(value)) {
      return "VALIDATE_ERROR/WRAP_AMOUNT_GREATER_THAN_TOKEN_BALANCE";
    }
  }

  setWrapMax() {
    this.props.actions.setWrapMax();
  }

  transactionInfoBlock() {
    const { wrapTokenAmount, activeUnwrappedToken } = this.props;
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
    if (txStatus) {
      return (
        <OasisTransactionStatusWrapper
          customBlock={this.transactionInfoBlock()}
          localStatus={txStatus}
          txTimestamp={txStartTimestamp}
          txType={TX_WRAP}
        />
      );
    } else return null;
  }
  render() {
    const { valid, handleSubmit, activeUnwrappedToken } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <table className={tableStyles.table}>
          <tbody>
            <tr>
              <th>Amount</th>
              <td className={tableStyles.withInput}>
                <div className={tableStyles.inputGroup}>
                  <OasisButton
                    type="button"
                    size="xs"
                    className={tableStyles.inputBtn}
                    onClick={this.setWrapMax}
                  >
                    wrap max
                  </OasisButton>
                  <Field
                    style={inputStyle}
                    required
                    validate={this.validate}
                    autoComplete="off"
                    name="amount"
                    component="input"
                    placeholder={0}
                    normalize={normalize}
                    type="text"
                  />
                </div>
              </td>
              <td className={tableStyles.currency}>{activeUnwrappedToken}</td>
            </tr>
          </tbody>
        </table>
        <div>{this.renderTransactionStatus()}</div>
        <div className={styles.footer}>
          <OasisButton type="submit" disabled={!valid}>
            Wrap
          </OasisButton>
        </div>
      </form>
    );
  }
}

export function mapStateToProps(state) {
  return {
    activeUnwrappedTokenBalance: wrapUnwrap.activeUnwrappedTokenBalance(
      state,
      true
    ),
    wrapTokenAmount: wrapUnwrap.wrapTokenAmount(state)
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
