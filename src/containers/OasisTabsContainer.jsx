import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisTabs from '../components/OasisTabs';
import tokens from '../store/selectors/tokens';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  pathname: PropTypes.string
};

export class OasisTabsContainerWrapper extends PureComponent {
  render() {
    const { pathname, defaultTradingPair, activeTradingPair } = this.props;
    return (
      <div>
        <OasisTabs
          activeTradingPair={activeTradingPair}
          defaultTradingPair={defaultTradingPair}
          pathname={pathname}/>
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {
    defaultTradingPair: tokens.defaultTradingPair(state),
    activeTradingPair: tokens.activeTradingPair(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTabsContainerWrapper.propTypes = propTypes;
OasisTabsContainerWrapper.displayName = 'OasisTabsContainer';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTabsContainerWrapper);
