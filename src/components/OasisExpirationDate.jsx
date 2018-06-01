import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from "./OasisExpirationDate.scss";
import CSSModules from "react-css-modules";
import * as moment from "moment";
import OasisLoadingIndicator from "./OasisLoadingIndicator";

const propTypes = PropTypes && {
  timestamp: PropTypes.number.isRequired
};
const defaultProps = {};

const formatTime = ts =>
  ts ? (
    moment.unix(ts).format("DD-M-YYYY")
  ) : (
    <div style={{ marginLeft: 20 }}>
      <OasisLoadingIndicator />
    </div>
  );

export class OasisExpirationDate extends PureComponent {
  render() {
    const { timestamp } = this.props;
    return (
      <div styleName="ClosingTime">
        <div> CLOSING TIME </div>
        <div styleName="Date">{formatTime(timestamp)}</div>
      </div>
    );
  }
}

OasisExpirationDate.displayName = "OasisExpirationDate";
OasisExpirationDate.propTypes = propTypes;
OasisExpirationDate.defaultProps = defaultProps;

export default CSSModules(OasisExpirationDate, styles);
