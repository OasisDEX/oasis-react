/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import EthereumAddressInput from './EthereumAddressInput';


describe('(Component) EthereumAddressInput', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <EthereumAddressInput {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
