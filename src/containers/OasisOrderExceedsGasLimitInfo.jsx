import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import InfoBoxWithIco from "../components/InfoBoxWithIco";
import transactions from "../store/selectors/transactions";
import web3 from "../bootstrap/web3";

const propTypes = PropTypes && {
  gasEstimateInfo: ImmutablePropTypes.map.isRequired
};

export class OasisOrderExceedsGasLimitInfoWrapper extends PureComponent {
  render() {
    const { gasLimit, gasEstimateInfo } = this.props;
    const {
      // isGasEstimatePending,
      // transactionGasCostEstimateError,
      transactionGasCostEstimate
    } = gasEstimateInfo.toJS();
    if (!transactionGasCostEstimate) {
      return null;
    }

    const gasLimitInWeiBN = web3.toBigNumber(gasLimit);
    if (gasLimitInWeiBN.lt(transactionGasCostEstimate)) {
      return (
        <InfoBoxWithIco color="danger" icon="warning">
          <div className="exceededGasLimit">
            Your order{" "}
            <span style={{ textDecoration: "underline" }}>
              exceeds gas limit of
            </span>{" "}
            <b style={{ marginLeft: "10px" }}>
              {gasLimitInWeiBN.toFormat()} GAS
            </b>
          </div>
        </InfoBoxWithIco>
      );
    } else {
      return null;
    }
  }
}

export function mapStateToProps(state) {
  return {
    gasLimit: transactions.defaultGasLimit(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisOrderExceedsGasLimitInfoWrapper.propTypes = propTypes;
OasisOrderExceedsGasLimitInfoWrapper.displayName =
  "OasisOrderExceedsGasLimitInfo";
export default connect(mapStateToProps, mapDispatchToProps)(
  OasisOrderExceedsGasLimitInfoWrapper
);
