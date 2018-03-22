/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisInlineTokenBalance from './OasisInlineTokenBalance';


describe('(Component) OasisInlineTokenBalance', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OasisInlineTokenBalance {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
