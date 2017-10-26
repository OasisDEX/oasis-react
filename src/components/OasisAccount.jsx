import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import './OasisAccount.scss';


const propTypes = PropTypes && {};
const defaultProps = {};


class OasisAccount extends PureComponent {
  render() {
    return (
      <div className="OasisAccount">
      </div>
    );
  }
}

OasisAccount.displayName = 'OasisAccount';
OasisAccount.propTypes = propTypes;
OasisAccount.defaultProps = defaultProps;
export default OasisAccount;
