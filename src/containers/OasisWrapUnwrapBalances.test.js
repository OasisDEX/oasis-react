/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { fromJS } from 'immutable';

import {
  OasisWrapUnwrapBalancesWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './OasisWrapUnwrapBalances';
import { shallow } from 'enzyme';

describe('(Container) OasisWrapUnwrapBalances', () => {
  const state = fromJS(global.storeMock);
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
      <OasisWrapUnwrapBalancesWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
