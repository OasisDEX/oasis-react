/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisLoadingDataOverlay from './OasisLoadingDataOverlay';


describe('(Component) OasisLoadingDataOverlay', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OasisLoadingDataOverlay {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
