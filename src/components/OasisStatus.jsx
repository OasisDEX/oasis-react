import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import { PropTypes } from 'prop-types';
import styles from './OasisStatus.scss';
import { ONLINE, OUT_OF_SYNC, CLOSED, CONNECTING } from '../constants';

const propTypes = PropTypes && {
  status: PropTypes.string.isRequired
};

const defaultProps = {};

const INDICATORS = {
  [ONLINE]: {class: 'StatusIndicator--Online', text: 'Connected'},
  [CONNECTING]: {class: 'StatusIndicator--Closed', text: 'Connecting'},
  [OUT_OF_SYNC]: {class: 'StatusIndicator--Out-Of-Sync', text: 'Out Of Sync'},
  [CLOSED]: {class: 'StatusIndicator--Closed', text: 'Closed'}
};

export class OasisStatus extends PureComponent {
  render() {
    const {name, status} = this.props;
    return (
      <div styleName='OasisStatus'>
        <span> {name} </span>
        <div styleName={`StatusIndicator NetworkStatus ${INDICATORS[status].class}`}>
          {INDICATORS[status].text}
        </div>
      </div>
    );
  }
}

OasisStatus.displayName = 'OasisStatus';
OasisStatus.propTypes = propTypes;
OasisStatus.defaultProps = defaultProps;

export default CSSModules(OasisStatus, styles, {allowMultiple: true});
