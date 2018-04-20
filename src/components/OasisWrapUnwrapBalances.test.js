/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisWrapUnwrapBalances from './OasisWrapUnwrapBalances';
import { fromJS } from 'immutable';

describe('(Component) OasisWrapUnwrapBalances', () => {
  it('should render', () => {
    const props = {
      wrapUnwrapBalances : fromJS([]),
      resetActiveWrapForm: jest.fn,
      resetActiveUnwrapForm: jest.fn,
    };
    const wrapper = shallow(
      <OasisWrapUnwrapBalances {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
