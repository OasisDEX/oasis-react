import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import OasisTokenSelectWrapper from "./OasisTokenSelect";
import TokenTransferFormWrapper from "./TokenTransferForm";
import OasisTokenBalanceSummary from "./OasisTokenBalanceSummary";
import OasisWidgetFrame from "../containers/OasisWidgetFrame";
import styles from "./OasisTokenTransfer.scss"

import transfersReducer from "../store/reducers/transfers";
import transfers from "../store/selectors/transfers";
import {
  TX__GROUP__TRANSFERS,
  TX_STATUS_AWAITING_CONFIRMATION,
  TX_STATUS_AWAITING_USER_ACCEPTANCE,
  TX_STATUS_CANCELLED_BY_USER,
  TX_STATUS_CONFIRMED,
  TX_STATUS_REJECTED
} from "../store/reducers/transactions";
import { formatAmount } from "../utils/tokens/pair";
import textStyles from "../styles/modules/_typography.scss";
import CSSModules from "react-css-modules/dist/index";
import { OasisTransactionStatusWrapperInfoBox } from "./OasisTransactionStatusInfoBox";

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  selectedToken: PropTypes.string
};

export class OasisTokenTransferWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.componentIsUnmounted = false;
    this.makeTransfer = this.makeTransfer.bind(this);
    this.onFormChange = this.onFormChange.bind(this);
  }

  async makeTransfer() {
    this.setState(
      {
        disableTransferButton: true,
        txStatus: false,
        txStartTimestamp: undefined
      },
      () =>
        this.props.actions.makeTransfer({
          onStart: this.onTransactionStart.bind(this),
          onCancelCleanup: this.onTransactionCancelledByUser.bind(this),
          onPending: this.onTransactionPending.bind(this),
          onCompleted: this.onTransactionCompleted.bind(this),
          onRejected: this.onTransactionRejected.bind(this)
        })
    );
  }

  onTransactionStart() {
    this.setState({
      txStatus: TX_STATUS_AWAITING_USER_ACCEPTANCE,
      disableForm: true
    });
  }

  onTransactionCancelledByUser() {
    this.setState({ disableTransferButton: false });
    this.setState({
      txStatus: TX_STATUS_CANCELLED_BY_USER,
      disableForm: false
    });
  }
  onTransactionPending({ txStartTimestamp }) {
    this.setState({
      txStatus: TX_STATUS_AWAITING_CONFIRMATION,
      txStartTimestamp
    });
  }

  onTransactionCompleted() {
    this.setState({
      txStatus: TX_STATUS_CONFIRMED,
      disableForm: false
    });
    this.props.actions.resetTransferForm();
  }

  onTransactionRejected({ txHash }) {
    this.setState({
      txStatus: TX_STATUS_REJECTED,
      txHash,
      disableForm: false
    });
  }

  shouldDisableForm() {
    const { disableForm } = this.state;
    return disableForm;
  }

  selectedToken() {
    return (
      <OasisTokenSelectWrapper
        onChange={() => this.props.actions.resetTransferForm()}
        disabled={this.shouldDisableForm()}
        name={"tokenTransfer"}
      />
    );
  }

  static transferInfo({ transferFormValues: { tokenAmount }, selectedToken }) {
    return (
      <div>
        Transfer
        <strong className={textStyles.spaceBoth}>
          {formatAmount(tokenAmount, false, null, 5)} {selectedToken}
        </strong>
      </div>
    );
  }

  renderTransactionStatus() {
    const { selectedToken, transferFormValues } = this.props;
    const { txStatus, txStartTimestamp } = this.state;
    if (transferFormValues && transferFormValues.tokenAmount) {
      this.transferFormValues = Object.create(transferFormValues);
    }
    return (
      this.transferFormValues && (
        <OasisTransactionStatusWrapperInfoBox
          txStatus={txStatus}
          infoText={OasisTokenTransferWrapper.transferInfo({
            selectedToken,
            transferFormValues: this.transferFormValues
          })}
          localStatus={txStatus}
          txTimestamp={txStartTimestamp}
          txType={TX__GROUP__TRANSFERS}
        />
      )
    );
  }

  onFormChange() {
    if (this.componentIsUnmounted === false) {
      this.setState({
        txStatus: undefined,
        txStartTimestamp: undefined
      });
    }
  }

  render() {
    const { txStatus } = this.state;
    const { selectedToken } = this.props;
    return (
      <OasisWidgetFrame
        className={styles.frame}
        heading="Transfer"
        spaceForContent={true}
        headingChildren={this.selectedToken()}
      >
        <OasisTokenBalanceSummary
          summary="Wallet"
          token={selectedToken}
          decimalPlaces={5}
          className={styles.tokenBalanceSummaryShorter}
        />
        <TokenTransferFormWrapper
          txStatus={txStatus}
          onFormChange={this.onFormChange}
          disabled={this.shouldDisableForm()}
          onSubmit={this.makeTransfer}
          transferState={this.renderTransactionStatus()}
        />
      </OasisWidgetFrame>
    );
  }

  componentWillUnmount() {
    this.componentIsUnmounted = true;
  }

}

export function mapStateToProps(state) {
  return {
    selectedToken: transfers.selectedToken(state),
    transferFormValues: transfers.getMakeTransferFormValues(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    makeTransfer: transfersReducer.actions.makeTransferEpic,
    resetTransferForm: transfersReducer.actions.resetTransferForm
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTokenTransferWrapper.propTypes = propTypes;
OasisTokenTransferWrapper.displayName = "OasisTokenTransfer";
export default connect(mapStateToProps, mapDispatchToProps)(
  CSSModules(OasisTokenTransferWrapper, { textStyles, styles }, { allowMultiple: true })
);
