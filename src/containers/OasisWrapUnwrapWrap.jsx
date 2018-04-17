import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import wrapUnwrap from '../store/selectors/wrapUnwrap';
import OasisWrapUnwrapWrap from '../components/OasisWrapUnwrapWrap';
import wrapUnwrapReducer from '../store/reducers/wrapUnwrap';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class OasisWrapUnwrapWrapWrapper extends PureComponent {
  render() {
    const { activeUnwrappedToken, activeUnwrappedTokenBalance } = this.props;
    return (
      <OasisWrapUnwrapWrap
        onSubmit={this.props.actions.wrapToken}
        activeUnwrappedToken={activeUnwrappedToken}
        activeUnwrappedTokenBalance={activeUnwrappedTokenBalance}
      />
    );
  }
}

export function mapStateToProps(state) {
  return {
    activeUnwrappedToken: wrapUnwrap.activeUnwrappedToken(state),
    activeUnwrappedTokenBalance: wrapUnwrap.activeUnwrappedTokenBalance(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    wrapToken: wrapUnwrapReducer.actions.wrapTokenEpic

  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisWrapUnwrapWrapWrapper.propTypes = propTypes;
OasisWrapUnwrapWrapWrapper.displayName = 'OasisWrapUnwrapWrap';
export default connect(mapStateToProps, mapDispatchToProps)(OasisWrapUnwrapWrapWrapper);
