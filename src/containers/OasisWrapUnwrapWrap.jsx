import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import wrapUnwrap from '../store/selectors/wrapUnwrap';
import OasisWrapUnwrapWrap from '../components/OasisWrapUnwrapWrap';
import wrapUnwrapReducer from '../store/reducers/wrapUnwrap';
import {
  TX_STATUS_AWAITING_CONFIRMATION,
  TX_STATUS_AWAITING_USER_ACCEPTANCE,
  TX_STATUS_CONFIRMED, TX_STATUS_REJECTED,
} from '../store/reducers/transactions';
import accounts from '../store/selectors/accounts';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class OasisWrapUnwrapWrapWrapper extends PureComponent {


  constructor(props) {
    super(props);
    this.state = {};
    this.makeWrap = this.makeWrap.bind(this);
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
      txStatus: undefined,
      disableForm: false,
      lockCancelButton: false
    });
    this.props.actions.resetActiveWrapForm();
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
      setTimeout(
        () => {
          this.props.actions.resetActiveWrapForm();
          this.setState({
            txStatus: undefined,
            txStartTimestamp: undefined,
            // disableForm: false
          });
        }, 3000
      );
    } else {
      setTimeout(
        () => {
          this.props.actions.resetActiveWrapForm();
          this.setState({
            txStatus: undefined,
            txStartTimestamp: undefined,
            disableForm: false
          });
        }, 3000
      )

    }
  }

  onTransactionRejected({ txHash }) {
    this.setState({
      txStatus: TX_STATUS_REJECTED,
      txHash,
      disableForm: false,
    });
  }


  render() {
    const { activeUnwrappedToken, activeUnwrappedTokenBalance } = this.props;
    const { txStatus, txStartTimestamp, txStartMeta } = this.state;
    return (
      <OasisWrapUnwrapWrap
        transactionState={{ txStatus, txStartTimestamp, txStartMeta }}
        onSubmit={this.makeWrap}
        activeUnwrappedToken={activeUnwrappedToken}
        activeUnwrappedTokenBalance={activeUnwrappedTokenBalance}
      />
    );
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
    resetActiveWrapForm: wrapUnwrapReducer.actions.resetActiveWrapForm,
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisWrapUnwrapWrapWrapper.propTypes = propTypes;
OasisWrapUnwrapWrapWrapper.displayName = 'OasisWrapUnwrapWrap';
export default connect(mapStateToProps, mapDispatchToProps)(OasisWrapUnwrapWrapWrapper);
