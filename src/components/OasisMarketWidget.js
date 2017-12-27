import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { last } from 'lodash';

import OasisWidgetFrame from '../containers/OasisWidgetFrame';
import { OasisTable } from './OasisTable';
import { DAY, MONTH, WEEK } from '../utils/period';
import { format, trades, volume, price, formatPrice, formatVolume } from '../utils/tokens/pair';



const periodHeading = {
  [DAY]: 'daily',
  [WEEK]: 'weekly',
  [MONTH]: 'monthly',
};

const colDefinition = (period) => {
  return [
    { heading: 'pairs', key: 'tradingPair' },
    { heading: `${periodHeading[period]} volume`, key: 'volume' },
    { heading: 'price', key: 'tradingPairPrice' },
  ];
};


class OasisMarketWidget extends PureComponent {
  constructor(props) {
    super(props);
    this.transformRow = this.transformRow.bind(this);
  }

  transformRow(row) {
    const { marketData = [] } = this.props;
    const [baseToken, quoteToken] = [row.get('base'), row.get('quote')];

    if (marketData) {
      const tradingPairTrades = trades(marketData, baseToken, quoteToken);
      const tradingPairVolume = volume(tradingPairTrades, baseToken);
      const tradingPairPrice = tradingPairVolume.toNumber() ?
        price(last(tradingPairTrades), baseToken, quoteToken) : null;

      return {
        tradingPair: format(baseToken, quoteToken),
        volume: formatVolume(tradingPairVolume),
        tradingPairPrice: formatPrice(tradingPairPrice),
      };
    } else {
      return {
        tradingPair: format(baseToken, quoteToken), volume: null, tradingPairPrice: null,
      };
    }
  }

  render() {
    const { tradedTokens, defaultPeriod } = this.props;
    return (
      <OasisWidgetFrame heading="MARKETS">
        <OasisTable
          col={colDefinition(defaultPeriod)}
          rows={tradedTokens.map(this.transformRow)}
        />
      </OasisWidgetFrame>
    );
  }
}

OasisMarketWidget.displayName = 'OasisMarketWidget';
OasisMarketWidget.propTypes = PropTypes && {
  tradedTokens: PropTypes.object.isRequired,
  marketData: PropTypes.array,
};
export default OasisMarketWidget;