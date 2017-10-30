import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import './OasisBuyMaker.scss';


const propTypes = PropTypes && {};
const defaultProps = {};


class OasisBuyMaker extends PureComponent {
  render() {
    return (
      <div className="OasisBuyMaker">
        OasisBuyMaker
      </div>
    );
  }
}

OasisBuyMaker.displayName = 'OasisBuyMaker';
OasisBuyMaker.propTypes = propTypes;
OasisBuyMaker.defaultProps = defaultProps;
export default OasisBuyMaker;
