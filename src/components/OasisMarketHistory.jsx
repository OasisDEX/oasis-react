import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import moment from 'moment';

import OasisWidgetFrame from '../containers/OasisWidgetFrame';
import { OasisTable } from './OasisTable';
import { tradeType, price, formatTradeType, formatPrice, getBaseAndQuotePrice } from '../utils/tokens/pair';
import { orderBytTimestamp, SORT_DESC } from '../utils/sort';

// import ImmutablePropTypes from 'react-immutable-proptypes';

const propTypes = PropTypes && {
  activeTradingPair: PropTypes.object.isRequired,
  trades: PropTypes.array.isRequired,
};
const defaultProps = {};

const colDefinition = (baseToken, quoteToken) => {
  return [
    { heading: 'date', key: 'date' },
    { heading: 'action', key: 'tradeType' },
    { heading: `price`, key: 'price' },
    { heading: `${quoteToken}`, key: 'quotePrice' },
    { heading: `${baseToken}`, key: 'basePrice' },
  ];
};

class OasisMarketHistory extends PureComponent {
  render() {
    const { trades, activeTradingPair: { baseToken, quoteToken } } = this.props;
    const tradesSorted = orderBytTimestamp(trades, SORT_DESC);
    const marketHistory = tradesSorted.map(tradeHistoryEntry => {
      const { basePrice, quotePrice } = getBaseAndQuotePrice(tradeHistoryEntry, baseToken, quoteToken);
      return {
        date: moment.unix(tradeHistoryEntry.timestamp).format('DD-MM-HH:mm'),
        tradeType: formatTradeType(
          tradeType(tradeHistoryEntry, baseToken),
        ),
        basePrice: formatPrice(basePrice, true),
        quotePrice: formatPrice(quotePrice, true),
        price: formatPrice(
          price(tradeHistoryEntry, baseToken, quoteToken),
        ),
      };
    });

    return (
      <OasisWidgetFrame heading={'MARKET HISTORY'}>
        <OasisTable rows={marketHistory} col={colDefinition(baseToken, quoteToken)}/>
      </OasisWidgetFrame>
    );
  }
}

OasisMarketHistory.displayName = 'OasisMarketHistory';
OasisMarketHistory.propTypes = propTypes;
OasisMarketHistory.defaultProps = defaultProps;
export default OasisMarketHistory;
