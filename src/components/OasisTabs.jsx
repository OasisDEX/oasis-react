import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { NavLink } from 'react-router-dom';
import styles from './OasisTabs.scss';
import CSSModules from 'react-css-modules';

const propTypes = PropTypes && {};
const defaultProps = {};

class OasisTabs extends PureComponent {
  render() {
    return (
      <div styleName="row-tabs">
        <ul styleName="Tabs">
          <li styleName="Tab"><NavLink to={'/trade'} activeClassName={styles.active}>Trade</NavLink></li>
          <li styleName="Tab Tab--2x"><NavLink to={'/wrap-unwrap'} activeClassName={styles.active}>Wrap / Unwrap</NavLink></li>
          <li styleName="Tab"><NavLink to={'/transfer'} activeClassName={styles.active}>Transfer</NavLink></li>
        </ul>
      </div>
    );
  }
}

OasisTabs.displayName = 'OasisTabs';
OasisTabs.propTypes = propTypes;
OasisTabs.defaultProps = defaultProps;
export default CSSModules(OasisTabs, styles, {allowMultiple: true});
