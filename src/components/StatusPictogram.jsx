import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import CSSModules from "react-css-modules";

// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from "./StatusPictogram.scss";
import {
  TX_STATUS_AWAITING_CONFIRMATION,
  TX_STATUS_AWAITING_USER_ACCEPTANCE,
  TX_STATUS_CANCELLED_BY_USER,
  TX_STATUS_CONFIRMED,
  TX_STATUS_REJECTED
} from "../store/reducers/transactions";
import OasisIcon from "./OasisIcon";

const propTypes = PropTypes && {
  status: PropTypes.string
};
const defaultProps = {
  className: ''
};

export class StatusPictogram extends PureComponent {
  renderStatus() {
    switch (this.props.status) {
      case TX_STATUS_AWAITING_USER_ACCEPTANCE:
        return <OasisIcon icon="loading" />;

      case TX_STATUS_AWAITING_CONFIRMATION:
        return <OasisIcon icon="loading" />;

      case TX_STATUS_CANCELLED_BY_USER:
        return <OasisIcon icon="failed" />;

      case TX_STATUS_CONFIRMED:
        return <OasisIcon icon="success" />;
      case TX_STATUS_REJECTED:
        return <OasisIcon icon="failed" />;
    }
  }

  render() {
    const { className } = this.props;
    return <div className={`${styles.base} ${className}`}>{this.renderStatus()}</div>;
  }
}

StatusPictogram.displayName = "StatusPictogram";
StatusPictogram.propTypes = propTypes;
StatusPictogram.defaultProps = defaultProps;
export default CSSModules(StatusPictogram, { styles });
