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
import OasisTradeWrapper from './OasisTrade';
import OasisTransferWrapper from './OasisTransfer';
import OasisWrapUnwrapWrapper from './OasisWrapUnwrap';
import tokensSelectors from './../store/selectors/tokens';

const propTypes = PropTypes && {
  actions: PropTypes.object,
};

export class OasisMainContentWrapper extends Component {

  redirect() {
    if (document.location.pathname === '/') {
      return (
        <Redirect from={'/'} to={`/trade`}/>
      );
    } else { return null; }
  }

  render() {
    const { defaultTokenPair } = this.props;
    return this.redirect() || (
      <div className="OasisMainContentWrapper">
        <OasisTabs>
          <Switch>
            <Route
              path={'/trade/:baseToken?/:quoteToken?'}
              render={(props) =>  <OasisTradeWrapper {...props} defaultTokenPair={defaultTokenPair}/>}
            />
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
  return {
    defaultTokenPair: tokensSelectors.defaultTokenPair(state)
  };
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
