import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisDontWrapAllEther.scss';
import {InfoBox} from "./InfoBox";
import {InfoBoxBody} from "./InfoBoxBody";


const propTypes = PropTypes && {
};
const defaultProps = {};


class OasisDontWrapAllEther extends PureComponent {
  render() {
    return (
      <InfoBox color='danger' className={styles.base}>
        <InfoBoxBody>
        Do not wrap all of your ETH! Otherwise you cannot pay for transactions.
        </InfoBoxBody>
      </InfoBox>
    );
  }
}

OasisDontWrapAllEther.displayName = 'OasisDontWrapAllEther';
OasisDontWrapAllEther.propTypes = propTypes;
OasisDontWrapAllEther.defaultProps = defaultProps;
export default OasisDontWrapAllEther;
