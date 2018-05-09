import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisTransactionIsAwaitingSign.scss';
import StatusPictogram from './StatusPictogram';
import { TX_STATUS_AWAITING_USER_ACCEPTANCE } from '../store/reducers/transactions';


const propTypes = PropTypes && {
};
const defaultProps = {};


class OasisTransactionIsAwaitingSign extends PureComponent {
  render() {
    return (
      <div className={styles.base}>
        Sign Trans. <StatusPictogram status={TX_STATUS_AWAITING_USER_ACCEPTANCE}/>
      </div>
    );
  }
}

OasisTransactionIsAwaitingSign.displayName = 'OasisTransactionIsAwaitingSign';
OasisTransactionIsAwaitingSign.propTypes = propTypes;
OasisTransactionIsAwaitingSign.defaultProps = defaultProps;
export default OasisTransactionIsAwaitingSign;
