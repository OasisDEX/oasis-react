/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisChart from './OasisChart';


describe('(Component) OasisChart', () => {
  it('should render', () => {
    const props = {};
    const wrapper = shallow(
      <OasisChart {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
