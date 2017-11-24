import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisMarket.scss';

const propTypes = PropTypes && {};
const defaultProps = {};

class OasisMarket extends PureComponent {
  render() {
    return (
      <div className={styles.base}>
        OasisMarket
      </div>
    );
  }
}

OasisMarket.displayName = 'OasisMarket';
OasisMarket.propTypes = propTypes;
OasisMarket.defaultProps = defaultProps;
export default OasisMarket;
