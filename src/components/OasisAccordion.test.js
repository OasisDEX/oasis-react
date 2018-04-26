/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisAccordion from './OasisAccordion';


describe('(Component) OasisAccordion', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OasisAccordion {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
