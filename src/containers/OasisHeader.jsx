import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisLogo from '../components/OasisLogo';
import OasisStatus from '../components/OasisStatus';
import OasisMarket from '../components/OasisMarket';
import OasisAccount from '../components/OasisAccount';
import OasisExpirationDate from '../components/OasisExpirationDate';

const propTypes = PropTypes && {
  actions: PropTypes.object
};

export class OasisHeaderWrapper extends PureComponent {
  render() {
    return (
      <div className="OasisHeaderWrapper">
        <OasisLogo/>
        <OasisStatus/>
        <OasisExpirationDate/>
        <OasisAccount/>
        <OasisMarket/>
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

OasisHeaderWrapper.propTypes = propTypes;
OasisHeaderWrapper.displayName = 'OasisHeaderWrapper';
export default connect(mapStateToProps, mapDispatchToProps)(OasisHeaderWrapper);
