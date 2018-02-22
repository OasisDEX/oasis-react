/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OfferTakeForm from './OfferTakeForm';


describe('(Component) OfferTakeForm', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OfferTakeForm {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
