/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import EtherscanLink from './EtherscanLink';


describe('(Component) EtherscanLink', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <EtherscanLink {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
