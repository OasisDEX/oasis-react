import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisSellMaker.scss';

const propTypes = PropTypes && {};
const defaultProps = {};

class OasisSellMaker extends PureComponent {
  render() {
    return (
      <div className={styles.base}>
        OasisSellMaker
      </div>
    );
  }
}

OasisSellMaker.displayName = 'OasisSellMaker';
OasisSellMaker.propTypes = propTypes;
OasisSellMaker.defaultProps = defaultProps;
export default OasisSellMaker;
