/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisOfferSummary from './OasisOfferSummary';


describe('(Component) OasisOfferSummary', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OasisOfferSummary {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
