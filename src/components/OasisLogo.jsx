import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import './OasisLogo.scss';

const propTypes = PropTypes && {
};
const defaultProps = {};


class OasisLogo extends PureComponent {
  render() {
    return (
      <div className="OasisLogo"></div>
    );
  }
}

OasisLogo.displayName = 'OasisLogo';
OasisLogo.propTypes = propTypes;
OasisLogo.defaultProps = defaultProps;
export default OasisLogo;
