import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisWrapUnwrapUnwrap from '../components/OasisWrapUnwrapUnwrap';
import wrapUnwrap from '../store/selectors/wrapUnwrap';
import wrapUnwrapReducer from '../store/reducers/wrapUnwrap';
import {
  TX_STATUS_AWAITING_CONFIRMATION,
  TX_STATUS_AWAITING_USER_ACCEPTANCE,
  TX_STATUS_CONFIRMED,
  TX_STATUS_REJECTED,
} from '../store/reducers/transactions';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class OasisWrapUnwrapUnwrapWrapper extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {};
    this.makeUnwrap = this.makeUnwrap.bind(this);
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
        this.props.actions.resetActiveUnwrapForm();
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
    });
  }




  render() {
    const { activeWrappedToken, activeWrappedTokenBalance } = this.props;
    const { txStatus, txStartTimestamp } = this.state;
    return (
      <OasisWrapUnwrapUnwrap
        transactionState={{ txStatus, txStartTimestamp }}
        onSubmit={this.makeUnwrap}
        activeWrappedToken={activeWrappedToken}
        activeWrappedTokenBalance={activeWrappedTokenBalance}
      />
    );
  }
}

export function mapStateToProps(state) {
  return {
    activeWrappedTokenBalance: wrapUnwrap.activeWrappedTokenBalance(state),
    activeWrappedToken: wrapUnwrap.activeWrappedToken(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    unwrapToken: wrapUnwrapReducer.actions.unwrapTokenEpic,
    resetActiveUnwrapForm: wrapUnwrapReducer.actions.resetActiveUnwrapForm,

  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisWrapUnwrapUnwrapWrapper.propTypes = propTypes;
OasisWrapUnwrapUnwrapWrapper.displayName = 'OasisWrapUnwrapUnwrap';
export default connect(mapStateToProps, mapDispatchToProps)(OasisWrapUnwrapUnwrapWrapper);
