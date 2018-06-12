/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisYourNodeIsSyncing from './OasisYourNodeIsSyncing';


describe('(Component) OasisYourNodeIsSyncing', () => {
  it('should render', () => {
    const props = {
      latestBlock: {}
    };
    const wrapper = shallow(
      <OasisYourNodeIsSyncing {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
