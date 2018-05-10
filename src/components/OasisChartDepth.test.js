/* global describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import {
  OasisChartDepth,
  mapStateToProps,
  mapDispatchToProps,
} from './OasisChartDepth';

describe('(Component) OasisChartDepth', () => {
  const state = fromJS(global.storeMock);
  const initialProps = mapStateToProps(state);
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps,
    tradingPair: {
      baseToken: 'empty1',
      quoteToken: 'empty2',
    },
  };

  it('should render', () => {
    const wrapper = shallow(
      <OasisChartDepth {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
