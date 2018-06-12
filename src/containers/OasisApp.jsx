import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';
import { BrowserRouter } from "react-router-dom";
import platformReducer from "./../store/reducers/platform";
import platform from "./../store/selectors/platform";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import OasisHeaderWrapper from "./OasisHeader";
import OasisFooterWrapper from "./OasisFooter";
import OasisMainContentWrapper from "./OasisMainContent";
import OasisMessagesSectionWrapper from "./OasisMessagesSection";
import Locked from "../components/Locked";
import NoConnection from "../components/NoConnection";

import styles from "./OasisApp.scss";
import CSSModules from "react-css-modules";

import version from "../version";
import network from "../store/selectors/network";
import OasisYourNodeIsSyncingWrapper from "./OasisYourNodeIsSyncing";

const propTypes = PropTypes && {};

const classes = ({ isAppLoading, globalFormLock }) => {
  let classes = isAppLoading ? styles.appIsLoading : styles.appIsLoaded;
  classes += globalFormLock ? ` ${styles.globalFormLockEnabled}` : "";
  return classes;
};

export class OasisAppWrapper extends PureComponent {
  UNSAFE_componentWillUpdate() {
    this.props.actions.platformInitEpic();
  }

  static renderNodeIsSyncing() {
    return <OasisYourNodeIsSyncingWrapper />;
  }

  accountLocked() {
    const { isAccountLocked } = this.props;
    return isAccountLocked ? (
      <div styleName="container" className="container">
        {" "}
        <Locked />{" "}
      </div>
    ) : null;
  }

  mainContent() {
    const { isNodeSyncing } = this.props;
    if (isNodeSyncing) {
      return OasisAppWrapper.renderNodeIsSyncing();
    } else {
      return (
        <div styleName="container" className="container">
          <OasisHeaderWrapper />
          <OasisMessagesSectionWrapper />
          <OasisMainContentWrapper />
          <hr styleName="FooterSeparator" />
          <OasisFooterWrapper />
        </div>
      );
    }
  }

  static versionInfo() {
    return (
      <div style={{ textAlign: "center" }}>
        version: {version.version}, branch: {version.branch}, hash:{" "}
        {version.hash}, build date: {version.buildDate.toUTCString()}
      </div>
    );
  }

  render() {
    const { noProviderConnected, isAppLoading, globalFormLock } = this.props;
    if (noProviderConnected) {
      return <NoConnection />;
    }

    return (
      this.accountLocked() || (
        <div className={classes({ isAppLoading, globalFormLock })}>
          <BrowserRouter>{this.mainContent()}</BrowserRouter>
          <div>{OasisAppWrapper.versionInfo()}</div>
        </div>
      )
    );
  }
}

export function mapStateToProps(state) {
  return {
    isAppLoading: platform.isAppLoading(state),
    isAccountLocked: platform.isAccountLocked(state),
    noProviderConnected: network.noProviderConnected(state),
    globalFormLock: platform.globalFormLock(state),
    isNodeSyncing: network.isNodeSyncing(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    platformInitEpic: platformReducer.actions.platformInitEpic
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisAppWrapper.propTypes = propTypes;
OasisAppWrapper.displayName = "OasisAppWrapper";
export default connect(mapStateToProps, mapDispatchToProps)(
  CSSModules(OasisAppWrapper, styles)
);
