import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisOfferTakeWarningBox.scss';
import InfoBox from './InfoBox';
import InfoBoxBody from './InfoBoxBody';

const propTypes = PropTypes && {
};
const defaultProps = {};


class OasisOfferTakeWarningBox extends PureComponent {
  render() {
    return (
      <InfoBox className={styles.base}>
        <InfoBoxBody>
          If someone (partially) fills this order before you do, your offer may only be partially filled or even denied,
          in which case unused funds will be refunded to your balance and allowance.
        </InfoBoxBody>
      </InfoBox>
    );
  }
}

OasisOfferTakeWarningBox.displayName = 'OasisOfferTakeWarningBox';
OasisOfferTakeWarningBox.propTypes = propTypes;
OasisOfferTakeWarningBox.defaultProps = defaultProps;
export default OasisOfferTakeWarningBox;
