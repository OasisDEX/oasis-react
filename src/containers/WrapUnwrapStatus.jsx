import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import WrapStatus from "../components/WrapStatus";
import UnwrapStatus from "../components/UnwrapStatus";
import wrapUnwrap from "../store/selectors/wrapUnwrap";

const propTypes = PropTypes && {
  actions: PropTypes.object,
  type: PropTypes.string.isRequired
};

export const WRAP_STATUS_VIEW_TYPE_WRAP = "wrap";
export const WRAP_STATUS_VIEW_TYPE_UNWRAP = "unwrap";

export class WrapUnwrapStatusWrapper extends PureComponent {
  render() {
    const { activeTokenWrapStatus, activeTokenUnwrapStatus } = this.props;
    switch (this.props.type) {
      case WRAP_STATUS_VIEW_TYPE_UNWRAP:
        return activeTokenUnwrapStatus ? <UnwrapStatus token /> : null;
      case WRAP_STATUS_VIEW_TYPE_WRAP:
        return activeTokenWrapStatus ? <WrapStatus token /> : null;
    }
  }
}

export function mapStateToProps(state) {
  return {
    activeTokenWrapStatus: wrapUnwrap.activeTokenWrapStatus(state),
    activeTokenUnwrapStatus: wrapUnwrap.activeTokenUnwrapStatus(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

WrapUnwrapStatusWrapper.propTypes = propTypes;
WrapUnwrapStatusWrapper.displayName = "WrapUnwrapStatus";
export default connect(mapStateToProps, mapDispatchToProps)(
  WrapUnwrapStatusWrapper
);
