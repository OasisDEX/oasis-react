import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { NavLink } from 'react-router-dom';
import styles from './OasisTabs.scss';
import CSSModules from 'react-css-modules';

const propTypes = PropTypes && {
  pathname: PropTypes.string
};
const defaultProps = {};

class OasisTabs extends PureComponent {
  isActive(basePath) {
    const  { pathname } = this.props;
    if (pathname && pathname.indexOf(basePath) === 0) { return 'active'; }
    else { return ''; }
  }
  render() {
    console.log(this.props);
    return (
      <div styleName="row-tabs">
        <ul styleName="Tabs">
          <li styleName={`Tab ${this.isActive('/trade')}`}>
            <NavLink to={'/trade'}>Trade</NavLink>
          </li>
          <li styleName={`Tab Tab--2x ${this.isActive('/wrap-unwrap')}`}>
            <NavLink to={'/wrap-unwrap'}>Wrap / Unwrap</NavLink>
          </li>
          <li styleName={`Tab ${this.isActive('/transfer')}`}>
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
export default CSSModules(styles, {allowMultiple: true})(OasisTabs);
