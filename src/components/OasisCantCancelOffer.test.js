/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisCantCancelOffer from './OasisCantCancelOffer';


describe('(Component) OasisCantCancelOffer', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OasisCantCancelOffer {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
