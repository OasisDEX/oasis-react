import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import './OasisStatus.scss';

const propTypes = PropTypes && {
};
const defaultProps = {};


class OasisStatus extends PureComponent {
  render() {
    return (
      <div className={"OasisStatus"}>
      </div>
    );
  }
}

OasisStatus.displayName = 'OasisStatus';
OasisStatus.propTypes = propTypes;
OasisStatus.defaultProps = defaultProps;
export default OasisStatus;
