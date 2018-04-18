import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import OasisTokenBalance  from './OasisTokenBalance';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisTokenBalanceSummary.scss';
import CSSModules from 'react-css-modules';

const propTypes = PropTypes && {};

export class OasisTokenBalanceSummary extends PureComponent {
  render() {
    const { summary, token } = this.props;
    return (
      <div className={styles.summary}>
        {summary}
        {this.props.children || <OasisTokenBalance tokenName={token} {...this.props} />}
      </div>
    );
  }
}


OasisTokenBalanceSummary.propTypes = propTypes;
OasisTokenBalanceSummary.displayName = 'OasisTokenBalance';
export default CSSModules(OasisTokenBalanceSummary,styles);
