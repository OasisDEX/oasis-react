import React, { PureComponent } from "react";
import CSSModules from "react-css-modules";
import { PropTypes } from "prop-types";
import styles from "./OasisStatus.scss";
import { ONLINE, OUT_OF_SYNC, CLOSED, CONNECTING } from "../constants";
import OasisLoadingIndicator from "./OasisLoadingIndicator";
import isNumeric from "../utils/numbers/isNumeric";

const propTypes = PropTypes && {
  status: PropTypes.string.isRequired,
  name: PropTypes.string,
  offersLoadingProgress: PropTypes.number,
  offersInitiallyLoaded: PropTypes.bool,
  initialMarketHistoryLoaded: PropTypes.bool
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
        <span className={styles.offersLoadProgress}>
          <OasisLoadingIndicator marginRight={"3px"} />
          <span>offers</span>
          <span>
            ({isNumeric(offersLoadProgress) ? offersLoadProgress : "0"}%)
          </span>
        </span>
      );
    } else {
      return null;
    }
  }

  statusIndicator() {
    const { status } = this.props;
    return (
      <div
        styleName={`StatusIndicator NetworkStatus ${INDICATORS[status].class}`}
      >
        {INDICATORS[status].text}
      </div>
    );
  }

  getTradesLoadProgress() {
    const { initialMarketHistoryLoaded } = this.props;
    return initialMarketHistoryLoaded !==true ? 0: 100;
  }

  renderTradesHistoryLoadProgress() {
    const { initialMarketHistoryLoaded } = this.props;
    return initialMarketHistoryLoaded!==true ? (
      <span>
        <OasisLoadingIndicator marginRight={"3px"} />
        <span className={styles.tradesLoadProgress}>
          history <span>({this.getTradesLoadProgress()}%)</span>
        </span>
      </span>
    ): null;
  }

  renderNetworkName() {
    const { name } = this.props;
    if (name === "-") {
      return (
        <div>
          <OasisLoadingIndicator size={"sm"} marginRight={"10px"} />{" "}
          <span>{name}</span>
        </div>
      );
    } else {
      return name;
    }
  }

  renderContent() {
    const { activeTradingPairOffersInitiallyLoaded } = this.props;
    if(!activeTradingPairOffersInitiallyLoaded) {
      return this.renderOffersLoadProgress()
    } else {
      return  this.renderTradesHistoryLoadProgress() || this.statusIndicator();
    }
  }

  render() {
    return (
      <div styleName="OasisStatus">
        <div>{this.renderNetworkName()}</div>
        <div>{this.renderContent()}</div>
      </div>
    );
  }
}

OasisStatus.displayName = "OasisStatus";
OasisStatus.propTypes = propTypes;
OasisStatus.defaultProps = defaultProps;

export default CSSModules(OasisStatus, styles, { allowMultiple: true });
