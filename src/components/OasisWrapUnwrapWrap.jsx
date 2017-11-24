import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisWrapUnwrapWrap.scss';

const propTypes = PropTypes && {};
const defaultProps = {};

class OasisWrapUnwrapWrap extends PureComponent {
  render() {
    return (
      <div className={styles.base}>
      </div>
    );
  }
}

OasisWrapUnwrapWrap.displayName = 'OasisWrapUnwrapWrap';
OasisWrapUnwrapWrap.propTypes = propTypes;
OasisWrapUnwrapWrap.defaultProps = defaultProps;
export default OasisWrapUnwrapWrap;
