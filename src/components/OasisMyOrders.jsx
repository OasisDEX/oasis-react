import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisMyOrders.scss';

const propTypes = PropTypes && {};
const defaultProps = {};

class OasisMyOrders extends PureComponent {
  render() {
    return (
      <div className={styles.base}>
        OasisMyOrders
      </div>
    );
  }
}

OasisMyOrders.displayName = 'OasisMyOrders';
OasisMyOrders.propTypes = propTypes;
OasisMyOrders.defaultProps = defaultProps;
export default OasisMyOrders;
