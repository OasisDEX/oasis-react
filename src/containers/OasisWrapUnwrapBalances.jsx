
import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisWrapUnwrapBalances from '../components/OasisWrapUnwrapBalances';
import wrapUnwrap from '../store/selectors/wrapUnwrap';
import platformReducer from '../store/reducers/platform';
import wrapUnwrapReducer from '../store/reducers/wrapUnwrap';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class OasisWrapUnwrapBalancesWrapper extends PureComponent {
  render() {
    const {
      wrapUnwrapBalances,
      activeUnwrappedToken,
      actions: {
        changeRoute,
        setActiveWrapUnwrappedToken,
        resetActiveWrapForm,
        resetActiveUnwrapForm
      }
    } = this.props;
    return (
      <OasisWrapUnwrapBalances
        resetActiveWrapForm={resetActiveWrapForm}
        resetActiveUnwrapForm={resetActiveUnwrapForm}
        changeRoute={changeRoute}
        setActiveWrapUnwrappedToken={setActiveWrapUnwrappedToken}
        wrapUnwrapBalances={wrapUnwrapBalances}
        activeUnwrappedToken={activeUnwrappedToken}
      />
    );
  }
}

export function mapStateToProps(state) {
  return {
    wrapUnwrapBalances: wrapUnwrap.wrapUnwrapBalances(state),
    activeUnwrappedToken: wrapUnwrap.activeUnwrappedToken(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    changeRoute: platformReducer.actions.changeRouteEpic,
    setActiveWrapUnwrappedToken: wrapUnwrapReducer.actions.setActiveWrapUnwrappedToken,
    resetActiveWrapForm: wrapUnwrapReducer.actions.resetActiveWrapForm,
    resetActiveUnwrapForm: wrapUnwrapReducer.actions.resetActiveUnwrapForm,
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisWrapUnwrapBalancesWrapper.propTypes = propTypes;
OasisWrapUnwrapBalancesWrapper.displayName = 'OasisWrapUnwrapBalances';
export default connect(mapStateToProps, mapDispatchToProps)(OasisWrapUnwrapBalancesWrapper);
