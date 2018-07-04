/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';

import { OasisMarket } from './OasisMarket';
import { shallow } from 'enzyme';

describe('(Component) OasisMarket', () => {
  it('should render', () => {
    const props = {marketAddress: '0x1234', networkName: 'kovan'};
    const wrapper = shallow(
      <OasisMarket {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
