import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { NavLink } from 'react-router-dom';
import styles from './OasisTabs.scss';
import CSSModules from 'react-css-modules';

const propTypes = PropTypes && {
  children: PropTypes.node,
};
const defaultProps = {};

class OasisTabs extends PureComponent {
  render() {
    return (
      <div styleName="row-tabs">
        <ul styleName="Tabs">
          <li styleName="Tab"><NavLink to={'/trade'}>Trade</NavLink></li>
          <li styleName="Tab Tab--2x"><NavLink to={'/transfer'}>Wrap / Unwrap</NavLink></li>
          <li styleName="Tab"><NavLink to={'/wrap-unwrap'}>Transfer</NavLink></li>
        </ul>
      </div>
    );
  }
}

OasisTabs.displayName = 'OasisTabs';
OasisTabs.propTypes = propTypes;
OasisTabs.defaultProps = defaultProps;
export default CSSModules(OasisTabs, styles, {allowMultiple: true});
