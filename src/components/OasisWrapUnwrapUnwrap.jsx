import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisWrapUnwrapUnwrap.scss';

const propTypes = PropTypes && {};
const defaultProps = {};

class OasisWrapUnwrapUnwrap extends PureComponent {
  render() {
    return (
      <div className={styles.base}>
      </div>
    );
  }
}

OasisWrapUnwrapUnwrap.displayName = 'OasisWrapUnwrapUnwrap';
OasisWrapUnwrapUnwrap.propTypes = propTypes;
OasisWrapUnwrapUnwrap.defaultProps = defaultProps;
export default OasisWrapUnwrapUnwrap;
