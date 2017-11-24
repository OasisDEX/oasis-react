/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import Immutable from 'immutable';

import {
  OasisTradeBuySellWrapper,
  mapStateToProps,
  mapDispatchToProps,
} from './OasisTradeBuySell';
import { shallow } from 'enzyme';

describe('(Container) OasisTradeBuySell', () => {
  const state = Immutable.fromJS({});
  const initialProps = mapStateToProps(state);
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });

  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <OasisTradeBuySellWrapper {...props}/>,
    );
    expect(wrapper).toMatchSnapshot();
  });

});
