import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';

const loadProgress = (loadedOffersList, offersTotalCount) =>
  loadedOffersList && offersTotalCount ? parseInt((loadedOffersList.count() / offersTotalCount  ) * 100): null;

const style = {
 background: 'gray',
 color: 'white',
  fontSize: '12px',
  padding: '3px 4px',
  verticalAlign: 'middle'
};

const LoadProgressSection = ({ loadedOffersList, offersTotalCount }) => {
  const loaded = loadProgress(loadedOffersList, offersTotalCount);
  return (
    <span style={style}  className={'loadProgress'}>
      <span hidden={offersTotalCount!=null}>loading</span>
      <span hidden={loaded==null}>{loaded}% / {offersTotalCount}</span>
      <span hidden={loaded!=null && offersTotalCount != null}>{offersTotalCount}</span>
    </span>

  )
};

LoadProgressSection.propTypes = {
  loadedOffersList: ImmutablePropTypes.list,
  offersTotalCount: PropTypes.number
}
export { loadProgress, LoadProgressSection };