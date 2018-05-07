import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";

import styles from "./InfoBox.scss";
import CSSModules from "react-css-modules/dist/index";

const propTypes = PropTypes && {
  children: PropTypes.node,
  color: PropTypes.string,
  size: PropTypes.string,
  justifyContent: PropTypes.string,
  vertical: PropTypes.bool,
  fullWidth: PropTypes.bool,
  noBorder: PropTypes.bool
};

const defaultProps = {
  color: "default",
  size: "md",
  vertical: false,
  className: "",
  justifyContent: "normal"
};

export class InfoBox extends PureComponent {
  render() {
    const {
      color,
      size,
      vertical,
      justifyContent,
      className,
      fullWidth,
      noBorder
    } = this.props;
    return (
      <div
        style={{ justifyContent: justifyContent }}
        className={
         `${!noBorder ? styles.box: ''}
          ${styles[color]}
          ${!noBorder? styles[size]: styles['sm']}
          ${vertical ? styles.vertical : ""}
          ${className}
          ${fullWidth ? styles.fullWidth : ""}
          ${noBorder ? styles.noBorder: ''}
          `
        }
      >
        {this.props.children}
      </div>
    );
  }
}

InfoBox.displayName = "InfoBox";
InfoBox.propTypes = propTypes;
InfoBox.defaultProps = defaultProps;
export default CSSModules(InfoBox, styles);
