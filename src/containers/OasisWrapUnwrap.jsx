import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import OasisWrapUnwrapBalancesWrapper from "./OasisWrapUnwrapBalances";
import OasisWrapUnwrapHistoryWrapper from "./OasisWrapUnwrapHistory";
import OasisWrapUnwrapUnwrapEtherWrapper from "./OasisWrapUnwrapUnwrapEther";
import OasisWrapUnwrapUnwrapTokenWrapperWrapper from "./OasisWrapUnwrapUnwrapTokenWrapper";
import OasisWrapUnwrapWrapEtherWrapper from "./OasisWrapUnwrapWrapEther";
import wrapUnwrapReducer, {
  UNWRAP_ETHER,
  UNWRAP_TOKEN_WRAPPER,
  WRAP_ETHER,
  WRAP_TOKEN_WRAPPER
} from "../store/reducers/wrapUnwrap";
import { TOKEN_ETHER, TOKEN_GOLEM, TOKEN_WRAPPED_GNT } from '../constants';
import platformReducer from "../store/reducers/platform";
import { FlexBox } from "../components/FlexBox";
import OasisWrapUnwrapWrapTokenWrapperWrapper from "./OasisWrapUnwrapWrapTokenWrapper";
import wrapUnwrap from "../store/selectors/wrapUnwrap";

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class OasisWrapUnwrapWrapper extends PureComponent {
  constructor(props) {
    super(props);
    const { match: { params: { token }, url } } = this.props;
    if (!token) {
      return this.props.actions.changeRoute(`${url}/${TOKEN_ETHER}`);
    }
    this.props.actions.setActiveWrapUnwrappedToken(token);

    this.props.actions.resetActiveWrapForm(WRAP_ETHER);
    this.props.actions.resetActiveWrapForm(WRAP_TOKEN_WRAPPER);

    this.props.actions.resetActiveUnwrapForm(UNWRAP_ETHER);
    this.props.actions.resetActiveUnwrapForm(UNWRAP_TOKEN_WRAPPER);
  }

  render() {
    const { activeUnwrappedToken } = this.props;
    return (
      <FlexBox wrap>
        <OasisWrapUnwrapBalancesWrapper
          activeUnwrappedToken={activeUnwrappedToken}
        />
        <OasisWrapUnwrapHistoryWrapper />

        <OasisWrapUnwrapWrapEtherWrapper
          hidden={activeUnwrappedToken !== TOKEN_ETHER}
        />
        <OasisWrapUnwrapUnwrapEtherWrapper
          hidden={activeUnwrappedToken !== TOKEN_ETHER}
        />
        <OasisWrapUnwrapWrapTokenWrapperWrapper
          unwrappedToken={TOKEN_GOLEM}
          hidden={activeUnwrappedToken === TOKEN_ETHER}
        />
        <OasisWrapUnwrapUnwrapTokenWrapperWrapper
          wrappedToken={TOKEN_WRAPPED_GNT}
          hidden={activeUnwrappedToken === TOKEN_ETHER}
        />
      </FlexBox>
    );
  }
}

export function mapStateToProps(state) {
  return {
    activeUnwrappedToken: wrapUnwrap.activeUnwrappedToken(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    setActiveWrapUnwrappedToken:
      wrapUnwrapReducer.actions.setActiveWrapUnwrappedToken,
    changeRoute: platformReducer.actions.changeRouteEpic,
    resetActiveWrapForm: wrapUnwrapReducer.actions.resetActiveWrapForm,
    resetActiveUnwrapForm: wrapUnwrapReducer.actions.resetActiveUnwrapForm
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisWrapUnwrapWrapper.propTypes = propTypes;
OasisWrapUnwrapWrapper.displayName = "OasisWrapUnwrap";
export default connect(mapStateToProps, mapDispatchToProps)(
  OasisWrapUnwrapWrapper
);
