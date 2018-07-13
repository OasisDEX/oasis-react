import React from "react";
import PropTypes from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import OasisIcon from "../../components/OasisIcon";

const loadProgress = (loadedOffersList, offersTotalCount) => {
  const progress = loadedOffersList && offersTotalCount
    ? parseInt(loadedOffersList.count() / offersTotalCount * 100)
    : null;
  return progress <= 100 ?  progress: 100;
};

const style = (loadedOffersList, offersTotalCount, showPercent) => {
  const progress = showPercent ? loadProgress(loadedOffersList, offersTotalCount) : 100;
  return {
    background: `linear-gradient(90deg, #F8F7F5 ${
      progress ? progress : 0
    }%, #fff 0%)`,
    border: "1px solid #b1b1b3",
    color: "#68686C",
    fontSize: "11px",
    padding: "5px 0",
    float: "right",
    fontWeight: "bold",
    borderRadius: "7%",
    width: "130px",
    textAlign: "center",
    letterSpacing: "normal",
    position: "relative",
    top: '1px'
  };
};

const LoadProgressSection = ({ loadedOffersList, offersTotalCount, showPercent }) => {
  const loaded = loadProgress(loadedOffersList, offersTotalCount);
  return offersTotalCount == null ? (
    <span style={{ float: "right" }}>
      <OasisIcon icon="loading" />
    </span>
  ) : (
    <span
      style={style(loadedOffersList, offersTotalCount)}
      className={"loadProgress"}
    >
      <span hidden={offersTotalCount != null}>
        <OasisIcon icon="loading" />
      </span>
      <span hidden={loaded == null}>
        {showPercent ? `${loaded}% / `: null}  {offersTotalCount}
      </span>
      <span hidden={loaded != null && offersTotalCount != null}>
        {offersTotalCount === 0 ? 'no orders' : offersTotalCount }
      </span>
    </span>
  );
};

LoadProgressSection.propTypes = {
  loadedOffersList: ImmutablePropTypes.list,
  offersTotalCount: PropTypes.number,
  showPercent: PropTypes.bool
};
export { loadProgress, LoadProgressSection };
