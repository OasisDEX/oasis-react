import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import styles from './OasisSelect.scss';

const propTypes = PropTypes && {
  children: PropTypes.node,
  caption: PropTypes.string,
};

const defaultProps = {
    size: "md"
};

class OasisSelect extends PureComponent {

  render() {
    const { disabled, size, selectClassName, className, onChange, value } = this.props;
    return (
      <span className={`${styles.selectContainer} selectContainer ${styles[size]} ${className}`}>
        <select
            onChange={onChange}
            value={value}
            className={`${styles.select} ${selectClassName}`}
            disabled={disabled}
        >
          {this.props.children}
        </select>
          <span
            className={`glyphicon glyphicon-chevron-down ${styles.selectGlyph}`}
          >

          </span>
      </span>
    );
  }
}

OasisSelect.displayName = 'OasisSelect';
OasisSelect.propTypes = propTypes;
OasisSelect.defaultProps = defaultProps;
export default OasisSelect;
