import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisWrapUnwrapWrap from '../components/OasisWrapUnwrapWrap';
import OasisWrapUnwrapUnwrap from '../components/OasisWrapUnwrapUnwrap';
import OasisWrapUnwrapBalancesWrapper  from './OasisWrapUnwrapBalances';
import OasisWrapUnwrapHistoryWrapper from './OasisWrapUnwrapHistory';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
};

export class OasisWrapUnwrapWrapper extends PureComponent {

  render() {
    return (
      <div>
        <OasisWrapUnwrapBalancesWrapper/>
        <OasisWrapUnwrapHistoryWrapper/>
        <OasisWrapUnwrapWrap/>
        <OasisWrapUnwrapUnwrap/>
      </div>
    );
  }
}

export function mapStateToProps() {
  return {};
}

export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisWrapUnwrapWrapper.propTypes = propTypes;
OasisWrapUnwrapWrapper.displayName = 'OasisWrapUnwrap';
export default connect(mapStateToProps, mapDispatchToProps)(OasisWrapUnwrapWrapper);
