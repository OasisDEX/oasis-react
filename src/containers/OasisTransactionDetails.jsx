import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import SetTokenAllowanceTrustWrapper  from './SetTokenAllowanceTrust';
import tokens from '../store/selectors/tokens';
import OasisGasPriceWrapper  from './OasisGasPrice';
import web3 from '../bootstrap/web3';
import network from '../store/selectors/network';
import offerTakes from '../store/selectors/offerTakes';
import OasisInsufficientAmountOfToken from '../components/OasisInsufficientAmountOfToken';
import { TAKE_BUY_OFFER, TAKE_SELL_OFFER } from '../store/reducers/offerTakes';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  buyToken: PropTypes.string.isRequired,
  sellToken: PropTypes.string.isRequired,
  offerOwner: PropTypes.string.isRequired
};


const TokenReceivedAmount = ({ tokenName, tokenAmount}) => (
  <div>
    [+] {tokenAmount.toString()} <b>{tokenName}</b>
  </div>
);

TokenReceivedAmount.propTypes = {
  tokenName: PropTypes.string,
  tokenAmount: PropTypes.string,
};

const TokenSoldAmount = ({ tokenName, tokenAmount}) => (
  <div>
    [-] {tokenAmount.toString()} <b>{tokenName}</b>
  </div>
);

TokenSoldAmount.propTypes = {
  tokenName: PropTypes.string,
  tokenAmount: PropTypes.string,
};


export class OasisTransactionDetailsWrapper extends PureComponent {
  constructor(props) {
    super(props);
    props.getTransactionGasCostEstimate()
  }
  renderTransactionDetails() {
    const {
      offerOwner,
      buyToken,
      sellToken,
      amountSold,
      amountReceived,
      baseToken,
      transactionGasCostEstimate
    } = this.props;
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ width: '50%' }}>
          <TokenReceivedAmount tokenAmount={amountReceived} tokenName={buyToken}/>
          <TokenSoldAmount tokenAmount={amountSold} tokenName={sellToken}/>
        </div>
        <div style={{ width: '50%' }}>
          <div>
            trading of <b>{baseToken}</b>
          </div>
          <OasisGasPriceWrapper transactionGasCostEstimate={transactionGasCostEstimate}/>
          <SetTokenAllowanceTrustWrapper
            allowanceSubjectAddress={offerOwner}
            tokenName={buyToken}
          />
        </div>
      </div>
    )
  }
  renderInSufficientAmount() {
    const { sellToken } = this.props;
    return <OasisInsufficientAmountOfToken tokenName={sellToken}/>
  }
  render() {
    const { hasSufficientTokenAmount } = this.props;
    return (
      <div style={{backgroundColor: 'lightgray', padding: 10, margin: '20px 0' }}>
        { hasSufficientTokenAmount ? this.renderTransactionDetails() : this.renderInSufficientAmount()}
      </div>
    );
  }

  componentWillUpdate({ latestBlockNumber, hasSufficientTokenAmount }) {
    if(

      (latestBlockNumber && this.props.latestBlockNumber !== latestBlockNumber) ||
      (this.props.hasSufficientTokenAmount !== hasSufficientTokenAmount && hasSufficientTokenAmount)

    ) { this.props.getTransactionGasCostEstimate(); }
  }

}

export function mapStateToProps(state) {
  return {
    baseToken: tokens.activeTradingPairBaseToken(state),
    latestBlockNumber: network.latestBlockNumber(state),
    hasSufficientTokenAmount: offerTakes.hasSufficientTokenAmount(state),
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTransactionDetailsWrapper.propTypes = propTypes;
OasisTransactionDetailsWrapper.displayName = 'OasisTransactionDetails';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTransactionDetailsWrapper);
