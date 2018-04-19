import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisWrapUnwrapBalancesWrapper  from './OasisWrapUnwrapBalances';
import OasisWrapUnwrapHistoryWrapper from './OasisWrapUnwrapHistory';
import OasisWrapUnwrapUnwrapWrapper from './OasisWrapUnwrapUnwrap';
import OasisWrapUnwrapWrapWrapper  from './OasisWrapUnwrapWrap';
import wrapUnwrapReducer from '../store/reducers/wrapUnwrap';
import { TOKEN_ETHER } from '../constants';
import platformReducer from '../store/reducers/platform';
import {FlexBox} from "../components/FlexBox";

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
};

export class OasisWrapUnwrapWrapper extends PureComponent {

  constructor(props) {
    super(props);
    const { match: { params: { token }, url } } = this.props;
    if (!token) {
      return this.props.actions.changeRoute(`${url}/${TOKEN_ETHER}`);
    }
    this.props.actions.setActiveWrapUnwrappedToken(token);
  }
  render() {
    const { activeUnwrappedToken } = this.props;
    return (
      <FlexBox wrap>
        <OasisWrapUnwrapBalancesWrapper
          activeUnwrappedToken={activeUnwrappedToken}
        />
        <OasisWrapUnwrapHistoryWrapper/>
        <OasisWrapUnwrapWrapWrapper/>
        <OasisWrapUnwrapUnwrapWrapper/>
      </FlexBox>
    );
  }
}

export function mapStateToProps() {
  return {};
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    setActiveWrapUnwrappedToken: wrapUnwrapReducer.actions.setActiveWrapUnwrappedToken,
    changeRoute: platformReducer.actions.changeRouteEpic,

  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisWrapUnwrapWrapper.propTypes = propTypes;
OasisWrapUnwrapWrapper.displayName = 'OasisWrapUnwrap';
export default connect(mapStateToProps, mapDispatchToProps)(OasisWrapUnwrapWrapper);
