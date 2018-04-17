import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { BID, ASK } from '../store/reducers/trades';
import { tradeType, formatTradeType } from '../utils/tokens/pair';

import styles from './OasisTradeType.scss';
import CSSModules from 'react-css-modules';

const propTypes = PropTypes && {};
const defaultProps = {};

export class OasisTradeType extends PureComponent {
  render() {
    const { order, baseCurrency, type } = this.props;
    const tradeTypeEnum = type || tradeType(order, baseCurrency);

    const typeStyle = (type) => {
      if (!type) {
        return '';
      } else {
        switch (type) {
          case BID:
            return styles.buy;
          case ASK:
            return styles.sell;
        }
      }
    };

    return (
      <span className={`${typeStyle(tradeTypeEnum)}`}>
        {formatTradeType(tradeTypeEnum)}
      </span>

    );
  }
}

OasisTradeType.displayName = 'OasisTradeType';
OasisTradeType.propTypes = propTypes;
OasisTradeType.defaultProps = defaultProps;
export default CSSModules(OasisTradeType, styles);
