/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisYourOrderExceedsMaxTotalForToken from './OasisYourOrderExceedsMaxTotalForToken';


describe('(Component) OasisYourOrderExceedsMaxTotalForToken', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OasisYourOrderExceedsMaxTotalForToken {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
