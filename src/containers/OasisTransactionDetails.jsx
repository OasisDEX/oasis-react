import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import SetTokenAllowanceTrustWrapper from './SetTokenAllowanceTrust';
import tokens from '../store/selectors/tokens';
import OasisGasPriceWrapper from './OasisGasPrice';
import network from '../store/selectors/network';
import OasisInsufficientAmountOfToken from '../components/OasisInsufficientAmountOfToken';
import WithTransactionWatch from './WithTransactionWatch';
import { gasEstimateError, isGasEstimatePending, transactionGasCostEstimate } from '../store/selectors';
import TransactionStatus from '../components/TransactionStatus';

const propTypes = PropTypes && {
  transactionSubectType: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  buyToken: PropTypes.string.isRequired,
  sellToken: PropTypes.string.isRequired,
  transactionSubjectAddress: PropTypes.string.isRequired,
  gasEstimatePending: PropTypes.bool,
  hasSufficientTokenAmount: PropTypes.bool,
};

const tokenReceivedSoldStyle = (displayInline) =>
  ({ display: displayInline ? 'inline-block' : '', width: '50%', textAlign: displayInline ? 'center': '' });

const TokenReceivedAmount = ({ tokenName, tokenAmount, displayInline }) => (
  <div style={tokenReceivedSoldStyle(displayInline)}>
    <span>[+] {tokenAmount.toString()} <b>{tokenName}</b></span>
  </div>
);

TokenReceivedAmount.propTypes = {
  tokenName: PropTypes.string,
  tokenAmount: PropTypes.string,
  displayInline: PropTypes.bool
};

const TokenSoldAmount = ({ tokenName, tokenAmount, displayInline }) => (
  <div style={tokenReceivedSoldStyle(displayInline)}>
    <span>[-] {tokenAmount.toString()} <b>{tokenName}</b></span>
  </div>
);

TokenSoldAmount.propTypes = {
  tokenName: PropTypes.string,
  tokenAmount: PropTypes.string,
  displayInline: PropTypes.bool
};

export class OasisTransactionDetailsWrapper extends PureComponent {
  constructor(props) {
    super(props);
    props.getTransactionGasCostEstimate();
  }

  tradingTokenPartial() {
    return (
      <div>
        trading of <b>{this.props.baseToken}</b>
      </div>
    );
  }

  gasAndAllowancePartial() {

    const {
      transactionSubjectAddress,
      buyToken,
      transaction,
      transactionGasCostEstimate,
      isGasEstimatePending,
      gasEstimateError,
    } = this.props;

    if (!transaction) {
      return (
        <div>
          <OasisGasPriceWrapper
            gasEstimateError={gasEstimateError}
            gasEstimatePending={isGasEstimatePending}
            transactionGasCostEstimate={transactionGasCostEstimate}
          />
          <SetTokenAllowanceTrustWrapper
            allowanceSubjectAddress={transactionSubjectAddress}
            tokenName={buyToken}
          />
        </div>
      );
    }
  }

  renderTransactionDetails() {
    const {
      buyToken,
      sellToken,
      amountSold,
      amountReceived,
      transaction,
      fullWidth,
    } = this.props;

    if (!transaction) {
      return (
        <div style={{ display: 'flex' }}>
        <div style={{ width: (!fullWidth ? '50%' : '100%') }}>
          <TokenReceivedAmount tokenAmount={amountReceived} tokenName={buyToken}/>
          <TokenSoldAmount tokenAmount={amountSold} tokenName={sellToken}/>
        </div>
        <div style={{ width: (!fullWidth ? '50%' : '100%') }}>
          <div>{this.tradingTokenPartial()}</div>
          {this.gasAndAllowancePartial()}
        </div>
      </div>);

    } else {
      return (
        <div>
          <div>
            <TokenReceivedAmount displayInline tokenAmount={amountReceived} tokenName={buyToken}/>
            <TokenSoldAmount displayInline tokenAmount={amountSold} tokenName={sellToken}/>
          </div>
          <TransactionStatus transaction={transaction}/>
        </div>
      );
    }
  }

  renderInSufficientAmount() {
    const { sellToken } = this.props;
    return <OasisInsufficientAmountOfToken tokenName={sellToken}/>;
  }

  static renderTransactionIsInvalid() {
    return <div>Invalid transaction</div>;
  }

  renderContent() {
    const { hasSufficientTokenAmount, isTransactionValid } = this.props;
    if (isTransactionValid) {
      return (
        hasSufficientTokenAmount ? this.renderTransactionDetails() : this.renderInSufficientAmount()
      );
    } else {
      return OasisTransactionDetailsWrapper.renderTransactionIsInvalid();
    }
  }

  render() {
    return (
      <div style={{ backgroundColor: 'lightgray', padding: 10, margin: '20px 0' }}>
        {this.renderContent()}
      </div>
    );
  }

  componentWillUpdate({ latestBlockNumber, hasSufficientTokenAmount }) {
    if (

      (latestBlockNumber && this.props.latestBlockNumber !== latestBlockNumber) ||
      (this.props.hasSufficientTokenAmount !== hasSufficientTokenAmount && hasSufficientTokenAmount)

    ) {
      this.props.getTransactionGasCostEstimate();
    }
  }

}

export function mapStateToProps(state, { transactionSubectType }) {
  return {
    baseToken: tokens.activeTradingPairBaseToken(state),
    latestBlockNumber: network.latestBlockNumber(state),
    isGasEstimatePending: isGasEstimatePending(state, transactionSubectType),
    gasEstimateError: gasEstimateError(state, transactionSubectType),
    transactionGasCostEstimate: transactionGasCostEstimate(state, transactionSubectType),
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTransactionDetailsWrapper.propTypes = propTypes;
OasisTransactionDetailsWrapper.displayName = 'OasisTransactionDetails';
export default WithTransactionWatch(connect(mapStateToProps, mapDispatchToProps)(OasisTransactionDetailsWrapper));
