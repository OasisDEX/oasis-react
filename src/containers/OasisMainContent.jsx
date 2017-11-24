import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Route,
  Switch,
  Redirect,
  withRouter,
} from 'react-router-dom';
import { compose } from 'redux';

import OasisTabs from '../components/OasisTabs';
import { OasisTradeWrapper } from './OasisTrade';
import { OasisTransferWrapper } from './OasisTransfer';
import { OasisWrapUnwrapWrapper } from './OasisWrapUnwrap';

const propTypes = PropTypes && {
  actions: PropTypes.object,
};

export class OasisMainContentWrapper extends Component {

  redirect() {
    if (document.location.pathname === '/') {
      return (
        <Redirect from={'/'} to={'trade'}></Redirect>
      );
    }
    return null;
  }

  render() {
    return (
      <div className="OasisMainContentWrapper">
        <OasisTabs>
          <Switch>
            {this.redirect()}
            <Route path={'/trade'} component={OasisTradeWrapper}/>
            <Route path={'/wrap-unwrap'} component={OasisWrapUnwrapWrapper}/>
            <Route path={'/transfer'} component={OasisTransferWrapper}/>
          </Switch>
        </OasisTabs>
      </div>
    );
  }

  /**
   * TODO @Arek implement more performant way.
   */
  shouldComponentUpdate(nextProps) {
    return true;
  }
}

export function mapStateToProps(state) {
  return {};
}

export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisMainContentWrapper.propTypes = propTypes;
OasisMainContentWrapper.displayName = 'OasisMainContentWrapper';

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(OasisMainContentWrapper);
