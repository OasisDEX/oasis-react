import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisBuyOrders.scss';


const propTypes = PropTypes && {};
const defaultProps = {};


class OasisBuyOrders extends PureComponent {
  render() {
    return (
      <div className={styles.base}>
        OasisBuyOrders
      </div>
    );
  }
}

OasisBuyOrders.displayName = 'OasisBuyOrders';
OasisBuyOrders.propTypes = propTypes;
OasisBuyOrders.defaultProps = defaultProps;
export default OasisBuyOrders;
