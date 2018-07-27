import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from "./OasisAccount.scss";
import CSSModules from "react-css-modules";

const propTypes = PropTypes && {};
const defaultProps = {};

export class OasisAccount extends PureComponent {
  render() {
    const { accounts } = this.props;
    return (
      <div styleName="OasisAccount">
        <span styleName="label"> Account: </span>
        <div styleName="AccountSelection">
          <select disabled>
            {/*TODO: Get those accounts from the store of web3 directly or passed as a prop*/}
            {accounts.map(account => (
              <option key={account}> {account} </option>
            ))}
          </select>
          {/*<span styleName="glyphicon" className="glyphicon glyphicon-chevron-down"/>*/}
        </div>
      </div>
    );
  }
}

OasisAccount.displayName = "OasisAccount";
OasisAccount.propTypes = propTypes;
OasisAccount.defaultProps = defaultProps;
export default CSSModules(OasisAccount, styles);
