import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import tokens from '../store/selectors/tokens';
import OasisGasPriceWrapper from './OasisGasPrice';
import network from '../store/selectors/network';
import OasisInsufficientAmountOfToken from '../components/OasisInsufficientAmountOfToken';
import WithTransactionWatch from './WithTransactionWatch';
import { gasEstimateError, isGasEstimatePending, transactionGasCostEstimate } from '../store/selectors';
import TransactionStatus from '../components/TransactionStatus';
import InfoBox from '../components/InfoBox';
import styles from './OasisTransactionDetails.scss';
import CSSModules from 'react-css-modules';
import {InfoBoxBody} from "../components/InfoBoxBody";


const propTypes = PropTypes && {
  transactionSubectType: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  buyToken: PropTypes.string.isRequired,
  sellToken: PropTypes.string.isRequired,
  gasEstimatePending: PropTypes.bool,
  hasSufficientTokenAmount: PropTypes.bool,
};

const TokenAmount = ({ tokenName, tokenAmount, sign, color }) => (
    <div>
      <span className={`${styles.circleIco} ${styles[color]}`}>{sign}</span>
      <span className={styles.baseText}>{tokenAmount.toString()} </span>
      <span className={styles.bolderText}>{tokenName}</span>
    </div>
);

TokenAmount.propTypes = {
  tokenName: PropTypes.string,
  tokenAmount: PropTypes.string,
  sign: PropTypes.string,
  color: PropTypes.string
};

const TokenReceivedAmount = ({ tokenName, tokenAmount }) => (
    <TokenAmount tokenName={tokenName} tokenAmount={tokenAmount} sign='+' color='green' />
);

TokenReceivedAmount.propTypes = {
  tokenName: PropTypes.string,
  tokenAmount: PropTypes.string
};

const TokenSoldAmount = ({ tokenName, tokenAmount }) => (
  <TokenAmount tokenName={tokenName} tokenAmount={tokenAmount} sign='-' color='red' />
);

TokenSoldAmount.propTypes = {
  tokenName: PropTypes.string,
  tokenAmount: PropTypes.string
};

export class OasisTransactionDetailsWrapper extends PureComponent {
  constructor(props) {
    super(props);
    props.getTransactionGasCostEstimate();
  }

  tradingTokenPartial() {
    return (
      <div className={styles.baseText}>
        trading of <span className={styles.bolderText}>{this.props.baseToken}</span>
      </div>
    );
  }

  gasAndAllowancePartial() {

    const {
      transaction,
      transactionGasCostEstimate,
      isGasEstimatePending,
      gasEstimateError,
    } = this.props;

    if (!transaction) {
      return (
          <OasisGasPriceWrapper
            gasEstimateError={gasEstimateError}
            gasEstimatePending={isGasEstimatePending}
            transactionGasCostEstimate={transactionGasCostEstimate}
          />
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
    } = this.props;

    if (!transaction) {
      return (
        <InfoBox>
          <InfoBoxBody>
            <TokenReceivedAmount tokenAmount={amountReceived} tokenName={buyToken}/>
            <TokenSoldAmount tokenAmount={amountSold} tokenName={sellToken}/>
          </InfoBoxBody>
          <InfoBoxBody>
            {this.tradingTokenPartial()}
            {this.gasAndAllowancePartial()}
          </InfoBoxBody>
        </InfoBox>);

    } else {
      return (
        <div>
          <div>
            <TokenReceivedAmount tokenAmount={amountReceived} tokenName={buyToken}/>
            <TokenSoldAmount tokenAmount={amountSold} tokenName={sellToken}/>
          </div>
          <TransactionStatus transaction={transaction}/>
        </div>
      );
    }
  }

  renderInSufficientAmount() {
    const { sellToken } = this.props;
    return <InfoBox>
        <InfoBoxBody>
          <OasisInsufficientAmountOfToken tokenName={sellToken}/>
        </InfoBoxBody>
    </InfoBox>;
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
      this.renderContent()
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
export default WithTransactionWatch(connect(mapStateToProps, mapDispatchToProps)(CSSModules(OasisTransactionDetailsWrapper, styles)));
