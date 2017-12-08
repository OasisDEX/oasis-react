import React, { PureComponent } from 'react'
import { PropTypes } from 'prop-types';
import OasisWidgetFrame from '../containers/OasisWidgetFrame';


class OasisMarketWidget extends PureComponent {
  render(){
    return (
      <OasisWidgetFrame heading="MARKETS"/>
    )
  }
}

OasisMarketWidget.displayName = "OasisMarkets";
OasisMarketWidget.propTypes = {};
export default OasisMarketWidget;