/* global describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import { mockDate } from '../utils/testHelpers';

import {
  OasisChartVolume,
  mapStateToProps,
  mapDispatchToProps,
} from './OasisChartVolume';

describe('(Component) OasisChartVolume', () => {
  const state = fromJS(global.storeMock);
  const initialProps = mockDate('2018-05-10', () => mapStateToProps(state));
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
      <OasisChartVolume {...props}/>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
