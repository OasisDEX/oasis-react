import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import './OasisExpirationDate.scss';


const propTypes = PropTypes && {
};
const defaultProps = {};


class OasisExpirationDate extends PureComponent {
  render() {
    return (
      <div className="OasisExpirationDate">
      </div>
    );
  }
}

OasisExpirationDate.displayName = 'OasisExpirationDate';
OasisExpirationDate.propTypes = propTypes;
OasisExpirationDate.defaultProps = defaultProps;
export default OasisExpirationDate;
