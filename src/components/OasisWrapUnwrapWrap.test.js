/* global shallow describe it expect */
/* eslint-disable import/first,no-undef */
import React from 'react';
import { shallow } from 'enzyme';
import OasisWrapUnwrapWrap from './OasisWrapUnwrapWrap';
import BigNumber from 'bignumber.js';

describe('(Component) OasisWrapUnwrapWrap', () => {
  it('should render', () => {
    const props = {
      onSubmit: jest.fn,
      onFormChange: jest.fn,
      activeUnwrappedTokenBalance: new BigNumber(100),
      transactionState: { txStatus: true },
      hidden: false
    };
    const wrapper = shallow(
      <OasisWrapUnwrapWrap {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
