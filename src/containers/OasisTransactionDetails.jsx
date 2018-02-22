import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import SetTokenAllowanceTrustWrapper  from './SetTokenAllowanceTrust';
import tokens from '../store/selectors/tokens';
import OasisGasPriceWrapper  from './OasisGasPrice';
import network from '../store/selectors/network';
import offerTakes from '../store/selectors/offerTakes';
import OasisInsufficientAmountOfToken from '../components/OasisInsufficientAmountOfToken';
import WithTransactionWatch from './WithTransactionWatch';
import {
  TX_OFFER_MAKE,
  TX_STATUS_AWAITING_CONFIRMATION,
  TX_STATUS_CANCELLED_BY_USER,
  TX_STATUS_CONFIRMED,
} from '../store/reducers/transactions';
import TransactionTimer from '../components/TransactionTimer';
import { gasEstimateError, isGasEstimatePending, transactionGasCostEstimate } from '../store/selectors';
import TransactionStatus from '../components/TransactionStatus';

const propTypes = PropTypes && {
  transactionSubectType: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  buyToken: PropTypes.string.isRequired,
  sellToken: PropTypes.string.isRequired,
  offerOwner: PropTypes.string.isRequired,
  gasEstimatePending: PropTypes.bool
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
    props.getTransactionGasCostEstimate();
  }

  renderTransactionDetails() {
    const {
      offerOwner,
      buyToken,
      sellToken,
      amountSold,
      amountReceived,
      baseToken,
      transaction,
      transactionGasCostEstimate,
      isGasEstimatePending,
      gasEstimateError
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
          <OasisGasPriceWrapper
            gasEstimateError={gasEstimateError}
            gasEstimatePending={isGasEstimatePending}
            transactionGasCostEstimate={transactionGasCostEstimate}
          />
          <SetTokenAllowanceTrustWrapper
            allowanceSubjectAddress={offerOwner}
            tokenName={buyToken}
          />
          <div>
            {transaction && <TransactionStatus transaction={transaction}/>}
          </div>

        </div>
      </div>
    )
  }

  renderInSufficientAmount() {
    const { sellToken } = this.props;
    return <OasisInsufficientAmountOfToken tokenName={sellToken}/>
  }

  static renderTransactionIsInvalid() {
    return <div>Invalid transaction</div>
  }

  renderContent() {
    const { hasSufficientTokenAmount, isTransactionValid } = this.props;
    if(isTransactionValid) {
      return (
        hasSufficientTokenAmount ? this.renderTransactionDetails() : this.renderInSufficientAmount()
      )
    } else {
      return OasisTransactionDetailsWrapper.renderTransactionIsInvalid();
    }
  }

  render() {
    return (
      <div style={{backgroundColor: 'lightgray', padding: 10, margin: '20px 0' }}>
        {this.renderContent()}
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

export function mapStateToProps(state, { transactionSubectType }) {
  return {
    baseToken: tokens.activeTradingPairBaseToken(state),
    latestBlockNumber: network.latestBlockNumber(state),
    hasSufficientTokenAmount: offerTakes.hasSufficientTokenAmount(state),
    isGasEstimatePending: isGasEstimatePending(state, transactionSubectType),
    gasEstimateError: gasEstimateError(state, transactionSubectType),
    transactionGasCostEstimate: transactionGasCostEstimate(state, transactionSubectType)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTransactionDetailsWrapper.propTypes = propTypes;
OasisTransactionDetailsWrapper.displayName = 'OasisTransactionDetails';
export default WithTransactionWatch(connect(mapStateToProps, mapDispatchToProps)(OasisTransactionDetailsWrapper));
