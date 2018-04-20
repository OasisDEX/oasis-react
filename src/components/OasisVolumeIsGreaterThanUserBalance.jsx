import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisVolumeIsGreaterThanUserBalance.scss';
import CSSModules from 'react-css-modules/dist/index';


const propTypes = PropTypes && {};
const defaultProps = {
  offerMax: PropTypes.string.isRequired
};


class OasisVolumeIsGreaterThanUserBalance extends PureComponent {
  render() {
    return (
      <div styleName={styles.base}>
        Current volume is greater than offer maximum of <b>{this.props.offerMax}</b>
      </div>
    );
  }
}

OasisVolumeIsGreaterThanUserBalance.displayName = 'OasisVolumeIsGreaterThanUserBalance';
OasisVolumeIsGreaterThanUserBalance.propTypes = propTypes;
OasisVolumeIsGreaterThanUserBalance.defaultProps = defaultProps;
export default CSSModules(OasisVolumeIsGreaterThanUserBalance);
