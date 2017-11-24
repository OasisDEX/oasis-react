import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisTransferHistory.scss';

const propTypes = PropTypes && {};
const defaultProps = {};

class OasisTransferHistory extends PureComponent {
  render() {
    return (
      <div className={styles.base}>
      </div>
    );
  }
}

OasisTransferHistory.displayName = 'OasisTransferHistory';
OasisTransferHistory.propTypes = propTypes;
OasisTransferHistory.defaultProps = defaultProps;
export default OasisTransferHistory;
