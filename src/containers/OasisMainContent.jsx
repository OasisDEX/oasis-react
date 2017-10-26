import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisTabs from '../components/OasisTabs';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class OasisMainContentWrapper extends PureComponent {
  render() {
    return (
      <div className="OasisMainContentWrapper">
        <OasisTabs/>
      </div>
    );
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
export default connect(mapStateToProps, mapDispatchToProps)(OasisMainContentWrapper);
