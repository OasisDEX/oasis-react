/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisOfferNotAvailable from './OasisOfferNotAvailable';


describe('(Component) OasisOfferNotAvailable', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OasisOfferNotAvailable {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
