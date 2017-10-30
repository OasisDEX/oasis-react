import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisBuyMaker from '../components/OasisBuyMaker';
import OasisSellMaker from '../components/OasisSellMaker';

const propTypes = PropTypes && {
  actions: PropTypes.object
};

export class OasisTradeBuySellWrapper extends PureComponent {
  render() {
    return (
      <div>
        <OasisBuyMaker/>
        <OasisSellMaker/>
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

OasisTradeBuySellWrapper.propTypes = propTypes;
OasisTradeBuySellWrapper.displayName = 'OasisTradeBuySell';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTradeBuySellWrapper);
