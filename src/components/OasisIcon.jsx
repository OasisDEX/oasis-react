import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import CSSModules from 'react-css-modules';
import styles from './OasisIcon.scss';
// import ImmutablePropTypes from 'react-immutable-proptypes';

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
const addIcon = require("../assets/ic_add_circle_24px.svg");
const subtractIcon = require("../assets/ic_remove_24px.svg");

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
    "warning",
    "add",
    "subtract"
  ]).isRequired,
  onClick: PropTypes.func,
  color: PropTypes.string
};

const defaultProps = {
  size: "lg",
  className: ""
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
  info: infoIcon,
  warning: warningIcon,
  add: addIcon,
  subtract: subtractIcon
};

const colors = {
  danger: styles.danger
};

const sizes = {
  xlg: 48,
  lg: 24,
  md: 18,
  sm: 12
};

export class OasisIcon extends PureComponent {
  render() {
    const { size, icon, color, onClick, className, ...props } = this.props;
    const classNames = `${styles.base} ${className} ${onClick ? styles.clickable : ""}`;
    const height = `${sizes[size]}px`;
    return (
      <div
        onClick={onClick} className={classNames} {...props}
      >
        <img
          className={`${color ? colors[color] : ""}`}
          style={{ width: height, height }}
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
