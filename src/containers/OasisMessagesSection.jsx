import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisMessage from '../components/OasisMessage';
import { MSGTYPE_INFO, MSGTYPE_WARNING } from '../components/OasisMessage';

import styles from '../components/OasisMessage.scss';
import CSSModule from 'react-css-modules';
import session from '../store/selectors/session';
import platformReducer from '../store/reducers/platform';

const propTypes = PropTypes && {
  actions: PropTypes.object,
};

export class OasisMessagesSectionWrapper extends PureComponent {

  render() {
    const { messages, actions, isSessionInitialized } = this.props;
    return isSessionInitialized ? (
      <div className="row">
        <div className="col-md-7">
          <OasisMessage
            hidden={messages[MSGTYPE_INFO].dismissed}
            type={MSGTYPE_INFO}
            heading={'Get started!'}
            dismissible={true}
            onDismiss={actions.dismissMessage}
          >
            <ul>
              <li>
                <span styleName="Circle">
                  <span styleName="Number">1</span>
                </span>
                <span styleName="Text">
                  Go to wrap/unwrap and wrap ETH to turn it into W-ETH.
                </span>
              </li>
              <li>
                <span styleName="Circle">
                  <span styleName="Number">2</span>
                </span>
                <span styleName="Text">
                  Go to Trade and place new orders or trade existing orders by clicking on an open order on the order book to buy/sell into it.
                </span>
              </li>
              <li>
                <span styleName="Circle">
                  <span styleName="Number">3</span>
                </span>
                <span styleName="Text">
                  The first time you make a transaction you will be prompted to set your allowance.
                </span>
              </li>
            </ul>
          </OasisMessage>
        </div>
        <div className={messages[MSGTYPE_INFO].dismissed ? 'col-md-12' : 'col-md-5'}>
          <OasisMessage
            type={MSGTYPE_WARNING}
            heading={'Warning!'}
          >
            <ul>
              <li>
                <span styleName="Circle Circle--Red">
                 <span styleName="FilledCircle"/>
                </span>
                <span styleName="Text">
                  Oasis is undergoing alpha testing: Any funds deposited on the exchange could be lost in the event of a
                  security breach.
                </span>
              </li>
            </ul>
          </OasisMessage>
        </div>
      </div>
    ): <OasisMessage heading={'Loading Messages...'} type={MSGTYPE_INFO}><span hidden/></OasisMessage>;
  }
}

export function mapStateToProps(state) {
  return {
    messages: session.messages(state),
    isSessionInitialized: session.isSessionInitialized(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    dismissMessage: platformReducer.actions.dismissMessage
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisMessagesSectionWrapper.propTypes = propTypes;
OasisMessagesSectionWrapper.displayName = 'OasisMessagesSection';
export default connect(mapStateToProps, mapDispatchToProps)(CSSModule(OasisMessagesSectionWrapper, styles, { allowMultiple: true }));
