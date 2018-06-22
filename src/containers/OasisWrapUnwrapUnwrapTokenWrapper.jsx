import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import OasisWrapUnwrapUnwrap from "../components/OasisWrapUnwrapUnwrap";
import wrapUnwrap from "../store/selectors/wrapUnwrap";
import wrapUnwrapReducer, {
  UNWRAP_TOKEN_WRAPPER
} from "../store/reducers/wrapUnwrap";
import {
  TX_STATUS_AWAITING_CONFIRMATION,
  TX_STATUS_AWAITING_USER_ACCEPTANCE,
  TX_STATUS_CANCELLED_BY_USER,
  TX_STATUS_CONFIRMED,
  TX_STATUS_REJECTED,
  TX_UNWRAP_TOKEN_WRAPPER
} from "../store/reducers/transactions";
import accounts from "../store/selectors/accounts";
import { TOKEN_WRAPPED_ETH, TOKEN_WRAPPED_GNT } from '../constants';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  wrappedToken: PropTypes.oneOf([
    TOKEN_WRAPPED_ETH,
    TOKEN_WRAPPED_GNT
  ])
};

export class OasisWrapUnwrapUnwrapWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.componentIsUnmounted = false;
    this.makeUnwrap = this.makeUnwrap.bind(this);
    this.onFormChange = this.onFormChange.bind(this);
  }

  makeUnwrap() {
    this.setState(
      {
        disableTransferButton: true,
        txStatus: false,
        txStartTimestamp: undefined
      },
      () =>
        this.props.actions.unwrapToken({
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

  onTransactionCompleted() {
    this.setState({
      txStatus: TX_STATUS_CONFIRMED
    });
    this.props.actions.resetActiveUnwrapForm(UNWRAP_TOKEN_WRAPPER);
    this.setState({
      disableForm: false
    });
  }

  onTransactionRejected({ txHash }) {
    this.setState({
      txStatus: TX_STATUS_REJECTED,
      txHash,
      disableForm: false
    });
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
    const {
      hidden,
      activeWrappedToken,
      activeWrappedTokenBalance,
      wrappedToken
    } = this.props;
    const { txStatus, txStartTimestamp, disableForm } = this.state;
    return (
      <OasisWrapUnwrapUnwrap
        hidden={hidden}
        txType={TX_UNWRAP_TOKEN_WRAPPER}
        form={"unwrapTokenWrapper"}
        wrappedToken={wrappedToken}
        transactionState={{ txStatus, txStartTimestamp }}
        onSubmit={this.makeUnwrap}
        onFormChange={this.onFormChange}
        disableForm={disableForm}
        activeWrappedToken={activeWrappedToken}
        activeWrappedTokenBalance={activeWrappedTokenBalance}
      />
    );
  }
  componentDidUpdate(prevProps) {
    if (
      this.props.activeWrappedToken &&
      this.props.activeWrappedToken !== prevProps.activeWrappedToken
    ) {
      if (!this.state.txStatus) {
        this.props.actions.resetActiveUnwrapForm(UNWRAP_TOKEN_WRAPPER);
      }
    }
  }

  componentWillUnmount() {
    this.componentIsUnmounted = true;
  }
}

export function mapStateToProps(state) {
  return {
    defaultAccount: accounts.defaultAccount(state),
    activeWrappedTokenBalance: wrapUnwrap.activeWrappedTokenBalance(state),
    activeWrappedToken: wrapUnwrap.activeWrappedToken(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    unwrapToken: wrapUnwrapReducer.actions.unwrapTokenEpic,
    resetActiveUnwrapForm: wrapUnwrapReducer.actions.resetActiveUnwrapForm
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisWrapUnwrapUnwrapWrapper.propTypes = propTypes;
OasisWrapUnwrapUnwrapWrapper.displayName = "OasisWrapUnwrapUnwrap";
export default connect(mapStateToProps, mapDispatchToProps)(
  OasisWrapUnwrapUnwrapWrapper
);
