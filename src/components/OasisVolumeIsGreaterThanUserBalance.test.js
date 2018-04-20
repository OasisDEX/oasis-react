/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisVolumeIsGreaterThanUserBalance from './OasisVolumeIsGreaterThanUserBalance';


describe('(Component) OasisVolumeIsGreaterThanUserBalance', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OasisVolumeIsGreaterThanUserBalance {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
