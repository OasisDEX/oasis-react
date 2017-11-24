import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisCard.scss';

const propTypes = PropTypes && {
  children: PropTypes.node,
  heading: PropTypes.string.isRequired,
};
const defaultProps = {};

class OasisCard extends PureComponent {
  render() {
    const { heading } = this.props;
    return (
      <div className={styles.base}>
        <h2>{heading}</h2>
        <div className={styles.OasisCardContent}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

OasisCard.displayName = 'OasisCard';
OasisCard.propTypes = propTypes;
OasisCard.defaultProps = defaultProps;
export default OasisCard;
