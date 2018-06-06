import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { MSGTYPE_INFO } from "../components/OasisMessage";
import OasisMessage from "../components/OasisMessage";
import platformReducer from "../store/reducers/platform";

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class OasisWelcomeMessageWrapper extends PureComponent {
  render() {
    const { actions } = this.props;
    return (
      <OasisMessage
        type={MSGTYPE_INFO}
        heading={"Get started!"}
        dismissible={true}
        onDismiss={actions.dismissMessage}
      >
        <ul>
          <li>
            <span styleName="Circle">
              <span styleName="Number">1</span>
            </span>
            <span styleName="Text">
              Go to wrap/unwrap and wrap ETH to turn it into W-ETH.
            </span>
          </li>
          <li>
            <span styleName="Circle">
              <span styleName="Number">2</span>
            </span>
            <span styleName="Text">
              Go to Trade and place new orders or trade existing orders by
              clicking on an open order on the order book to buy/sell into it.
            </span>
          </li>
          <li>
            <span styleName="Circle">
              <span styleName="Number">3</span>
            </span>
            <span styleName="Text">
              The first time you make a transaction you will be prompted to set
              your allowance.
            </span>
          </li>
        </ul>
      </OasisMessage>
    );
  }
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    dismissMessage: platformReducer.actions.dismissMessage
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisWelcomeMessageWrapper.propTypes = propTypes;
OasisWelcomeMessageWrapper.displayName = "OasisWelcomeMessage";
export default connect(null, mapDispatchToProps)(
  OasisWelcomeMessageWrapper
);
