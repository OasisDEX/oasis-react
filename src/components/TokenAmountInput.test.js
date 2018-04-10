/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import TokenAmountInput from './TokenAmountInput';
import { TOKEN_MAKER } from '../constants';


describe('(Component) TokenAmountInput', () => {
  it('should render', () => {
    const props = {
      selectedToken: TOKEN_MAKER, meta: {}
    };
    const wrapper = shallow(
      <TokenAmountInput {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
