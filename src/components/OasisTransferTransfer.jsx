import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisTransferTransfer.scss';

const propTypes = PropTypes && {};
const defaultProps = {};

class OasisTransferTransfer extends PureComponent {
  render() {
    return (
      <div className={styles.base}>
      </div>
    );
  }
}

OasisTransferTransfer.displayName = 'OasisTransferTransfer';
OasisTransferTransfer.propTypes = propTypes;
OasisTransferTransfer.defaultProps = defaultProps;
export default OasisTransferTransfer;
