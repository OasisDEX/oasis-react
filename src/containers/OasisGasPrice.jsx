import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import transactions from '../store/selectors/transactions';
import network from '../store/selectors/network';
import web3 from '../bootstrap/web3';
import { ETH_UNIT_ETHER } from '../constants';
import { formatAmount } from '../utils/tokens/pair';
import {FlexBox} from "../components/FlexBox";

import styles from './OasisGasPrice.scss';
import CSSModules from 'react-css-modules';


const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  transactionGasCostEstimate: PropTypes.string
};

export class OasisGasPriceWrapper extends PureComponent {

  getGasCostEstimate() {
    const  { currentGasPrice, latestEthereumPrice, transactionGasCostEstimate } = this.props;
    const currentGasPriceBN = web3.toBigNumber(currentGasPrice);
    if(transactionGasCostEstimate && latestEthereumPrice) {
      const cost = web3.fromWei(currentGasPriceBN.mul(transactionGasCostEstimate), ETH_UNIT_ETHER);
      return (
        <FlexBox className={styles.base}>
          <div className={styles.gasLabel}>
            Gas
          </div>
          <div>
            <span className={styles.detailsTradingFirstCol}>{formatAmount(cost,false, null, 5)} ETH</span>
            <span className={styles.detailsTradingSecCol} >
            <span className={styles.estimateUSD}>
              {formatAmount(cost.mul(latestEthereumPrice.price_usd))} USD
            </span>
          </span>
          </div>
        </FlexBox>
      )
    }
  }

  renderContent() {
    const { gasEstimatePending, gasEstimateError } = this.props;
    if(gasEstimateError) {
      return <b>estimate error</b>;
    }
    else if(gasEstimatePending) {
      return <b>estimate pending...</b>;
    } else {
      return this.getGasCostEstimate();
    }

  }

  render() {
    const { className } = this.props;
    return (<div className={className || ''}>{this.renderContent()}</div>)
  }
}

export function mapStateToProps(state) {
  return {
    currentGasPrice: transactions.currentGasPriceWei(state),
    latestEthereumPrice: network.latestEthereumPrice(state),
    latestBlockNumber: network.latestBlockNumber(state),
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisGasPriceWrapper.propTypes = propTypes;
OasisGasPriceWrapper.displayName = 'OasisGasPrice';
export default connect(mapStateToProps, mapDispatchToProps)(CSSModules(OasisGasPriceWrapper, styles));
