import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisInsufficientAmountOfToken.scss';
import InfoBox from './InfoBox';
import InfoBoxBody from './InfoBoxBody';

const propTypes = PropTypes && {
  tokenName: PropTypes.string.isRequired
};
const defaultProps = {};


class OasisInsufficientAmountOfToken extends PureComponent {
  render() {
    return (
      <div className={styles.base}>
        <InfoBox color="danger">
          <InfoBoxBody>
            You do not have enough <b>{this.props.tokenName}</b> tokens.
          </InfoBoxBody>
        </InfoBox>
      </div>
    );
  }
}

OasisInsufficientAmountOfToken.displayName = 'OasisInsufficientAmountOfToken';
OasisInsufficientAmountOfToken.propTypes = propTypes;
OasisInsufficientAmountOfToken.defaultProps = defaultProps;
export default OasisInsufficientAmountOfToken;
