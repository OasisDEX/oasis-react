/* global shallow describe it expect */
/* eslint-disable import/first */
import React from "react";
import { fromJS } from "immutable";

import {
  OasisOrderExceedsGasLimitInfoWrapper,
  mapStateToProps,
  mapDispatchToProps
} from "./OasisOrderExceedsGasLimitInfo";
import { shallow } from "enzyme";
import { PropTypes } from "prop-types";

describe("(Container) OasisOrderExceedsGasLimitInfo", () => {
  const state = fromJS(global.storeMock);
  const initialProps = mapStateToProps(state);
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps,
    gasEstimateInfo: fromJS({})
  };

  it("will receive right props", () => {
    expect(initialProps).toMatchSnapshot();
  });

  it("will SHOW WARNING when estimated gas cost is higher than gas limit", () => {
    const wrapper = shallow(
      <OasisOrderExceedsGasLimitInfoWrapper
        {...props}
        gasEstimateInfo={fromJS({ transactionGasCostEstimate: 100000000 })}
      />
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find(".exceededGasLimit").length).toEqual(1);
  });

  it("will NOT SHOW WARNING when estimated gas cost is less than gas limit", () => {
    const wrapper = shallow(
      <OasisOrderExceedsGasLimitInfoWrapper
        {...props}
        gasEstimateInfo={fromJS({ transactionGasCostEstimate: 10000 })}
      />
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find(".exceededGasLimit").length).toEqual(0);
  });

  it("will receive right actions", () => {
    expect(initialActions).toMatchSnapshot();
  });

  it("should render", () => {
    const wrapper = shallow(
      <OasisOrderExceedsGasLimitInfoWrapper {...props} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
