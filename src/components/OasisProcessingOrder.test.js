/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisProcessingOrder from './OasisProcessingOrder';


describe('(Component) OasisProcessingOrder', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OasisProcessingOrder {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
