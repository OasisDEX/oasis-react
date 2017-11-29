import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisMarket.scss';
import CSSModules from 'react-css-modules';

const propTypes = PropTypes && {
};
const defaultProps = {};


class OasisMarket extends PureComponent {
  render() {
    return (
      <div styleName="OasisMarket">
        <span> Market: </span>
        <div styleName="OasisMarketAddress">
          <span> 0x6cD4471480e2969b3D696fBd17530E85112F3fF6 </span>
        </div>
      </div>
    );
  }
}

OasisMarket.displayName = 'OasisMarket';
OasisMarket.propTypes = propTypes;
OasisMarket.defaultProps = defaultProps;
export default CSSModules(OasisMarket, styles);
