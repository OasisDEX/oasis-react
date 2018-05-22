import React, { PureComponent } from "react";
import CSSModules from "react-css-modules";
import { PropTypes } from "prop-types";
import styles from "./OasisStatus.scss";
import { ONLINE, OUT_OF_SYNC, CLOSED, CONNECTING } from "../constants";
import OasisLoadingIndicator from './OasisLoadingIndicator';
import isNumeric from '../utils/numbers/isNumeric';

const propTypes = PropTypes && {
  status: PropTypes.string.isRequired,
  name: PropTypes.string,
  offersLoadingProgress: PropTypes.number
};

const defaultProps = {};

const INDICATORS = {
  [ONLINE]: { class: "StatusIndicator--Online", text: "Connected" },
  [CONNECTING]: { class: "StatusIndicator--Closed", text: "Connecting" },
  [OUT_OF_SYNC]: { class: "StatusIndicator--Out-Of-Sync", text: "Out Of Sync" },
  [CLOSED]: { class: "StatusIndicator--Closed", text: "Closed" }
};

export class OasisStatus extends PureComponent {

  renderOffersLoadProgress() {
    const { offersLoadProgress } = this.props;
    if (offersLoadProgress >= 0 && offersLoadProgress < 100) {
      return (
        <span styleName="OffersLoadProgress">
          <OasisLoadingIndicator marginRight={'3px'}/>
          <span>offers</span>
          <span>({isNumeric(offersLoadProgress) ? offersLoadProgress: '0' }%)</span>
        </span>
      );
    } else {
      return null;
    }

  }

  statusIndicator() {
    const { status } = this.props;
    return (
      <div styleName={`StatusIndicator NetworkStatus ${INDICATORS[status].class}`}>
        {INDICATORS[status].text}
      </div>
    );
  }

  renderNetworkName() {
    const { name } = this.props;
    if (name === '-') {
      return  (
        <div>
          <OasisLoadingIndicator size={'sm'} marginRight={'10px'}/> <span>{name}</span>
        </div>
      )
    } else {
      return name;
    }
  }

  render() {
    return (
      <div styleName="OasisStatus">
        <div>{this.renderNetworkName()}</div>
        <div>
          {this.renderOffersLoadProgress() || this.statusIndicator()}
        </div>
      </div>
    );
  }
}

OasisStatus.displayName = "OasisStatus";
OasisStatus.propTypes = propTypes;
OasisStatus.defaultProps = defaultProps;

export default CSSModules(OasisStatus, styles, { allowMultiple: true });
