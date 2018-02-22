import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './EthercanLink.scss';


const propTypes = PropTypes && {
  label: PropTypes.string,
  networkName: PropTypes.string
};
const defaultProps = {
  networkName: 'kovan'
};


class EthercanLink extends PureComponent {

  render() {
    const { txHash, label, networkName } = this.props;
    const address = `https://${networkName}.etherscan.io/tx/${txHash}`;
    return (
      <span >
        <a style={{ textOverflow: 'elipsis',maxWidth: '80%' }} href={address}>{label||txHash}</a>
      </span>
    );
  }
}

EthercanLink.displayName = 'EthercanLink';
EthercanLink.propTypes = propTypes;
EthercanLink.defaultProps = defaultProps;
export default EthercanLink;
