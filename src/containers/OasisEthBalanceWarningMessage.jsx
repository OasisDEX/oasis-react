import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { MSGTYPE_WARNING } from "../components/OasisMessage";
import { formatAmount } from "../utils/tokens/pair";
import OasisMessage from "../components/OasisMessage";
import balances from "../store/selectors/balances";

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class OasisEthBalanceWarningMessageWrapper extends PureComponent {
  render() {
    const { isUserEthBalanceZero } = this.props;

    return isUserEthBalanceZero ? (
      <OasisMessage type={MSGTYPE_WARNING} heading={"Warning!"}>
        <div>
          <ul>
            <li>
              <span styleName="Circle Circle--Red">
                <span styleName="FilledCircle" />
              </span>
              <span styleName="Text">
                <span>
                  Your current{" "}
                  <b style={{ fontWeight: 'bolder', textDecoration: "underline" }}>ETHER</b> balance is{" "}
                  {formatAmount("0", false,  null, 8)} ETH. You will not be able to
                  create transaction.
                </span>
                <span />
              </span>
            </li>
          </ul>
        </div>
      </OasisMessage>
    ) : null;
  }
}

export function mapStateToProps(state) {
  return {
    isUserEthBalanceZero: balances.isUserBalanceZero(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisEthBalanceWarningMessageWrapper.propTypes = propTypes;
OasisEthBalanceWarningMessageWrapper.displayName =
  "OasisEthBalanceWarningMessage";
export default connect(mapStateToProps, mapDispatchToProps)(
  OasisEthBalanceWarningMessageWrapper
);
