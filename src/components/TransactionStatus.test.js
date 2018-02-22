/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import TransactionStatus from './TransactionStatus';


describe('(Component) TransactionStatus', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <TransactionStatus {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
