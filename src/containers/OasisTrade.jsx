import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { validateTradingPair } from '../utils/validateTradingPair';
import { BASE_TOKENS, QUOTE_TOKENS, TOKEN_DAI, TOKEN_WRAPPED_ETH } from '../constants';
import tokensReducer from './../store/reducers/tokens';
import { generateTradingPairs } from '../utils/generateTradingPairs';
import OasisMarketWidget from '../components/OasisMarketWidget';
import OasisChart from '../components/OasisChart';
import trades from '../store/selectors/trades';
import tokens from './../store/selectors/tokens';
import platform from '../store/selectors/platform';
import OasisTradeOrdersWrapper from './OasisTradeOrders';
import offers from '../store/selectors/offers';
import platformReducer from '../store/reducers/platform';
import {FlexBox} from "../components/FlexBox";
import { getTradingPairOfferCount } from '../store/reducers/offers/getTradingPairOffersCount';

const propTypes = PropTypes && {
  actions: PropTypes.object,
  defaultTradingPair: PropTypes.object,
  defaultPeriod: PropTypes.string.isRequired
};

export class OasisTradeWrapper extends PureComponent {
  redirect() {
    const params = this.props.match.params;
    const { baseToken, quoteToken } = this.props.defaultTradingPair.toJSON();

    if (!validateTradingPair(params.baseToken, params.quoteToken, generateTradingPairs(BASE_TOKENS, QUOTE_TOKENS))) {

      if(baseToken === TOKEN_WRAPPED_ETH && quoteToken === TOKEN_DAI) {
        return (
          <Redirect to={`/trade/${TOKEN_WRAPPED_ETH}/${TOKEN_DAI}`}/>
        );
      } else {
        return (
          <Redirect to={`/trade/${baseToken}/${quoteToken}`}/>
        );
      }
    } else {
      if(this.props.activeTradingPair == null) {
        this.props.actions.setActiveTradingPairEpic({
          baseToken: params.baseToken, quoteToken: params.quoteToken
        }, false);
        this.props.actions.denotePrecision();
      }
      return null;
    }
  }
  render()
  {

    const paramsTradePair = {
      baseToken: this.props.match.params.baseToken, quoteToken: this.props.match.params.quoteToken
    };
    const {
      tradedTokens,
      marketsData,
      defaultPeriod,
      initialMarketHistoryLoaded,
      isMarketInitialized,
      activeTradingPair = paramsTradePair,
      actions: {
        setActiveTradingPairEpic,
        changeRouteEpic,
        updateTradingPairOfferCount
      }
    } = this.props;

    return this.redirect() || (
      <FlexBox wrap>
        <OasisMarketWidget
          isMarketInitialized={isMarketInitialized}
          activeTradingPair={activeTradingPair}
          setActiveTradingPair={setActiveTradingPairEpic}
          changeRoute={changeRouteEpic}
          tradedTokens={tradedTokens}
          marketData={marketsData}
          defaultPeriod={defaultPeriod}
          updateTradingPairOfferCount={updateTradingPairOfferCount}
          initialMarketHistoryLoaded={initialMarketHistoryLoaded}
        />
        <OasisChart
          initialMarketHistoryLoaded={initialMarketHistoryLoaded}
        />
        {this.props.activeTradingPair && <OasisTradeOrdersWrapper/>}
      </FlexBox>
    );
  }
}

export function mapStateToProps(state) {
  return {

    validBaseTokensList: tokens.validBaseTokensList(state),
    initialMarketHistoryLoaded: trades.initialMarketHistoryLoaded(state),
    validQuoteTokensList: tokens.validQuoteTokensList(state),
    marketsData: trades.marketsData(state),
    activeTradingPair: tokens.activeTradingPair(state),
    tradedTokens: tokens.tradingPairs(state),
    defaultPeriod: platform.defaultPeriod(state),
    offersInitialized: offers.offersInitialized(state),
    isMarketInitialized: platform.isMarketInitialized(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    setActiveTradingPairEpic: tokensReducer.actions.setActiveTradingPairEpic,
    changeRouteEpic: platformReducer.actions.changeRouteEpic,
    denotePrecision: tokensReducer.actions.denotePrecision,
    updateTradingPairOfferCount: getTradingPairOfferCount
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTradeWrapper.propTypes = propTypes;
OasisTradeWrapper.displayName = 'OasisTrade';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTradeWrapper);
