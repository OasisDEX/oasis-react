import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import './OasisCard.scss';

const propTypes = PropTypes && {
  children: PropTypes.node
};
const defaultProps = {};


class OasisCard extends PureComponent {
  render() {
    return (
      <div className="OasisCard order-section">
        {this.props.children}
      </div>
    );
  }
}

OasisCard.displayName = 'OasisCard';
OasisCard.propTypes = propTypes;
OasisCard.defaultProps = defaultProps;
export default OasisCard;
