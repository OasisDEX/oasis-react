import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import textStyles from '../styles/modules/_typography.scss';
import InfoBox from './InfoBox';

const propTypes = PropTypes && {
  tokenName: PropTypes.string.isRequired,
  noBorder: PropTypes.bool
};
const defaultProps = {};


class OasisInsufficientAmountOfToken extends PureComponent {
  render() {
    return (
        <InfoBox color="danger" noBorder={this.props.noBorder}>
            You do not have enough <strong className={textStyles.spaceBoth}>{this.props.tokenName}</strong> tokens.
        </InfoBox>
    );
  }
}

OasisInsufficientAmountOfToken.displayName = 'OasisInsufficientAmountOfToken';
OasisInsufficientAmountOfToken.propTypes = propTypes;
OasisInsufficientAmountOfToken.defaultProps = defaultProps;
export default OasisInsufficientAmountOfToken;
