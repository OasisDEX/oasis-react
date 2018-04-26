import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './StatusPictogram.scss';
import {
  TX_STATUS_AWAITING_CONFIRMATION,
  TX_STATUS_AWAITING_USER_ACCEPTANCE,
  TX_STATUS_CANCELLED_BY_USER, TX_STATUS_CONFIRMED, TX_STATUS_REJECTED,
} from '../store/reducers/transactions';


const propTypes = PropTypes && {
  status: PropTypes.string
};
const defaultProps = {};


class StatusPictogram extends PureComponent {

  renderStatus() {

    switch (this.props.status) {

      case TX_STATUS_AWAITING_USER_ACCEPTANCE: return (
        <div>[A]</div>
      );

      case TX_STATUS_AWAITING_CONFIRMATION: return (
        <div>[p]</div>
      );

      case TX_STATUS_CANCELLED_BY_USER : return (
        <div>[!]</div>
      );

      case TX_STATUS_CONFIRMED: return (
        <div>[v]</div>
      );
      case TX_STATUS_REJECTED: return (
        <div>[!]</div>
      );
    }

  }

  render() {
    return (
      <div className={styles.base}>
        {this.renderStatus()}
      </div>
    );
  }
}

StatusPictogram.displayName = 'StatusPictogram';
StatusPictogram.propTypes = propTypes;
StatusPictogram.defaultProps = defaultProps;
export default StatusPictogram;
