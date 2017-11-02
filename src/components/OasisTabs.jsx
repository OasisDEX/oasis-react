import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { NavLink } from 'react-router-dom';
// import ImmutablePropTypes from 'react-immutable-proptypes';
import styles from './OasisTabs.scss';


const propTypes = PropTypes && {
  children: PropTypes.node
};
const defaultProps = {};


class OasisTabs extends PureComponent {
  render() {
    return (
      <div className={styles.base}>
        <div className="row-tabs">
          <ul className="tabs">
            <li><NavLink to={'/trade'}>Trade</NavLink></li>
            <li><NavLink to={'/wrap-unwrap'}>Wrap / Unwrap</NavLink></li>
            <li><NavLink to={'/transfer'}>Transfer</NavLink></li>
          </ul>
        </div>
        {this.props.children}
      </div>
    );
  }
}

OasisTabs.displayName = 'OasisTabs';
OasisTabs.propTypes = propTypes;
OasisTabs.defaultProps = defaultProps;
export default OasisTabs;
