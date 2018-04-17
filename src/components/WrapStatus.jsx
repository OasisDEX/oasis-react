import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './WrapStatus.scss';
import {
  TOKEN_WRAP_STATUS_AWAITING_TRANSFER_TO_BROKER_APPROVAL,
  TOKEN_WRAP_STATUS_AWAITING_TRANSFER_TO_WRAPPER_CONTRACT_APROVAL,
  TOKEN_WRAP_STATUS_TRANSFER_TO_BROKER_COMPLETE,
  TOKEN_WRAP_STATUS_TRANSFER_TO_BROKER_PENDING, TOKEN_WRAP_STATUS_WRAP_COMPLETE,
} from '../store/reducers/wrapUnwrap';


const propTypes = PropTypes && {
  activeTokenWrapStatus: PropTypes.string
};
const defaultProps = {};


class WrapStatus extends PureComponent {

  getStatus() {
    const { activeTokenWrapStatus } = this.props;
    switch (activeTokenWrapStatus) {
      case TOKEN_WRAP_STATUS_AWAITING_TRANSFER_TO_BROKER_APPROVAL: break;
      case TOKEN_WRAP_STATUS_TRANSFER_TO_BROKER_PENDING: break;
      case TOKEN_WRAP_STATUS_TRANSFER_TO_BROKER_COMPLETE: break;
      case TOKEN_WRAP_STATUS_AWAITING_TRANSFER_TO_WRAPPER_CONTRACT_APROVAL: break;
      case TOKEN_WRAP_STATUS_WRAP_COMPLETE: break;
      default: return null;
    }
  }

  render() {
    return (
      <div className={styles.base}>
        {this.getStatus()}
      </div>
    );
  }
}

WrapStatus.displayName = 'WrapStatus';
WrapStatus.propTypes = propTypes;
WrapStatus.defaultProps = defaultProps;
export default WrapStatus;
