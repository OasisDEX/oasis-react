import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisMarket.scss';
import CSSModules from 'react-css-modules';

const propTypes = PropTypes && {
};
const defaultProps = {};


export class OasisMarket extends PureComponent {
  render() {
    const { marketAddress } = this.props;
    return (
      <div styleName="OasisMarket">
        <span> Market: </span>
        <div styleName="OasisMarketAddress">
          <span>{marketAddress}</span>
        </div>
      </div>
    );
  }
}

OasisMarket.displayName = 'OasisMarket';
OasisMarket.propTypes = propTypes;
OasisMarket.defaultProps = defaultProps;
export default CSSModules(OasisMarket, styles);
