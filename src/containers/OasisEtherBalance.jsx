import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { formatAmount } from '../utils/tokens/pair';
import balances from '../store/selectors/balances';
import { ETH_UNIT_ETHER, TOKEN_ETHER } from '../constants';
import styles from './OasisEtherBalance.scss';
import CSSModules from 'react-css-modules';
import OasisIcon from '../components/OasisIcon';

const propTypes = PropTypes && {
  decimalPlaces: PropTypes.number,
  fromWei: PropTypes.bool,
  balanceUnit: PropTypes.string
};

export class OasisEtherBalanceWrapper extends PureComponent {
  render() {
    const { balance, fromWei, balanceUnit } = this.props;
    if(!balance) {
      return (
        <div className={styles.loading}><OasisIcon icon="loading"/></div>
      );
    } else {
      return (
        <div style={{ display: 'inline-block' }}>
          <span className={styles["available-amount"]}>
          { formatAmount(balance, fromWei, balanceUnit ||  ETH_UNIT_ETHER, this.props.decimalPlaces) }
          </span>
          <span className={styles["available-currency"]}
                style={{ padding: '0 5px', fontSize: '10px', lineHeight: '18px', verticalAlign: 'middle' }}>
            <b>{TOKEN_ETHER}</b>
          </span>
        </div>
      );
    }

  }
}

export function mapStateToProps(state) {
  return {
    balance: balances.ethBalance(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisEtherBalanceWrapper.propTypes = propTypes;
OasisEtherBalanceWrapper.displayName = 'OasisEtherBalance';
export default connect(mapStateToProps, mapDispatchToProps)(CSSModules(OasisEtherBalanceWrapper,styles));
