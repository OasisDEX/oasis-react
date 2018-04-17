import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './UnwrapStatus.scss';
import {
  TOKEN_UNWRAP_STATUS_AWAITING_UNWRAP_APPROVAL,
  TOKEN_UNWRAP_STATUS_UNWRAP_COMPLETE, TOKEN_UNWRAP_STATUS_UNWRAP_PENDING,
} from '../store/reducers/wrapUnwrap';


const propTypes = PropTypes && {
  activeTokenUnwrapStatus: PropTypes.string
};
const defaultProps = {};


class UnwrapStatus extends PureComponent {
  getStatus() {
    const { activeTokenUnwrapStatus } = this.props;
    switch (activeTokenUnwrapStatus) {
      case TOKEN_UNWRAP_STATUS_AWAITING_UNWRAP_APPROVAL: break;
      case TOKEN_UNWRAP_STATUS_UNWRAP_PENDING: break;
      case TOKEN_UNWRAP_STATUS_UNWRAP_COMPLETE: break;
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

UnwrapStatus.displayName = 'UnwrapStatus';
UnwrapStatus.propTypes = propTypes;
UnwrapStatus.defaultProps = defaultProps;
export default UnwrapStatus;
