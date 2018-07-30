/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisLoadProgressSection from './OasisLoadProgressSection';


describe('(Component) OasisLoadProgressSection', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OasisLoadProgressSection {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
