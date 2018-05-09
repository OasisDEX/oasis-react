import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import CSSModules from "react-css-modules";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from "./OasisIcon.scss";

const failedIcon = require("../assets/od-icons/icon-failed.svg");
const loadingIcon = require("../assets/od-icons/icon-loading.svg");
const successIcon = require("../assets/od-icons/icon-tick.svg");
const arrowUpIcon = require("../assets/od-icons/icon_arrow_up.svg");
const arrowDownIcon = require("../assets/od-icons/icon_arrow_down.svg");
const arrowRightIcon = require("../assets/od-icons/icon_arrow_right.svg");
const arrowLeftIcon = require("../assets/od-icons/icon_arrow_left.svg");
const idleIcon = require("../assets/od-icons/icon_idle.svg");
const infoIcon = require("../assets/od-icons/icon-info.svg");
const warningIcon = require("../assets/od-icons/icon-warning.svg");



const propTypes = PropTypes && {
  icon: PropTypes.oneOf([
    "loading",
    "failed",
    "success",
    "arrowDown",
    "arrowUp",
    "arrowLeft",
    "arrowRight",
    "idle",
    "info",
    "warning"
  ]).isRequired,
  onClick: PropTypes.func,
  color: PropTypes.string
};

const defaultProps = {
  size: "md"
};

const icons = {
  loading: loadingIcon,
  failed: failedIcon,
  success: successIcon,
  arrowUp: arrowUpIcon,
  arrowDown: arrowDownIcon,
  arrowLeft: arrowLeftIcon,
  arrowRight: arrowRightIcon,
  idle: idleIcon,
  info:infoIcon,
  warning: warningIcon
};

const colors = {
  danger: styles.danger
};

const sizes = {
  lg: 48,
  md: 24,
  sm: 12
};

export class OasisIcon extends PureComponent {
  render() {
    const { size, icon, color } = this.props;
    return (
      <div onClick={this.props.onClick} className={`${styles.base} ${this.props.onClick ? styles.clickable: '' }`}>
        <img
          className={`${ color ? colors[color] : '' }`}
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
export default CSSModules(OasisIcon, { styles });
