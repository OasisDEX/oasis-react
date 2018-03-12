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


const style = { padding: '4px 7px', background: '#fff' };

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
        <div>
          <span>{formatAmount(cost,false, null, 5)} ETH</span>
          <span style={{marginLeft: 20}}>{formatAmount(cost.mul(latestEthereumPrice.price_usd))} USD</span>
        </div>
      )
    }
  }

  renderContent() {
    const { gasEstimatePending, gasEstimateError } = this.props;
    if(gasEstimateError) {
      return (<b>estimate error</b>);
    }
    else if(gasEstimatePending) {
      return (<b>estimate pending...</b>);
    } else {
      return (
        <div>
          {this.getGasCostEstimate()}
        </div>
      );
    }

  }
  render() {
    return (<div style={style}>{this.renderContent()}</div>)
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
export default connect(mapStateToProps, mapDispatchToProps)(OasisGasPriceWrapper);
