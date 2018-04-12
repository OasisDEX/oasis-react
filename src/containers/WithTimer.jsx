import React, { PureComponent } from 'react';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';

function withTimer(WrappedComponent) {
  return class WithTimerWrapper extends PureComponent {
    render() {
      return (
        <WrappedComponent {...this.props}/>
      );
    }
  }
}

export function mapStateToProps(state) {
  return {
    timer: state.getIn(['timers','timestamp'])
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

export default compose(connect(mapStateToProps, mapDispatchToProps), withTimer);
