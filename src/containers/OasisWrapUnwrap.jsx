import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisWrapUnwrapBalances from '../components/OasisWrapUnwrapBalances';
import OasisWrapUnwrapHistory from '../components/OasisWrapUnwrapHistory';
import OasisWrapUnwrapWrap from '../components/OasisWrapUnwrapWrap';
import OasisWrapUnwrapUnwrap from '../components/OasisWrapUnwrapUnwrap';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
};

export class OasisWrapUnwrapWrapper extends PureComponent {
  render() {
    return (
      <div>
        <OasisWrapUnwrapBalances/>
        <OasisWrapUnwrapHistory/>
        <OasisWrapUnwrapWrap/>
        <OasisWrapUnwrapUnwrap/>
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

OasisWrapUnwrapWrapper.propTypes = propTypes;
OasisWrapUnwrapWrapper.displayName = 'OasisWrapUnwrap';
export default connect(mapStateToProps, mapDispatchToProps)(OasisWrapUnwrapWrapper);
