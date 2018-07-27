import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import FlexBox from '../components/FlexBox';
import styles from '../components/OasisSoldReceivedAmounts.scss'
import balances from '../store/selectors/balances';
import balancesReducer from '../store/reducers/balances';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  tokenName: PropTypes.string.isRequired
};

export class OasisIsTokenTradingEnabledByUserWrapper extends PureComponent {
  componentDidMount() {
    const { tokenName,  isTokenTradingEnabledByUser } = this.props;
    if (null === isTokenTradingEnabledByUser) {
      this.props.actions.getAllowanceStatus(tokenName)
    }
  }
  render() {
    const { isTokenTradingEnabledByUser, tokenName } = this.props;
    return (
      <FlexBox className={`${styles.baseText} ${styles.base} ${styles.detailsTradingCol}`}>
        <div className={`${styles.detailsTradingFirstCol} ${styles.buying}`}>
          trading of <span className={styles.bolderText}>{tokenName}</span>
        </div>
        <div className={styles.detailsTradingSecCol}>
          <span className={`${styles.tradingStatus} ${isTokenTradingEnabledByUser ? styles.active: styles.disabled}`}>
            {isTokenTradingEnabledByUser ? 'enabled' : 'disabled' }
          </span>
        </div>
      </FlexBox>
    );
  }
}

export function mapStateToProps(state, { tokenName }) {
  return {
    isTokenTradingEnabledByUser: balances.tokenAllowanceStatusForActiveMarket(state, { tokenName })
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    getAllowanceStatus: balancesReducer.actions.getDefaultAccountTokenAllowanceForMarket
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisIsTokenTradingEnabledByUserWrapper.propTypes = propTypes;
OasisIsTokenTradingEnabledByUserWrapper.displayName = 'OasisIsTokenTradingEnabledByUser';
export default connect(mapStateToProps, mapDispatchToProps)(OasisIsTokenTradingEnabledByUserWrapper);
