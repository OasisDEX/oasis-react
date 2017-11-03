import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisWrapUnwrapBalances.scss';


const propTypes = PropTypes && {
};
const defaultProps = {};


class OasisWrapUnwrapBalances extends PureComponent {
  render() {
    return (
      <div className={styles.base}>
      </div>
    );
  }
}

OasisWrapUnwrapBalances.displayName = 'OasisWrapUnwrapBalances';
OasisWrapUnwrapBalances.propTypes = propTypes;
OasisWrapUnwrapBalances.defaultProps = defaultProps;
export default OasisWrapUnwrapBalances;
