import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisLogo.scss';
import CSSModules from 'react-css-modules';

const propTypes = PropTypes && {};
const defaultProps = {};

export class OasisLogo extends PureComponent {
  render() {
    return (
      <a rel="noopener noreferrer" styleName='OasisLogoWrapper' href="http://oasisdex.com">
        <div styleName='OasisLogo'/>
      </a>
    );
  }
}

OasisLogo.displayName = 'OasisLogo';
OasisLogo.propTypes = propTypes;
OasisLogo.defaultProps = defaultProps;
export default CSSModules(OasisLogo, styles);
