/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisInsufficientAmountOfToken from './OasisInsufficientAmountOfToken';
import { TOKEN_WRAPPED_ETH } from '../constants';


describe('(Component) OasisInsufficientAmountOfToken', () => {
  it('should render', () => {
    const props = {
      tokenName: TOKEN_WRAPPED_ETH
    };
    const wrapper = shallow(
      <OasisInsufficientAmountOfToken {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
