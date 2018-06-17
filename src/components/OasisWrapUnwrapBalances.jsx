import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import OasisWidgetFrame from "../containers/OasisWidgetFrame";
import { OasisTable } from "./OasisTable";
import OasisInlineTokenBalance from "./OasisInlineTokenBalance";
import { fromJS } from "immutable";
import styles from "./OasisWrapUnwrapBalances.scss";
import CSSModules from "react-css-modules";
/* eslint-disable react/prop-types */

const colDefinition = [
  { heading: "coin", key: "unwrappedToken" },
  {
    heading: "wallet",
    // eslint-disable-next-line react/display-name
    template: ({ unwrappedToken, unwrappedBalance }) => (
      <OasisInlineTokenBalance
        inWei={true}
        token={unwrappedToken}
        balance={unwrappedBalance}
        fractionalZerosGrey={false}
      />
    )
  },
  {
    heading: "wrapped",
    // eslint-disable-next-line react/display-name
    template: ({ wrapperToken, wrappedBalance }) => (
      <OasisInlineTokenBalance
        inWei={true}
        token={wrapperToken}
        balance={wrappedBalance}
        fractionalZerosGrey={false}
      />
    )
  }
];

const propTypes = PropTypes && {
  changeRoute: PropTypes.func,
  wrapUnwrapBalances: ImmutablePropTypes.list.isRequired,
};
const defaultProps = {};

class OasisWrapUnwrapBalances extends PureComponent {
  constructor(props) {
    super(props);
    this.onTableRowClick = this.onTableRowClick.bind(this);
    this.transformRow = this.transformRow.bind(this);
  }

  transformRow(row) {
    if (row.unwrappedToken === this.props.activeUnwrappedToken) {
      return { ...row, isActive: true };
    } else return row;
  }

  onTableRowClick({ unwrappedToken }) {
    const { changeRoute, setActiveWrapUnwrappedToken } = this.props;

    setActiveWrapUnwrappedToken(unwrappedToken);
    changeRoute(`/wrap-unwrap/${unwrappedToken}`);
  }

  render() {
    const { wrapUnwrapBalances = fromJS([]) } = this.props;
    return (
      <OasisWidgetFrame heading="BALANCES">
        <OasisTable
          onRowClick={this.onTableRowClick}
          col={colDefinition}
          rows={wrapUnwrapBalances.toJSON().map(this.transformRow)}
          className={styles.table}
        />
      </OasisWidgetFrame>
    );
  }
}

OasisWrapUnwrapBalances.displayName = "OasisWrapUnwrapBalances";
OasisWrapUnwrapBalances.propTypes = propTypes;
OasisWrapUnwrapBalances.defaultProps = defaultProps;
export default CSSModules(OasisWrapUnwrapBalances, styles);
