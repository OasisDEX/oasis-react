import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';
import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisMarket from '../components/OasisMarket';
import OasisChart from '../components/OasisChart';
import tokensSelectors from './../store/selectors/tokens';

import { OasisTradeBuySellWrapper } from './OasisTradeBuySell';
import { OasisTradeOrdersWrapper } from './OasisTradeOrders';
import { validateTokenPair } from '../utils/validateTokenPair';
import { BASE_TOKENS, QUOTE_TOKENS, TOKEN_MAKER, TOKEN_WRAPPED_ETH } from '../constant';
import tokensReducer from './../store/reducers/tokens';
import { generateTradingPairs } from '../utils/generateTradingPairs';

const propTypes = PropTypes && {
  actions: PropTypes.object,
  defaultTokenPair: PropTypes.object
};

export class OasisTradeWrapper extends PureComponent {
  redirect() {
    const params = this.props.match.params;
    if (!validateTokenPair(params.baseToken, params.quoteToken, generateTradingPairs(BASE_TOKENS, QUOTE_TOKENS))) {
      const { baseToken, quoteToken } = this.props.defaultTokenPair.toJSON();
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
      this.props.actions.setActiveTokenPair({
        baseToken: params.baseToken, quoteToken: params.quoteToken
      });
      return null;
    }
  }
  render() {
    return this.redirect() || (
      <div>
        Trade
        <OasisMarket/>
        <OasisChart/>
        <OasisTradeBuySellWrapper/>
        <OasisTradeOrdersWrapper/>
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {
    validBaseTokensList: tokensSelectors.validBaseTokensList(state),
    validQuoteTokensList: tokensSelectors.validQuoteTokensList(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    setActiveTokenPair: tokensReducer.actions.setActiveTokenPair
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTradeWrapper.propTypes = propTypes;
OasisTradeWrapper.displayName = 'OasisTrade';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTradeWrapper);
