import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisVolumeIsOverTheOfferMax.scss';
import InfoBoxWithIco from './InfoBoxWithIco';
import { formatAmount } from '../utils/tokens/pair';


const propTypes = PropTypes && {
  offerMax: PropTypes.string.isRequired,
  tokenName: PropTypes.string.isRequired,
};
const defaultProps = {};


class OasisVolumeIsOverTheOfferMax extends PureComponent {
  render() {
    const { offerMax, tokenName } = this.props;
    return (
      <InfoBoxWithIco icon="warning" color="danger" className={styles.base}>
          Current volume is greater than offer maximum of <b>{formatAmount(offerMax)} {tokenName}</b>
      </InfoBoxWithIco>
    );
  }
}

OasisVolumeIsOverTheOfferMax.displayName = 'OasisVolumeIsOverTheOfferMax';
OasisVolumeIsOverTheOfferMax.propTypes = propTypes;
OasisVolumeIsOverTheOfferMax.defaultProps = defaultProps;
export default OasisVolumeIsOverTheOfferMax;
