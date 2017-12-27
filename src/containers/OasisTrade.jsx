import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { validateTradingPair } from '../utils/validateTradingPair';
import { BASE_TOKENS, QUOTE_TOKENS, TOKEN_MAKER, TOKEN_WRAPPED_ETH } from '../constants';
import tokensReducer from './../store/reducers/tokens';
import { generateTradingPairs } from '../utils/generateTradingPairs';
import OasisMarketWidget from '../components/OasisMarketWidget';
import trades from '../store/selectors/trades';
import tokens from './../store/selectors/tokens';
import platform from '../store/selectors/platform';
import { DAY, WEEK } from '../utils/period';


const propTypes = PropTypes && {
  actions: PropTypes.object,
  defaultTradingPair: PropTypes.object,
  defaultPeriod: PropTypes.oneOf([
    DAY,
    WEEK,
  ])
};

export class OasisTradeWrapper extends PureComponent {
  redirect() {
    const params = this.props.match.params;
    const { baseToken, quoteToken } = this.props.defaultTradingPair.toJSON();

    if (!validateTradingPair(params.baseToken, params.quoteToken, generateTradingPairs(BASE_TOKENS, QUOTE_TOKENS))) {

      if(baseToken === TOKEN_WRAPPED_ETH && quoteToken === TOKEN_MAKER) {
        return (
          <Redirect to={`/trade/${TOKEN_MAKER}/${TOKEN_WRAPPED_ETH}`}/>
        );
      } else {
        return (
          <Redirect to={`/trade/${baseToken}/${quoteToken}`}/>
        );
      }
    } else {
      if(!this.props.activeTradingPair) {
        this.props.actions.setActiveTradingPair({
          baseToken: params.baseToken, quoteToken: params.quoteToken
        });
      }
      return null;
    }
  }
  render() {
    const { tradedTokens, marketsData, defaultPeriod, loadingTradeHistory } = this.props;
    return this.redirect() || (
      <main>
        <OasisMarketWidget
          tradedTokens={tradedTokens}
          marketData={marketsData}
          defaultPeriod={defaultPeriod}
          loadingTradeHistory={loadingTradeHistory}
        />
      </main>
    );
  }
}

export function mapStateToProps(state) {
  return {

    validBaseTokensList: tokens.validBaseTokensList(state),
    loadingTradeHistory: !trades.initialMarketHistoryLoaded(state),
    validQuoteTokensList: tokens.validQuoteTokensList(state),
    marketsData: trades.marketsData(state),
    activeTradingPair: tokens.activeTradingPair(state),
    tradedTokens: tokens.tradingPairs(state),
    defaultPeriod: platform.defaultPeriod(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    setActiveTradingPair: tokensReducer.actions.setActiveTradingPair,
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTradeWrapper.propTypes = propTypes;
OasisTradeWrapper.displayName = 'OasisTrade';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTradeWrapper);
