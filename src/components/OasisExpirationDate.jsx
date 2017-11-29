import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisExpirationDate.scss';
import CSSModules from 'react-css-modules';

const propTypes = PropTypes && {};
const defaultProps = {};

class OasisExpirationDate extends PureComponent {
  render() {
    return (
      <div styleName="ClosingTime">
        <div > CLOSING TIME </div>
        {/* TODO: Get this date passed to the component*/}
        <div styleName="Date"> 11-Sep-2018 </div>
      </div>
    );
  }
}

OasisExpirationDate.displayName = 'OasisExpirationDate';
OasisExpirationDate.propTypes = propTypes;
OasisExpirationDate.defaultProps = defaultProps;

export default CSSModules(OasisExpirationDate,styles);
