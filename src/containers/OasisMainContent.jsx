import React, { Component } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Route, Redirect, withRouter } from "react-router-dom";
import { compose } from "redux";


import OasisTradeWrapper from './OasisTrade';
import OasisTransferWrapper from './OasisTransferMainWrapper';
import OasisWrapUnwrapWrapper from './OasisWrapUnwrap';
import tokensSelectors from './../store/selectors/tokens';
import OasisTabsContainerWrapper  from './OasisTabsContainer';

const propTypes = PropTypes && {
  actions: PropTypes.object
};

export class OasisMainContentWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  redirect() {
    if (document.location.pathname === "/") {
      return <Redirect from={"/"} to={`/trade`} />;
    } else {
      return null;
    }
  }

  renderWrapUnwrapContent(pathname, rootRouteProps) {
    const wrapUnwrapPathMatches = /^\/wrap-unwrap(\/\w+)?\/?$/g.test(pathname);
    if (wrapUnwrapPathMatches && !this.wrapUnwrapInitiallyLoaded) {
      this.wrapUnwrapInitiallyLoaded = true;
    }
    return (
      <div hidden={!wrapUnwrapPathMatches}>
        {this.wrapUnwrapInitiallyLoaded && (
          <OasisWrapUnwrapWrapper {...rootRouteProps} />
        )}
      </div>
    );
  }

  renderTransferContent(pathName, rootRouteProps) {
    const transferPathMatches = /^\/transfer\/?$/.test(pathName);
    if (transferPathMatches && !this.transferViewInitiallyLoaded) {
      this.transferViewInitiallyLoaded = true;
    }
    return (
      <div hidden={!transferPathMatches}>
        {this.transferViewInitiallyLoaded && (
          <OasisTransferWrapper {...rootRouteProps} />
        )}
      </div>
    );
  }

  render() {
    const { defaultTradingPair, location: { pathname } } = this.props;
    return (
      this.redirect() || (
        <div className="OasisMainContent">
          <OasisTabsContainerWrapper pathname={pathname}/>
          <div>
            <Route
              path={"*"}
              render={rootRouteProps => (
                <div>
                  <Route
                    path={"/trade/:baseToken?/:quoteToken?"}
                    render={props => (
                      <div>
                        <OasisTradeWrapper
                          {...props}
                          defaultTradingPair={defaultTradingPair}
                        />
                      </div>
                    )}
                  />
                  {this.renderWrapUnwrapContent(pathname, rootRouteProps)}
                  {this.renderTransferContent(pathname, rootRouteProps)}
                </div>
              )}
            />
          </div>
        </div>
      )
    );
  }

  /**
   * TODO @Arek implement more performant way.
   */
  shouldComponentUpdate() {
    return true;
  }
}

export function mapStateToProps(state) {
  return {
    defaultTradingPair: tokensSelectors.defaultTradingPair(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisMainContentWrapper.propTypes = propTypes;
OasisMainContentWrapper.displayName = "OasisMainContentWrapper";

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(OasisMainContentWrapper);
