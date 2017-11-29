import React, {PureComponent} from 'react';
import {PropTypes} from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisAccount.scss';
import CSSModules from 'react-css-modules';

const propTypes = PropTypes && {};
const defaultProps = {};

class OasisAccount extends PureComponent {
  render() {
    return (
      <div styleName="OasisAccount">
        <span> Account: </span>
        <div styleName="AccountSelection">
          <select>
            {/*TODO: Get those accounts from the store of web3 directly or passed as a prop*/}
            {
              ["0x6cD4471480e2969b3D696fBd17530E85112F3fF6", "0x6cD4471480e2969b3D696fBd17530E85112F3fF5"].map((account) => <option key={account}> {account} </option>)
            }
          </select>
          <span styleName="glyphicon" className="glyphicon glyphicon-chevron-down"/>
        </div>
      </div>
    );
  }
}

OasisAccount.displayName = 'OasisAccount';
OasisAccount.propTypes = propTypes;
OasisAccount.defaultProps = defaultProps;
export default CSSModules(OasisAccount, styles);
