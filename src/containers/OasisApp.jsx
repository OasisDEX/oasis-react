import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';
import { BrowserRouter } from 'react-router-dom';
import platform from './../store/reducers/platform';
import platformSelectors from './../store/selectors/platform';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { OasisHeaderWrapper } from './OasisHeader';
import { OasisFooterWrapper } from './OasisFooter';
import { OasisMainContentWrapper } from './OasisMainContent';
import { OasisMessagesSectionWrapper } from './OasisMessagesSection';
import Locked from '../components/Locked';

const propTypes = PropTypes && {};

export class OasisAppWrapper extends PureComponent {

  componentWillMount() {
    this.props.actions.platformInitEpic();
  }

  accountLocked() {
    const { isAccountLocked } = this.props;
    return isAccountLocked ? (<Locked/>) : null;
  }

  render() {
    return (
      <div>
        {this.accountLocked()}
        <BrowserRouter>
          <div className="container">
            <OasisHeaderWrapper/>
            <OasisMessagesSectionWrapper/>
            <OasisMainContentWrapper/>
            <OasisFooterWrapper/>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {
    isAccountIsLocked: platformSelectors.isAccountLocked(state),
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    platformInitEpic: platform.actions.platformInitEpic,
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisAppWrapper.propTypes = propTypes;
OasisAppWrapper.displayName = 'OasisAppWrapper';
export default connect(mapStateToProps, mapDispatchToProps)(OasisAppWrapper);
