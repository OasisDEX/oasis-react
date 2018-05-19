import React from "react";
import PropTypes from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import OasisIcon from "../../components/OasisIcon";

const loadProgress = (loadedOffersList, offersTotalCount) =>
  loadedOffersList && offersTotalCount
    ? parseInt(loadedOffersList.count() / offersTotalCount * 100)
    : null;

const style = (loadedOffersList, offersTotalCount) => {
  const progress = loadProgress(loadedOffersList, offersTotalCount);

  return {
    background: `linear-gradient(90deg, #F8F7F5 ${
      progress ? progress : 0
    }%, #fff 0%)`,
    border: "1px solid #b1b1b3",
    color: "#68686C",
    fontSize: "11px",
    padding: "6px 6px",
    float: "right",
    fontWeight: "bold",
    borderRadius: "7%",
    width: "130px",
    textAlign: "center"
  };
};

const LoadProgressSection = ({ loadedOffersList, offersTotalCount }) => {
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
        {loaded}% / {offersTotalCount}
      </span>
      <span hidden={loaded != null && offersTotalCount != null}>
        {offersTotalCount}
      </span>
    </span>
  );
};

LoadProgressSection.propTypes = {
  loadedOffersList: ImmutablePropTypes.list,
  offersTotalCount: PropTypes.number
};
export { loadProgress, LoadProgressSection };
