import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";

import styles from "./FlexBox.scss";
import CSSModules from "react-css-modules/dist/index";

const propTypes = {
  children: PropTypes.node,
  justifyContent: PropTypes.string,
  vertical: PropTypes.bool,
  wrap: PropTypes.bool,
  wrapXXS: PropTypes.bool,
  inlineXXS: PropTypes.bool,
  alignItems: PropTypes.string,
  className: PropTypes.string,
  alignContent: PropTypes.string,
  additionalStyles: PropTypes.string,
  hidden: PropTypes.bool
};

const defaultProps = {
  vertical: false,
  className: "",
  wrap: false,
  justifyContent: "normal",
  alignItems: "stretch",
  alignContent: "stretch"
};

export class FlexBox extends PureComponent {
  render() {
    const {
      vertical,
      wrap,
      justifyContent,
      alignItems,
      alignContent,
      className,
      additionalStyles,
      wrapXXS,
      inlineXXS
    } = this.props;

    const inlineStyles = {
      justifyContent,
      alignItems,
      alignContent,
      ...additionalStyles
    };

    const divClasses = `
      ${styles.box}
      ${vertical ? styles.vertical : styles.horizontal}
      ${wrap ? styles.wrap : ""}
      ${wrapXXS ? styles.wrapXXS: ""}
      ${inlineXXS ? styles.inlineXXS : ""}
      ${className}
    `;
    return (
      <div
        hidden={this.props.hidden}
        style={inlineStyles}
        className={divClasses}
      >
        {this.props.children}
      </div>
    );
  }
}

FlexBox.displayName = "FlexBox";
FlexBox.propTypes = propTypes;
FlexBox.defaultProps = defaultProps;
export default CSSModules(FlexBox, styles);
