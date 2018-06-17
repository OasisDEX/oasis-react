/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisPleaseProvideEthereumAddress from './OasisPleaseProvideEthereumAddress';


describe('(Component) OasisPleaseProvideEthereumAddress', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OasisPleaseProvideEthereumAddress {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
