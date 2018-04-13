import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import styles from './OasisButton.scss';

const propTypes = PropTypes && {
  children: PropTypes.node,
  caption: PropTypes.string,
};

const defaultProps = {
    btnType: "button",
    color: "default",
    size: "md"
};

class OasisButton extends PureComponent {

  render() {
    const { disabled, btnType, caption, color, size, className } = this.props;
    return (
      <button
          className={`${styles.button} ${styles[color]} ${styles[size]} ${className}`}
          disabled={disabled}
          type={btnType}
          onClick={this.props.onClick}
      >
          {caption || this.props.children}
      </button>
    );
  }
}

OasisButton.displayName = 'OasisButton';
OasisButton.propTypes = propTypes;
OasisButton.defaultProps = defaultProps;
export default OasisButton;
