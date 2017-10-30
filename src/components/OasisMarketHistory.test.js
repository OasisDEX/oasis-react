/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisMarketHistory from './OasisMarketHistory';


describe('(Component) OasisMarketHistory', () => {
  it('should render', () => {
    const props = {
    };
    const wrapper = shallow(
      <OasisMarketHistory {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
