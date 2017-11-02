import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisSellOrders.scss';


const propTypes = PropTypes && {
};
const defaultProps = {};


class OasisSellOrders extends PureComponent {
  render() {
    return (
      <div className={styles.base}>
        OasisSellOrders
      </div>
    );
  }
}

OasisSellOrders.displayName = 'OasisSellOrders';
OasisSellOrders.propTypes = propTypes;
OasisSellOrders.defaultProps = defaultProps;
export default OasisSellOrders;
