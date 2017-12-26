import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { validateTokenPair } from '../utils/validateTokenPair';
import { BASE_TOKENS, QUOTE_TOKENS, TOKEN_MAKER, TOKEN_WRAPPED_ETH } from '../constants';
import tokensReducer from './../store/reducers/tokens';
import { generateTradingPairs } from '../utils/generateTradingPairs';
import OasisMarketWidget from '../components/OasisMarketWidget';
import trades from '../store/selectors/trades';
import tokens from './../store/selectors/tokens';
import platform from '../store/selectors/platform';
import { TIME_SPAN_DAY, TIME_SPAN_WEEK } from '../utils/timeSpan';


const propTypes = PropTypes && {
  actions: PropTypes.object,
  defaultTokenPair: PropTypes.object,
  defaultTimeSpan: PropTypes.oneOf([
    TIME_SPAN_DAY,
    TIME_SPAN_WEEK,
  ])
};

export class OasisTradeWrapper extends PureComponent {
  redirect() {
    const params = this.props.match.params;
    const { baseToken, quoteToken } = this.props.defaultTokenPair.toJSON();

    if (!validateTokenPair(params.baseToken, params.quoteToken, generateTradingPairs(BASE_TOKENS, QUOTE_TOKENS))) {

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
      if(!this.props.activeTokenPair) {
        this.props.actions.setActiveTokenPair({
          baseToken: params.baseToken, quoteToken: params.quoteToken
        });
      }
      return null;
    }
  }
  render() {
    const { tradedTokens, marketsData, defaultTimeSpan, loadingTradeHistory } = this.props;
    return this.redirect() || (
      <main>
        <OasisMarketWidget
          tradedTokens={tradedTokens}
          marketData={marketsData}
          defaultTimeSpan={defaultTimeSpan}
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
    activeTokenPair: tokens.activeTokenPair(state),
    tradedTokens: tokens.tradingPairs(state),
    defaultTimeSpan: platform.defaultTimeSpan(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    setActiveTokenPair: tokensReducer.actions.setActiveTokenPair,
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTradeWrapper.propTypes = propTypes;
OasisTradeWrapper.displayName = 'OasisTrade';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTradeWrapper);
