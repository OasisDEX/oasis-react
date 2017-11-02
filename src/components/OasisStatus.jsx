import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisStatus.scss';

const propTypes = PropTypes && {
};
const defaultProps = {};


const StatusIndicator = () => (
    <div className={styles.base}></div>
);

class OasisStatus extends PureComponent {
  render() {
    const { networkName, networkStatus } = this.props;
    return (
      <div className={"OasisStatus"}>
        <div className="NetworkName">{networkName}</div>
        <div className="NetworkStatus">
          <StatusIndicator/>
          {networkStatus}
        </div>
      </div>
    );
  }
}

OasisStatus.displayName = 'OasisStatus';
OasisStatus.propTypes = propTypes;
OasisStatus.defaultProps = defaultProps;
export default OasisStatus;
