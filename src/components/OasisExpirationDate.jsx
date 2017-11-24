import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisExpirationDate.scss';

const propTypes = PropTypes && {};
const defaultProps = {};

class OasisExpirationDate extends PureComponent {
  render() {
    return (
      <div className={styles.base}>
        OasisExpirationDate
      </div>
    );
  }
}

OasisExpirationDate.displayName = 'OasisExpirationDate';
OasisExpirationDate.propTypes = propTypes;
OasisExpirationDate.defaultProps = defaultProps;
export default OasisExpirationDate;
