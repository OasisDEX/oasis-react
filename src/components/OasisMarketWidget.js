import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { last } from 'lodash';

import OasisWidgetFrame from '../containers/OasisWidgetFrame';
import { OasisTable } from './OasisTable';
import { ETH_UNIT_ETHER } from '../constants';
import { TIME_SPAN_DAY, TIME_SPAN_MONTH, TIME_SPAN_WEEK } from '../utils/timeSpan';
import getTokenPairPrice from '../utils/tokens/getTokenPairPrice';
import getTokenPairVolume from '../utils/tokens/getTokenPairVolume';
import getTokenPairTrades from '../utils/tokens/getTokenPairTrades';
import getTokenPairFormat from '../utils/tokens/getTokenPairFormat';

const TOKEN_PAIR_MARKET_VOLUME_DECIMALS = 2;
const TOKEN_PAIR_MARKET_PRICE_DECIMALS = 4;

const timeSpanHeading = {
  [TIME_SPAN_DAY]: 'daily',
  [TIME_SPAN_WEEK]: 'weekly',
  [TIME_SPAN_MONTH]: 'monthly',
};

const getMarketColDefinition = (timeSpan) => {
  return [
    { heading: 'pairs', key: 'tokenPair' },
    { heading: `${timeSpanHeading[timeSpan]} volume`, key: 'volume' },
    { heading: 'price', key: 'tradingPairPrice' },
  ];
};

const formatTokenPairPrice =
  (price) =>
    price ? price.toFormat(TOKEN_PAIR_MARKET_PRICE_DECIMALS) : null;

class OasisMarketWidget extends PureComponent {
  constructor(props) {
    super(props);
    this.transformRow = this.transformRow.bind(this);
  }

  transformRow(row) {
    const { marketData = [] } = this.props;
    const [baseToken, quoteToken] = [row.get('base'), row.get('quote')];
    const tokenPairFormat = getTokenPairFormat(baseToken, quoteToken);

    if (marketData) {
      const tokenPairTrades = getTokenPairTrades(marketData, baseToken, quoteToken);
      const tradingPairVolume = getTokenPairVolume(tokenPairTrades, baseToken);
      const tradingPairPrice = tradingPairVolume.toNumber() ?
        getTokenPairPrice(last(tokenPairTrades), baseToken, quoteToken) : null;

      return {
        tokenPair: getTokenPairFormat(baseToken, quoteToken),
        volume: window.web3.fromWei(tradingPairVolume, ETH_UNIT_ETHER).toFormat(TOKEN_PAIR_MARKET_VOLUME_DECIMALS),
        tradingPairPrice: formatTokenPairPrice(tradingPairPrice),
      };
    } else {
      return {
        tokenPair: tokenPairFormat, volume: null, lastPrice: null,
      };
    }
  }

  render() {
    const { tradedTokens, defaultTimeSpan } = this.props;
    return (
      <OasisWidgetFrame heading="MARKETS">
        <OasisTable
          col={getMarketColDefinition(defaultTimeSpan)}
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