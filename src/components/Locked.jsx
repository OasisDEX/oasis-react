import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './Locked.scss';


const propTypes = PropTypes && {
};
const defaultProps = {};


class Locked extends PureComponent {
  render() {
    return (
      <div className={styles.base}>
        Account locked
      </div>
    );
  }
}

Locked.displayName = 'Locked';
Locked.propTypes = propTypes;
Locked.defaultProps = defaultProps;
export default Locked;
