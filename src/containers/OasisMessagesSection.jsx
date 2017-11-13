import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisMessage from '../components/OasisMessage';

const propTypes = PropTypes && {
  actions: PropTypes.object
};

export class OasisMessagesSectionWrapper extends PureComponent {
  render() {
    return (
        <div>
          <OasisMessage heading={'Get started!'}>
            <ul>
              <li>
                Go to wrap/unwrap and wrap ETH to turn it into W-ETH.
              </li>
              <li>
                Go to Trade and place new orders or trade existing orders by
                clicking on an open order on the order book to buy/sell into it.
              </li>
              <li>
                The first time you make a transaction you will be prompted to
                set your allowance.
              </li>
            </ul>
          </OasisMessage>
          <OasisMessage heading={'Warning!'}>
            Oasis is undergoing alpha testing: Any funds deposited on the exchange could be lost in the event of a security breach.
          </OasisMessage>
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

OasisMessagesSectionWrapper.propTypes = propTypes;
OasisMessagesSectionWrapper.displayName = 'OasisMessagesSection';
export default connect(mapStateToProps, mapDispatchToProps)(OasisMessagesSectionWrapper);
