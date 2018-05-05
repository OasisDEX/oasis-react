/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisAccordion from './OasisAccordion';


describe('(Component) OasisAccordion', () => {
  it('should render', () => {
    const props = {
      heading: (<div>This this a heading!</div>),
      children: <div>content</div>
    };
    const wrapper = shallow(
      <OasisAccordion {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
