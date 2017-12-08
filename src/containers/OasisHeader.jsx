import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CSSModules from 'react-css-modules';

import OasisLogo from '../components/OasisLogo';
import OasisStatus from '../components/OasisStatus';
import OasisMarket from '../components/OasisMarket';
import OasisAccount from '../components/OasisAccount';
import OasisExpirationDate from '../components/OasisExpirationDate';

import markets from './../store/selectors/markets'
import network from '../store/selectors/network';
import accounts from '../store/selectors/accounts';

import styles from './OasisHeader.scss';

const propTypes = PropTypes && {
  actions: PropTypes.object,
  networkStatus: PropTypes.string.isRequired,
  networkName: PropTypes.string.isRequired,
};

export class OasisHeaderWrapper extends PureComponent {
  render() {

    const {
      networkStatus,
      networkName,
      marketCloseTime,
      marketAddress,
      accounts
    } = this.props;

    return (
      <div styleName="row-header" className="row">
        <div className="col-md-6">
          <div className="row">
            <div className="col-md-3">
              <OasisLogo/>
            </div>
            <div className="col-md-9">
              <div className="row">
                <div className="col-md-6">
                  <OasisStatus status={networkStatus} name={networkName}/>
                </div>
                <div className="col-md-6">
                  <OasisExpirationDate timestamp={marketCloseTime}/>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div styleName="row" className="row">
            <div className="col-md-12">
              <OasisAccount accounts={accounts}/>
            </div>
          </div>
          <div styleName="row" className="row">
            <div className="col-md-12">
              <OasisMarket marketAddress={marketAddress}/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {
    accounts: accounts.accounts(state),
    networkStatus: network.status(state),
    networkName: network.getActiveNetworkName(state),
    marketCloseTime: markets.marketCloseTime(state),
    defaultAccount: accounts.defaultAccount(state),
    marketAddress: markets.activeMarketAddress(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {};
  return {actions: bindActionCreators(actions, dispatch)};
}

OasisHeaderWrapper.propTypes = propTypes;
OasisHeaderWrapper.displayName = 'OasisHeaderWrapper';
export default connect(mapStateToProps, mapDispatchToProps)(CSSModules(OasisHeaderWrapper, styles, {allowMultiple: true}));
