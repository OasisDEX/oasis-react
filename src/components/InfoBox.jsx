import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";

import styles from "./InfoBox.scss";
import CSSModules from "react-css-modules/dist/index";
import FlexBox from "./FlexBox";

const propTypes =  {
  children: PropTypes.node,
  color: PropTypes.string,
  size: PropTypes.string,
  justifyContent: PropTypes.string,
  vertical: PropTypes.bool,
  fullWidth: PropTypes.bool,
  noBorder: PropTypes.bool,
  hidden: PropTypes.bool,
  additionalStyles: PropTypes.object,
  className: PropTypes.string,
  wrapXXS: PropTypes.bool
};

const defaultProps = {
  color: "default",
  size: "md",
  className: ""
};

export class InfoBox extends PureComponent {
  render() {
    const {
      color,
      size,
      className,
      fullWidth,
      noBorder,
      additionalStyles,
      ...props
    } = this.props;
    return (
      <FlexBox
        additionalStyles={additionalStyles}
        hidden={this.props.hidden}
        className={`${styles.box}
          ${styles[color]}
          ${!noBorder ? styles[size] : styles["sm"]}
          ${className}
          ${fullWidth ? styles.fullWidth : ""}
          ${noBorder ? styles.noBorder : ""}
          `}
        {...props}
      >
        {this.props.children}
      </FlexBox>
    );
  }
}

InfoBox.displayName = "InfoBox";
InfoBox.propTypes = propTypes;
InfoBox.defaultProps = defaultProps;
export default CSSModules(InfoBox, styles);
