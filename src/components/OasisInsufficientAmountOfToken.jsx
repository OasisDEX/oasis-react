import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisInsufficientAmountOfToken.scss';

const propTypes = PropTypes && {
  tokenName: PropTypes.string.isRequired
};
const defaultProps = {};


class OasisInsufficientAmountOfToken extends PureComponent {
  render() {
    return (
      <div className={styles.base}>
        You do not have enough <b>{this.props.tokenName}</b> tokens.
      </div>
    );
  }
}

OasisInsufficientAmountOfToken.displayName = 'OasisInsufficientAmountOfToken';
OasisInsufficientAmountOfToken.propTypes = propTypes;
OasisInsufficientAmountOfToken.defaultProps = defaultProps;
export default OasisInsufficientAmountOfToken;
