import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import OasisWidgetFrame from '../containers/OasisWidgetFrame';
import { OasisTable } from './OasisTable';
import { tradeType, price, formatTradeType, formatPrice, formatAmount } from '../utils/tokens/pair';
import { orderByTimestamp, DESCENDING } from '../utils/sort';

import ImmutablePropTypes from 'react-immutable-proptypes';

const propTypes = PropTypes && {
  activeTradingPair: PropTypes.object.isRequired,
  trades: ImmutablePropTypes.list.isRequired,
};
const defaultProps = {};

const colsDefinition = (baseToken, quoteToken) => {
  return [
    { heading: 'date', key: 'date' },
    { heading: 'action', key: 'tradeType' },
    { heading: `price`, key: 'price' },
    { heading: `${quoteToken}`, key: 'quoteAmount' },
    { heading: `${baseToken}`, key: 'baseAmount' },
  ];
};

class OasisMarketHistory extends PureComponent {
  render() {
    const { trades, activeTradingPair: { baseToken, quoteToken } } = this.props;
    const sortedTrades = orderByTimestamp(trades.toJSON(), DESCENDING);

    const toHistoricalTrades = (tradeHistoryEntry) => {
      let baseAmount = null, quoteAmount = null;

      if (tradeHistoryEntry.buyWhichToken === quoteToken && tradeHistoryEntry.sellWhichToken === baseToken) {
        baseAmount = new BigNumber(tradeHistoryEntry.sellHowMuch);
        quoteAmount = new BigNumber(tradeHistoryEntry.buyHowMuch);
      } else if (tradeHistoryEntry.buyWhichToken === baseToken && tradeHistoryEntry.sellWhichToken === quoteToken) {
        baseAmount = new BigNumber(tradeHistoryEntry.buyHowMuch);
        quoteAmount = new BigNumber(tradeHistoryEntry.sellHowMuch);
      }

      return {
        date: moment.unix(tradeHistoryEntry.timestamp).format('DD-MM-HH:mm'),
        tradeType: formatTradeType(
          tradeType(tradeHistoryEntry, baseToken),
        ),
        baseAmount: formatAmount(baseAmount, true),
        quoteAmount: formatAmount(quoteAmount, true),
        price: formatPrice(
          price(tradeHistoryEntry, baseToken, quoteToken),
        ),
      };
    };

    const marketHistory = sortedTrades.map(toHistoricalTrades);

    return (
      <OasisWidgetFrame heading={'MARKET HISTORY'}>
        <OasisTable rows={marketHistory} col={colsDefinition(baseToken, quoteToken)}/>
      </OasisWidgetFrame>
    );
  }
}

OasisMarketHistory.displayName = 'OasisMarketHistory';
OasisMarketHistory.propTypes = propTypes;
OasisMarketHistory.defaultProps = defaultProps;
export default OasisMarketHistory;
