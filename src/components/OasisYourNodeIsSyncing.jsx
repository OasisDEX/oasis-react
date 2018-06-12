import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import CSSModules from "react-css-modules";
import styles from "./OasisYourNodeIsSyncing.scss";

import OasisLogo from "./../assets/logo-oasis-hover.png";
import loading from "./../assets/od-icons/icon-syncing.svg";
import OasisFooterWrapper from "../containers/OasisFooter";
import web3 from "../bootstrap/web3";
import moment from "moment";
import { KOVAN_NET_ID, MAIN_NET_ID } from "../constants";

const propTypes = PropTypes && {
  latestBlock: PropTypes.object,
  networkId: PropTypes.string
};
const defaultProps = {};

class OasisYourNodeIsSyncing extends PureComponent {
  getNetworkName() {
    const { networkId } = this.props;

    switch (networkId) {
      case MAIN_NET_ID:
        return "Homestead";
      case KOVAN_NET_ID:
        return "Kovan";
    }
  }

  formatBlockTime() {
    const { latestBlock: { timestamp } } = this.props;
    return moment.unix(timestamp).format("llll");
  }

  render() {
    const { latestBlock: { number } = {} } = this.props;
    return (
      <section className={styles.LockedAccountSection}>
        <div>
          <div style={{ textAlign: "center" }}>
            <img
              src={loading}
              style={{ width: "400px", position: "relative" }}
              alt=""
            />
          </div>
          <div className={styles.LogoContainer}>
            <img
              className={styles.OasisLogo}
              alt="Oasis Logo"
              style={{ position: "relative", bottom: "250px" }}
              src={OasisLogo}
            />
          </div>
        </div>
        <hr className={styles.Separator} />
        <h1 className={styles.Heading}>Your node this syncing</h1>
        <hr className={styles.Separator} />
        <p className={styles.Message}>
          <span
            style={{
              background: "white",
              color: "#6f727d",
              border: "1px solid #6f727d",
              padding: "10px",
              borderRadius: "10px 0 0 10px"
            }}
          >
            Network
          </span>
          <span
            style={{
              background: "#6f727d",
              color: "white",
              padding: "10px",
              borderRadius: "0 10px 10px 0"
            }}
          >
            {this.getNetworkName()}
          </span>
        </p>
        <p className={styles.Message}>
          <span
            style={{
              background: "white",
              color: "#6f727d",
              border: "1px solid #6f727d",
              padding: "10px",
              borderRadius: "10px 0 0 10px"
            }}
          >
            Current block
          </span>
          <span
            style={{
              background: "#6f727d",
              color: "white",
              padding: "10px",
              borderRadius: "0 10px 10px 0"
            }}
          >
            {web3.toBigNumber(number).toFormat()} @ {this.formatBlockTime()}
          </span>
        </p>
        <hr className={styles.Separator} />
        <OasisFooterWrapper />
      </section>
    );
  }
}

OasisYourNodeIsSyncing.displayName = "OasisYourNodeIsSyncing";
OasisYourNodeIsSyncing.propTypes = propTypes;
OasisYourNodeIsSyncing.defaultProps = defaultProps;
export default CSSModules(OasisYourNodeIsSyncing, styles, {
  allowMultiple: true
});
