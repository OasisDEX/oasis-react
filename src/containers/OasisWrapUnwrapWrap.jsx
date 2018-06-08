import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import wrapUnwrap from "../store/selectors/wrapUnwrap";
import OasisWrapUnwrapWrap from "../components/OasisWrapUnwrapWrap";
import wrapUnwrapReducer, { WRAP_TOKEN_WRAPPER_NEXT_TRANSACTION_DELAY_MS } from '../store/reducers/wrapUnwrap';
import {
  TX_STATUS_AWAITING_CONFIRMATION,
  TX_STATUS_AWAITING_USER_ACCEPTANCE,
  TX_STATUS_CANCELLED_BY_USER,
  TX_STATUS_CONFIRMED,
  TX_STATUS_REJECTED
} from "../store/reducers/transactions";
import accounts from "../store/selectors/accounts";

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class OasisWrapUnwrapWrapWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.makeWrap = this.makeWrap.bind(this);
    this.onFormChange = this.onFormChange.bind(this);
  }

  makeWrap() {
    this.setState(
      {
        disableTransferButton: true,
        txStatus: false,
        txStartTimestamp: undefined
      },
      () =>
        this.props.actions.wrapToken({
          onStart: this.onTransactionStart.bind(this),
          onCancelCleanup: this.onTransactionCancelledByUser.bind(this),
          onPending: this.onTransactionPending.bind(this),
          onCompleted: this.onTransactionCompleted.bind(this),
          onRejected: this.onTransactionRejected.bind(this)
        })
    );
  }

  onTransactionStart(txStartTimestamp, txStartMeta) {
    this.setState({
      txStatus: TX_STATUS_AWAITING_USER_ACCEPTANCE,
      disableForm: true,
      lockCancelButton: true,
      txStartMeta
    });
  }

  onTransactionCancelledByUser() {
    this.setState({
      txStatus: TX_STATUS_CANCELLED_BY_USER,
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

  onTransactionCompleted(to, hasNextTransaction) {
    this.setState({
      txStatus: TX_STATUS_CONFIRMED
    });
    if (hasNextTransaction) {
      this.hasNextTransaction = true;
      setTimeout(() => {
        this.setState({
          txStatus: undefined,
          txStartTimestamp: undefined
        })
      }, WRAP_TOKEN_WRAPPER_NEXT_TRANSACTION_DELAY_MS - 1);
    } else {
      this.hasNextTransaction = false;
      this.props.actions.resetActiveWrapForm();
      this.setState({
        disableForm: false
      });
    }
  }

  onTransactionRejected({ txHash }) {
    this.setState({
      txStatus: TX_STATUS_REJECTED,
      txHash,
      disableForm: false
    });
  }

  onFormChange() {
    if (!this.hasNextTransaction) {
      this.setState({
        txStatus: undefined,
        txStartTimestamp: undefined
      });
    }
  }

  render() {
    const { activeUnwrappedToken, activeUnwrappedTokenBalance } = this.props;
    const { txStatus, txStartTimestamp, txStartMeta, disableForm } = this.state;
    return (
      <OasisWrapUnwrapWrap
        transactionState={{ txStatus, txStartTimestamp, txStartMeta }}
        onSubmit={this.makeWrap}
        onFormChange={this.onFormChange}
        disableForm={disableForm}
        activeUnwrappedToken={activeUnwrappedToken}
        activeUnwrappedTokenBalance={activeUnwrappedTokenBalance}
      />
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.activeUnwrappedToken && this.props.activeUnwrappedToken !== prevProps.activeUnwrappedToken){
      this.props.actions.resetActiveWrapForm();
      if (![TX_STATUS_AWAITING_CONFIRMATION].includes(this.state.txStatus))
      this.setState({
        txStatus: undefined,
        txStartTimestamp: undefined
      })
    }
  }
}

export function mapStateToProps(state) {
  return {
    defaultAccount: accounts.defaultAccount(state),
    activeUnwrappedToken: wrapUnwrap.activeUnwrappedToken(state),
    activeUnwrappedTokenBalance: wrapUnwrap.activeUnwrappedTokenBalance(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    wrapToken: wrapUnwrapReducer.actions.wrapTokenEpic,
    resetActiveWrapForm: wrapUnwrapReducer.actions.resetActiveWrapForm
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisWrapUnwrapWrapWrapper.propTypes = propTypes;
OasisWrapUnwrapWrapWrapper.displayName = "OasisWrapUnwrapWrap";
export default connect(mapStateToProps, mapDispatchToProps)(
  OasisWrapUnwrapWrapWrapper
);
