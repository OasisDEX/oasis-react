import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisMarketHistory.scss';


const propTypes = PropTypes && {
};
const defaultProps = {};


class OasisMarketHistory extends PureComponent {
  render() {
    return (
      <div className={styles.base}>
        OasisMarketHistory
      </div>
    );
  }
}

OasisMarketHistory.displayName = 'OasisMarketHistory';
OasisMarketHistory.propTypes = propTypes;
OasisMarketHistory.defaultProps = defaultProps;
export default OasisMarketHistory;
