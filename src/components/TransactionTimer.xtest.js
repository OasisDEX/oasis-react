/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import TransactionTimer from './TransactionTimer';


describe('(Component) TransactionTimer', () => {
  it('should render', () => {
    const props = {};
    const wrapper = shallow(
      <TransactionTimer {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
