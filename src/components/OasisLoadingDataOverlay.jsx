import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisLoadingDataOverlay.scss';
import CSSModules from 'react-css-modules';
import OasisLoadingIndicator from './OasisLoadingIndicator';


const propTypes = PropTypes && {
};
const defaultProps = {};


export class OasisLoadingDataOverlay extends PureComponent {
  render() {
    const { loadingText } = this.props;
      return (
        <div className={styles.base}>
          <div style={{ textAlign: 'center' }}>
            <OasisLoadingIndicator size="xlg"/>
            <span className={styles.loadingText}>
              {loadingText}
            </span>
            </div>
        </div>
      );
  }
}

OasisLoadingDataOverlay.displayName = 'OasisLoadingDataOverlay';
OasisLoadingDataOverlay.propTypes = propTypes;
OasisLoadingDataOverlay.defaultProps = defaultProps;
export default CSSModules(OasisLoadingDataOverlay, styles, { allowMultiple: true });
