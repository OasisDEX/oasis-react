import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';
import { BrowserRouter } from 'react-router-dom'
import platform from './../store/reducers/platform';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {OasisHeaderWrapper} from './OasisHeader';
import {OasisFooterWrapper} from './OasisFooter';
import {OasisMainContentWrapper} from './OasisMainContent';
import {OasisMessagesSectionWrapper} from './OasisMessagesSection';

const propTypes = PropTypes && {
};

export class OasisAppWrapper extends PureComponent {


  componentWillMount() {
    this.props.actions.PlatformInit();
  }

  render() {
    return (
       <BrowserRouter>
         <div className="container">
           <OasisHeaderWrapper/>
           <OasisMessagesSectionWrapper/>
           <OasisMainContentWrapper/>
           <OasisFooterWrapper/>
         </div>
       </BrowserRouter>
    );
  }
}

export function mapStateToProps() {
  return {};
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    PlatformInit: platform.actions.Init
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisAppWrapper.propTypes = propTypes;
OasisAppWrapper.displayName = 'OasisAppWrapper';
export default connect(mapStateToProps, mapDispatchToProps)(OasisAppWrapper);
