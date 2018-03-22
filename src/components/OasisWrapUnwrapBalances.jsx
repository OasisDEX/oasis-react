import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import OasisWidgetFrame from "../containers/OasisWidgetFrame";
import { OasisTable } from "./OasisTable";
import OasisInlineTokenBalance from "./OasisInlineTokenBalance";

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
      />
    )
  }
];

const propTypes = PropTypes && {
  changeRoute: PropTypes.func,
  wrapUnwrapBalances: ImmutablePropTypes.list.isRequired
};
const defaultProps = {};

class OasisWrapUnwrapBalances extends PureComponent {
  constructor(props) {
    super(props);
    this.onTableRowClick = this.onTableRowClick.bind(this);
  }

  onTableRowClick(rowData) {
    const { changeRoute } = this.props;
    changeRoute(`/wrap-unwrap/${rowData.unwrappedToken}`);
  }

  render() {
    const { wrapUnwrapBalances = [] } = this.props;
    return (
      <OasisWidgetFrame heading="BALANCES">
        <OasisTable
          onRowClick={this.onTableRowClick}
          col={colDefinition}
          rows={wrapUnwrapBalances.toJSON()}
        />
      </OasisWidgetFrame>
    );
  }
}

OasisWrapUnwrapBalances.displayName = "OasisWrapUnwrapBalances";
OasisWrapUnwrapBalances.propTypes = propTypes;
OasisWrapUnwrapBalances.defaultProps = defaultProps;
export default OasisWrapUnwrapBalances;
