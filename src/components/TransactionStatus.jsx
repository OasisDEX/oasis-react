import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';

import {
  TX_STATUS_AWAITING_CONFIRMATION,
  TX_STATUS_CANCELLED_BY_USER,
  TX_STATUS_CONFIRMED, TX_STATUS_REJECTED,
} from '../store/reducers/transactions';
import TransactionTimer from './TransactionTimer';
import EthercanLink from './EthercanLink';


const propTypes = PropTypes && {
  transaction: ImmutablePropTypes.map.isRequired
};
const defaultProps = {};


class TransactionStatus extends PureComponent {
  render() {
    const { transaction } = this.props;
    switch (transaction.get('txStatus')) {

      case TX_STATUS_CANCELLED_BY_USER: return (<div>Transaction cancelled by the user</div>);

      case TX_STATUS_AWAITING_CONFIRMATION: return (
        <div>
          Transaction is awaiting confirmation {<TransactionTimer transaction={transaction}/>}
        </div>
      );

      case TX_STATUS_CONFIRMED: return (
        <div>
          Transaction is <EthercanLink label={'confirmed'} txHash={transaction.get('txHash')}/>
           ( <TransactionTimer transaction={transaction}/> )
        </div>
      );

      case TX_STATUS_REJECTED: return (
        <div>Transaction was rejected</div>
      )
    }
  }
}

TransactionStatus.displayName = 'TransactionStatus';
TransactionStatus.propTypes = propTypes;
TransactionStatus.defaultProps = defaultProps;
export default TransactionStatus;
