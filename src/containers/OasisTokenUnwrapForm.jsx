import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Field, reduxForm } from 'redux-form/immutable'
import { normalize } from '../utils/forms/offers';
import wrapUnwrap from '../store/selectors/wrapUnwrap';
import web3 from '../bootstrap/web3';
import wrapUnwrapReducer from '../store/reducers/wrapUnwrap';
import OasisButton from "../components/OasisButton";
import tableStyles from "../styles/modules/_table.scss";
import styles from "./OasisTokenWrapForm.scss";
import CSSModules from 'react-css-modules';
import OasisTransactionStatusWrapperInfoBox  from './OasisTransactionStatusInfoBox';
import { TX_UNWRAP } from '../store/reducers/transactions';
import { formatAmount } from '../utils/tokens/pair';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  activeUnwrappedTokenBalance: PropTypes.string
};



const inputStyle = { textAlign:'right', width: '100%' };

export class OasisTokenUnwrapFormWrapper extends PureComponent {

  constructor(props) {
    super(props);
    this.validate = this.validate.bind(this);
    this.setUnwrapMax = this.setUnwrapMax.bind(this);

  }

  validate(value) {
    const { activeWrappedTokenBalance } = this.props;
    if (!value) {
      return 'VALIDATE_ERROR/VALUE_IS_REQUIRED';
    }else if (web3.fromWei(activeWrappedTokenBalance).lt(value)) {
      return 'VALIDATE_ERROR/WRAP_AMOUNT_GREATER_THAN_TOKEN_BALANCE'
    }
  }

  setUnwrapMax() {
    this.props.actions.setUnwrapMax();
  }

  transactionInfoBlock() {
    const { unwrapTokenAmount, activeWrappedToken } = this.props;
    return (
      <div>
        Unwrap{" "}
        <b>
          {formatAmount(unwrapTokenAmount, false, null, 5)} {activeWrappedToken}
        </b>
      </div>
    );
  }

  renderTransactionStatus() {
    const { transactionState: { txStatus, txStartTimestamp } } = this.props;
    return <OasisTransactionStatusWrapperInfoBox
      txStatus={txStatus}
      infoText={this.transactionInfoBlock()}
      localStatus={txStatus}
      txTimestamp={txStartTimestamp}
      txType={TX_UNWRAP}
    />;
  }

  render() {
    const { valid, handleSubmit, activeWrappedToken } = this.props;
    return (
      <form onSubmit={handleSubmit}>
          <table className={tableStyles.table}>
            <tbody>
              <tr>
                <th>Amount</th>
                <td className={tableStyles.withInput}>
                  <div className={tableStyles.inputGroup}>
                    <OasisButton type="button" size="xs" className={tableStyles.inputBtn} onClick={this.setUnwrapMax}>
                      unwrap max
                    </OasisButton>
                    <Field
                      style={inputStyle}
                      required
                      validate={this.validate}
                      autoComplete="off"
                      name="amount"
                      component="input"
                      placeholder={0}
                      normalize={normalize} type="text"/>
                  </div>
                </td>
                <td className={tableStyles.currency}>
                  {activeWrappedToken}
                </td>
              </tr>
            </tbody>
          </table>
        <div>{this.renderTransactionStatus()}</div>
          <div className={styles.footer}>
            <OasisButton type="submit" disabled={!valid}>Unwrap</OasisButton>
          </div>
      </form>
    );
  }
}

export function mapStateToProps(state) {
  return {
    activeWrappedTokenBalance: wrapUnwrap.activeWrappedTokenBalance(state, true),
    unwrapTokenAmount: wrapUnwrap.unwrapTokenAmount(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    setUnwrapMax: wrapUnwrapReducer.actions.setUnwrapMax
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTokenUnwrapFormWrapper.propTypes = propTypes;
OasisTokenUnwrapFormWrapper.displayName = 'OasisTokenUnwrapForm';
export default connect(mapStateToProps, mapDispatchToProps)(
  reduxForm({
    form: 'unwrapToken',
  })(CSSModules(OasisTokenUnwrapFormWrapper, {tableStyles, styles}, {allowMultiple: true}))
);
