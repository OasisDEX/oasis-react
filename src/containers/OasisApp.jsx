import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';
import { BrowserRouter } from 'react-router-dom';
import platformReducer from './../store/reducers/platform';
import platform from './../store/selectors/platform';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisHeaderWrapper from './OasisHeader';
import OasisFooterWrapper from './OasisFooter';
import OasisMainContentWrapper from './OasisMainContent';
import OasisMessagesSectionWrapper from './OasisMessagesSection';
import Locked from '../components/Locked';

import styles from './OasisApp.scss';
import CSSModules from 'react-css-modules';

import version from '../version'

const propTypes = PropTypes && {};

export class OasisAppWrapper extends PureComponent {

  componentWillMount() {
    this.props.actions.platformInitEpic();
  }

  accountLocked() {
    const { isAccountLocked } = this.props;
    return isAccountLocked ? (<div styleName='container' className="container"> <Locked/> </div>) : null;
  }

  render() {
    return this.accountLocked() || (
      <div>
        <BrowserRouter>
          <div styleName='container' className="container">
            <OasisHeaderWrapper/>
            <OasisMessagesSectionWrapper/>
            <OasisMainContentWrapper/>
            <hr styleName="FooterSeparator"/>
            <OasisFooterWrapper/>
          </div>
        </BrowserRouter>
        <div style={{ textAlign: 'center' }}>
          version: {version.version},
          branch: {version.branch},
          hash: {version.hash},
          build date: {version.buildDate.toUTCString()}
        </div>
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {
    isAccountLocked: platform.isAccountLocked(state),
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    platformInitEpic: platformReducer.actions.platformInitEpic,
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisAppWrapper.propTypes = propTypes;
OasisAppWrapper.displayName = 'OasisAppWrapper';
export default connect(mapStateToProps, mapDispatchToProps)(CSSModules(OasisAppWrapper,styles));
