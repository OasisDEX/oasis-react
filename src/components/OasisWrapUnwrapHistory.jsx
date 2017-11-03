import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisWrapUnwrapHistory.scss';


const propTypes = PropTypes && {
};
const defaultProps = {};


class OasisWrapUnwrapHistory extends PureComponent {
  render() {
    return (
      <div className={styles.base}>
      </div>
    );
  }
}

OasisWrapUnwrapHistory.displayName = 'OasisWrapUnwrapHistory';
OasisWrapUnwrapHistory.propTypes = propTypes;
OasisWrapUnwrapHistory.defaultProps = defaultProps;
export default OasisWrapUnwrapHistory;
