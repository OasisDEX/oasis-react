import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import styles from './OasisOfferNotAvailable.scss';
import InfoBoxBody from './InfoBoxBody';
import InfoBox from './InfoBox';


const propTypes = PropTypes && {};
const defaultProps = {};


class OasisOfferNotAvailable extends PureComponent {
  render() {
    return (
      <InfoBox color="danger" className={styles.base}>
        <InfoBoxBody>
          <div>Offer is not available anymore</div>
          <div>Will close shortly</div>
        </InfoBoxBody>
      </InfoBox>
    );
  }
}

OasisOfferNotAvailable.displayName = 'OasisOfferNotAvailable';
OasisOfferNotAvailable.propTypes = propTypes;
OasisOfferNotAvailable.defaultProps = defaultProps;
export default OasisOfferNotAvailable;
