import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import InfoBoxWithIco from "./InfoBoxWithIco";


const propTypes = PropTypes && {};
const defaultProps = {};


class OasisOfferNotAvailable extends PureComponent {
  render() {
    return (
      <InfoBoxWithIco color="danger" icon="failed">
        This order is <b>not available anymore</b>
      </InfoBoxWithIco>
    );
  }
}

OasisOfferNotAvailable.displayName = 'OasisOfferNotAvailable';
OasisOfferNotAvailable.propTypes = propTypes;
OasisOfferNotAvailable.defaultProps = defaultProps;
export default OasisOfferNotAvailable;
