import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisWrapUnwrapUnwrap from '../components/OasisWrapUnwrapUnwrap';
import wrapUnwrap from '../store/selectors/wrapUnwrap';
import wrapUnwrapReducer from '../store/reducers/wrapUnwrap';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class OasisWrapUnwrapUnwrapWrapper extends PureComponent {
  render() {
    const { activeWrappedToken, activeWrappedTokenBalance } = this.props;
    return (
      <OasisWrapUnwrapUnwrap
        onSubmit={this.props.actions.unwrapToken}
        activeWrappedToken={activeWrappedToken}
        activeWrappedTokenBalance={activeWrappedTokenBalance}
      />
    );
  }
}

export function mapStateToProps(state) {
  return {
    activeWrappedTokenBalance: wrapUnwrap.activeWrappedTokenBalance(state),
    activeWrappedToken: wrapUnwrap.activeWrappedToken(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    unwrapToken: wrapUnwrapReducer.actions.unwrapTokenEpic
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisWrapUnwrapUnwrapWrapper.propTypes = propTypes;
OasisWrapUnwrapUnwrapWrapper.displayName = 'OasisWrapUnwrapUnwrap';
export default connect(mapStateToProps, mapDispatchToProps)(OasisWrapUnwrapUnwrapWrapper);
