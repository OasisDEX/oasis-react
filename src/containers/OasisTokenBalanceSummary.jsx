import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import OasisTokenBalance  from './OasisTokenBalance';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisTokenBalanceSummary.scss';
import CSSModules from 'react-css-modules';

const propTypes = PropTypes && {};
const defaultProps = {
  className: ''
};

export class OasisTokenBalanceSummary extends PureComponent {
  render() {
    const { summary, token, className } = this.props;
    return (
      <div className={`${styles.summary} ${className}`}>
        <span className={styles.summaryLabel}>
          {summary}
        </span>
        {this.props.children || <OasisTokenBalance tokenName={token} {...this.props} />}
      </div>
    );
  }
}


OasisTokenBalanceSummary.propTypes = propTypes;
OasisTokenBalanceSummary.defaultProps = defaultProps;
OasisTokenBalanceSummary.displayName = 'OasisTokenBalance';
export default CSSModules(OasisTokenBalanceSummary,styles);
