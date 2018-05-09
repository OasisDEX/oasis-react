/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisYourTransactionFailed from './OasisYourTransactionFailed';


describe('(Component) OasisYourTransactionFailed', () => {
  it('should render', () => {
    const props = {
      txHash: '0x0'
    };
    const wrapper = shallow(
      <OasisYourTransactionFailed {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
