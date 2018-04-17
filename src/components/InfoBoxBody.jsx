import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import styles from './InfoBox.scss';
import CSSModules from "react-css-modules/dist/index";

const propTypes = PropTypes && {
  children: PropTypes.node,
  color: PropTypes.string,
  vertical: PropTypes.bool,
};

const defaultProps = {
    color: "default",
    vertical: false,
    className: ''
};

export class InfoBoxBody extends PureComponent {

  render() {
    const { className } = this.props;
    return (
      <div
          className={`${styles.boxBody} ${className}`}
      >
          {this.props.children}
      </div>
    );
  }
}

InfoBoxBody.displayName = 'InfoBoxBody';
InfoBoxBody.propTypes = propTypes;
InfoBoxBody.defaultProps = defaultProps;
export default CSSModules(InfoBoxBody, styles);
