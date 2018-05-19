import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

// import styles from './OasisDontWrapAllEther.scss';
import {InfoBox} from "./InfoBox";


const propTypes = PropTypes && {
};
const defaultProps = {};


class OasisDontWrapAllEther extends PureComponent {
  render() {
    return (
      <InfoBox color='danger' {...this.props}>
        <div style={{width: '100%'}}>
          <span style={{ textDecoration:'underline' }}>Do not wrap all</span> of your <b>ETH</b>! <br/>
          <div>
            Otherwise you will not be able to pay for transactions.
          </div>
        </div>
      </InfoBox>
    );
  }
}

OasisDontWrapAllEther.displayName = 'OasisDontWrapAllEther';
OasisDontWrapAllEther.propTypes = propTypes;
OasisDontWrapAllEther.defaultProps = defaultProps;
export default OasisDontWrapAllEther;
