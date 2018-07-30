import React from "react";
import PropTypes from "prop-types";
import CSSModule from "react-css-modules";
import ImmutablePropTypes from "react-immutable-proptypes";
import OasisIcon from "./OasisIcon";
import styles from "./OasisLoadProgressSection.scss";

const loadProgress = (loadedOffersList, offersTotalCount) => {
  const progress =
    loadedOffersList && offersTotalCount
      ? parseInt(loadedOffersList.count() / offersTotalCount * 100)
      : null;
  return progress <= 100 ? progress : 100;
};

const style = (loadedOffersList, offersTotalCount, showPercent) => {
  const progress = showPercent
    ? loadProgress(loadedOffersList, offersTotalCount)
    : 100;
  return {
    background: `linear-gradient(90deg, #F8F7F5 ${
      progress ? progress : 0
    }%, #fff 0%)`
  };
};

const LoadProgressSection = ({
  loadedOffersList,
  offersTotalCount,
  showPercent
}) => {
  const loaded = loadProgress(loadedOffersList, offersTotalCount);
  return offersTotalCount == null ? (
    <span style={{ float: "right" }}>
      <OasisIcon icon="loading" />
    </span>
  ) : (
    <span
      style={style(loadedOffersList, offersTotalCount)}
      className={styles.LoadProgress}
    >
      <span hidden={offersTotalCount != null}>
        <OasisIcon icon="loading" />
      </span>
      <span hidden={loaded == null}>
        {showPercent ? `${loaded}% / ` : null} {offersTotalCount}
      </span>
      <span hidden={loaded != null && offersTotalCount != null}>
        {offersTotalCount === 0 ? "no orders" : offersTotalCount}
      </span>
    </span>
  );
};

LoadProgressSection.propTypes = {
  loadedOffersList: ImmutablePropTypes.list,
  offersTotalCount: PropTypes.number,
  showPercent: PropTypes.bool
};
export default CSSModule(LoadProgressSection, { loadProgress, styles });
