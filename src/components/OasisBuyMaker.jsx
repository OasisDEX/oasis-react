import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisBuyMaker.scss';

const propTypes = PropTypes && {};
const defaultProps = {};

class OasisBuyMaker extends PureComponent {
  render() {
    return (
      <div className={styles.base}>
        OasisBuyMaker
      </div>
    );
  }
}

OasisBuyMaker.displayName = 'OasisBuyMaker';
OasisBuyMaker.propTypes = propTypes;
OasisBuyMaker.defaultProps = defaultProps;
export default OasisBuyMaker;
