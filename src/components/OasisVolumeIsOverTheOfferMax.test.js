/* global shallow describe it expect */
/* eslint-disable import/first */
import React from "react";
import { shallow } from "enzyme";
import OasisVolumeIsOverTheOfferMax from "./OasisVolumeIsOverTheOfferMax";
import { TOKEN_WRAPPED_GNT } from "../constants";

describe("(Component) OasisVolumeIsOverTheOfferMax", () => {
  it("should render", () => {
    const props = {
      offerMax: "1234",
      tokenName: TOKEN_WRAPPED_GNT
    };
    const wrapper = shallow(<OasisVolumeIsOverTheOfferMax {...props} />);

    expect(wrapper).toMatchSnapshot();
  });
});
