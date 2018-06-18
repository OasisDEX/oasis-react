import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";

import styles from "./OasisButton.scss";
import linkStyles from "./OasisLinkLikeButton.scss";

const propTypes = PropTypes && {
  children: PropTypes.node,
  caption: PropTypes.string,
  size: PropTypes.oneOf(["xs__smaller_text", "xs", "sm", "md", "lg"])
};

const defaultProps = {
  color: "default",
  size: "md"
};

class OasisLinkLikeButton extends PureComponent {
  render() {
    const {
      disabled,
      caption,
      children,
      color,
      size,
      className,
      href,
      ...props
    } = this.props;
    return (
      <a
        rel="noopener noreferrer"
        className={`${styles.button} ${linkStyles.btn} ${styles[color]} ${
          styles[size]
        } ${className} ${disabled ? styles.disabled : ""}`}
        href={disabled ? null : href}
        {...props}
      >
        {caption || children}
      </a>
    );
  }
}

OasisLinkLikeButton.displayName = "OasisLinkLikeButton";
OasisLinkLikeButton.propTypes = propTypes;
OasisLinkLikeButton.defaultProps = defaultProps;
export default OasisLinkLikeButton;
