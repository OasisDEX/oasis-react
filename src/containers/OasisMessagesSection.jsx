import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import OasisMessage from "../components/OasisMessage";
import { MSGTYPE_INFO } from "../components/OasisMessage";

import styles from "../components/OasisMessage.scss";
import CSSModule from "react-css-modules";
import session from "../store/selectors/session";
import OasisTestingWarningMessage from "../components/OasisTestingWarningMessage";
import OasisWelcomeMessageWrapper from "./OasisWelcomeMessage";

const propTypes = PropTypes && {
  actions: PropTypes.object
};

export class OasisMessagesSectionWrapper extends PureComponent {
  render() {
    const { messages, isSessionInitialized } = this.props;
    return isSessionInitialized ? (
      <div className={styles.base}>
        <div className="row" style={{ marginBottom: "20px" }}>
          <div className="col-md-7">
            <div className={styles.InfoMessagesSection}>
              {!messages[MSGTYPE_INFO].dismissed && (
                <OasisWelcomeMessageWrapper />
              )}
            </div>
          </div>
          <div
            className={
              messages[MSGTYPE_INFO].dismissed ? "col-md-12" : "col-md-5"
            }
          >
            <OasisTestingWarningMessage />
          </div>
        </div>
      </div>
    ) : (
      <OasisMessage heading={"Loading Messages..."} type={MSGTYPE_INFO}>
        <span hidden />
      </OasisMessage>
    );
  }
}

export function mapStateToProps(state) {
  return {
    messages: session.messages(state),
    isSessionInitialized: session.isSessionInitialized(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisMessagesSectionWrapper.propTypes = propTypes;
OasisMessagesSectionWrapper.displayName = "OasisMessagesSection";
export default connect(mapStateToProps, mapDispatchToProps)(
  CSSModule(OasisMessagesSectionWrapper, styles, { allowMultiple: true })
);
