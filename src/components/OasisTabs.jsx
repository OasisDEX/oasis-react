import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import './OasisTabs.scss';


const propTypes = PropTypes && {
  children: PropTypes.node
};
const defaultProps = {};


class OasisTabs extends PureComponent {
  render() {
    return (
      <div className="OasisTabs">
      </div>
    );
  }
}

OasisTabs.displayName = 'OasisTabs';
OasisTabs.propTypes = propTypes;
OasisTabs.defaultProps = defaultProps;
export default OasisTabs;
