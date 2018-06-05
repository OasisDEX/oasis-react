/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisVolumeIsOverTheOfferMax from './OasisVolumeIsOverTheOfferMax';


describe('(Component) OasisVolumeIsOverTheOfferMax', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OasisVolumeIsOverTheOfferMax {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
