import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import './OasisSellOrders.scss';


const propTypes = PropTypes && {
};
const defaultProps = {};


class OasisSellOrders extends PureComponent {
  render() {
    return (
      <div className="OasisSellOrders">
        OasisSellOrders
      </div>
    );
  }
}

OasisSellOrders.displayName = 'OasisSellOrders';
OasisSellOrders.propTypes = propTypes;
OasisSellOrders.defaultProps = defaultProps;
export default OasisSellOrders;
