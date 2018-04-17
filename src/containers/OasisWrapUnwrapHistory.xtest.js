/* global shallow describe it expect */
/* eslint-disable import/first,no-undef */
import React from 'react';
import { fromJS } from 'immutable';

import {
  OasisWrapUnwrapHistoryWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './OasisWrapUnwrapHistory';
import { shallow } from 'enzyme';

describe('(Container) OasisWrapUnwrapHistory', () => {

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
      <OasisWrapUnwrapHistoryWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
