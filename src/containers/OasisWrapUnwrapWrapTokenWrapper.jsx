import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import wrapUnwrap from "../store/selectors/wrapUnwrap";
import OasisWrapUnwrapWrapTokenWrapper from "../components/OasisWrapUnwrapWrap";
import wrapUnwrapReducer, {
  WRAP_TOKEN_WRAPPER,
  WRAP_TOKEN_WRAPPER_NEXT_TRANSACTION_DELAY_MS
} from "../store/reducers/wrapUnwrap";
import {
  TX_STATUS_AWAITING_CONFIRMATION,
  TX_STATUS_AWAITING_USER_ACCEPTANCE,
  TX_STATUS_CANCELLED_BY_USER,
  TX_STATUS_CONFIRMED,
  TX_STATUS_REJECTED,
  TX_WRAP_TOKEN_WRAPPER
} from "../store/reducers/transactions";
import accounts from "../store/selectors/accounts";
import { TOKEN_ETHER, TOKEN_GOLEM } from '../constants';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  unwrappedToken: PropTypes.oneOf([
    TOKEN_ETHER, TOKEN_GOLEM
  ])
};

export class OasisWrapUnwrapWrapTokenWrapperWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.makeWrap = this.makeWrap.bind(this);
    this.onFormChange = this.onFormChange.bind(this);
    this.componentIsUnmounted = false;
  }

  makeWrap() {
    this.setState(
      {
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
        });
      }, WRAP_TOKEN_WRAPPER_NEXT_TRANSACTION_DELAY_MS - 1);
    } else {
      this.hasNextTransaction = false;
      this.props.actions.resetActiveWrapForm(WRAP_TOKEN_WRAPPER);
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
    if (!this.hasNextTransaction && this.componentIsUnmounted === false) {
      this.setState({
        txStatus: undefined,
        txStartTimestamp: undefined
      });
    }
  }

  render() {
    const {
      hidden,
      activeUnwrappedToken,
      activeUnwrappedTokenBalance,
      unwrappedToken
    } = this.props;
    const { txStatus, txStartTimestamp, txStartMeta, disableForm } = this.state;
    return (
      <OasisWrapUnwrapWrapTokenWrapper
        unwrappedToken={unwrappedToken}
        hidden={hidden}
        txType={TX_WRAP_TOKEN_WRAPPER}
        form={"wrapTokenWrapper"}
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
    if (
      this.props.activeUnwrappedToken &&
      this.props.activeUnwrappedToken !== prevProps.activeUnwrappedToken
    ) {
      if (!this.state.txStatus) {
        this.props.actions.resetActiveWrapForm(WRAP_TOKEN_WRAPPER);
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

OasisWrapUnwrapWrapTokenWrapperWrapper.propTypes = propTypes;
OasisWrapUnwrapWrapTokenWrapperWrapper.displayName =
  "OasisWrapUnwrapWrapTokenWrapper";
export default connect(mapStateToProps, mapDispatchToProps)(
  OasisWrapUnwrapWrapTokenWrapperWrapper
);
