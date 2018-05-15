import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import OasisTokenSelectWrapper from "./OasisTokenSelect";
import TokenTransferFormWrapper from "./TokenTransferForm";
import OasisTokenBalanceSummary from "./OasisTokenBalanceSummary";
import OasisWidgetFrame from "../containers/OasisWidgetFrame";

import transfersReducer from "../store/reducers/transfers";
import transfers from "../store/selectors/transfers";
import {
  TX__GROUP__TRANSFERS,
  TX_STATUS_AWAITING_CONFIRMATION,
  TX_STATUS_AWAITING_USER_ACCEPTANCE,
  TX_STATUS_CONFIRMED,
  TX_STATUS_REJECTED
} from "../store/reducers/transactions";
import OasisTransactionStatusWrapper  from "./OasisTransactionStatus";
import { formatAmount } from '../utils/tokens/pair';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  selectedToken: PropTypes.string
};

export class OasisTokenTransferWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.makeTransfer = this.makeTransfer.bind(this);
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
      disableForm: true,
      lockCancelButton: true
    });
  }

  onTransactionCancelledByUser() {
    this.setState({ disableTransferButton: false });
    this.setState({
      txStatus: undefined,
      disableForm: false,
      lockCancelButton: false
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
      txStatus: TX_STATUS_CONFIRMED
    });
    setTimeout(
      () => {
        this.props.actions.resetTransferForm();
        this.setState({
          txStatus: undefined,
          txStartTimestamp: undefined,
          disableForm: false
        });
      }, 2000
    )
  }

  onTransactionRejected({ txHash }) {
    this.setState({
      txStatus: TX_STATUS_REJECTED,
      txHash,
      disableForm: false,
      disableTransferButton: false
    });
  }

  shouldDisable() {
    const { disableForm } = this.state;
    return disableForm;
  }
  selectedToken() {
    return (
      <OasisTokenSelectWrapper
        onChange={ () =>  this.props.actions.resetTransferForm() }
        disabled={this.shouldDisable()}
        name={"tokenTransfer"}
      />
    );
  }


  static transferInfo({ transferFormValues: {tokenAmount  }, selectedToken }) {
    return (
      <div>
        Transfer
        <b>
          {formatAmount(tokenAmount, false, null, 5)} {selectedToken}
        </b>
      </div>
    );
  }

  renderTransactionStatus() {
    const { selectedToken, transferFormValues } = this.props;
    const { txStatus, txStartTimestamp } = this.state;
    return txStatus ? (
      <OasisTransactionStatusWrapper
        customBlock={OasisTokenTransferWrapper.transferInfo({ selectedToken, transferFormValues })}
        localStatus={txStatus}
        txTimestamp={txStartTimestamp}
        txType={TX__GROUP__TRANSFERS}
      />
    ) : null;
  }

  render() {
    const { selectedToken } = this.props;
    return (
      <OasisWidgetFrame
        heading="Transfer"
        spaceForContent={true}
        headingChildren={this.selectedToken()}
      >
        <OasisTokenBalanceSummary
          summary="Wallet"
          token={selectedToken}
          decimalPlaces={5}
        />
        <TokenTransferFormWrapper
          disabled={this.shouldDisable()}
          onSubmit={this.makeTransfer}
        />
        <div style={{width: '100%'}}>{this.renderTransactionStatus()}</div>
      </OasisWidgetFrame>
    );
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
  OasisTokenTransferWrapper
);
