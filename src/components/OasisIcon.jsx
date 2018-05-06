import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from "./OasisIcon.scss";

const failedIcon = require("../assets/od-icons/icon-failed.svg");
const loadingIcon = require("../assets/od-icons/icon-loading.svg");
const successIcon = require("../assets/od-icons/icon-tick.svg");
const arrowDownIcon = require("../assets/od-icons/icon_arrow_down.svg");
const arrowRightIcon = require("../assets/od-icons/icon_arrow_right.svg");

const propTypes = PropTypes && {
  icon: PropTypes.oneOf(["loading", "failed", "success"]).isRequired
};

const defaultProps = {
  size: "md"
};

const icons = {
  loading: loadingIcon,
  failed: failedIcon,
  success: successIcon,
  arrowDown: arrowDownIcon,
  arrowRight: arrowRightIcon
};

const sizes = {
  lg: 48,
  md: 24,
  sm: 12
};

class OasisIcon extends PureComponent {
  render() {
    const { size, icon } = this.props;
    return (
      <div className={styles.base}>
        <img
          style={{ width: `${sizes[size]}px`, height: `${sizes[size]}px` }}
          src={icons[icon]}
        />
      </div>
    );
  }
}

OasisIcon.displayName = "OasisIcon";
OasisIcon.propTypes = propTypes;
OasisIcon.defaultProps = defaultProps;
export default OasisIcon;
