import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { NavLink } from 'react-router-dom';
import styles from './OasisTabs.scss';
import CSSModules from 'react-css-modules';

const propTypes = PropTypes && {
  pathname: PropTypes.string,
  activeTradingPair: PropTypes.object,
  defaultTradingPair: PropTypes.object.isRequired,
};
const defaultProps = {};

class OasisTabs extends PureComponent {
  isActive(basePath) {
    const  { pathname } = this.props;
    return (pathname && pathname.indexOf(basePath) === 0) ? styles.active : ''
  }
  render() {
    const  { defaultTradingPair, activeTradingPair } = this.props;
    const { baseToken, quoteToken } = activeTradingPair ? activeTradingPair : defaultTradingPair;
    return (
      <div className={styles.rowTabs}>
        <ul className={styles.tabs}>
          <li className={`${styles.tab} ${this.isActive('/trade')}`}>
            <NavLink to={`/trade/${baseToken}/${quoteToken}`}>Trade</NavLink>
          </li>
          <li className={`${styles.tab} ${styles.tabBig} ${this.isActive('/wrap-unwrap')}`}>
            <NavLink to={'/wrap-unwrap'}>Wrap / Unwrap</NavLink>
          </li>
          <li className={`${styles.tab} ${this.isActive('/transfer')}`}>
            <NavLink to={'/transfer'}>Transfer</NavLink>
          </li>
        </ul>
      </div>
    );
  }
}

OasisTabs.displayName = 'OasisTabs';
OasisTabs.propTypes = propTypes;
OasisTabs.defaultProps = defaultProps;
export default CSSModules(OasisTabs, styles, {allowMultiple: true});
