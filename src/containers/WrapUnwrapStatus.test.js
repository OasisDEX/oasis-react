/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { fromJS } from 'immutable';

import {
  WrapUnwrapStatusWrapper,
  mapStateToProps,
  mapDispatchToProps, WRAP_STATUS_VIEW_TYPE_WRAP,
} from './WrapUnwrapStatus';
import { shallow } from 'enzyme';

describe('(Container) WrapUnwrapStatus', () => {
  const state = fromJS(global.storeMock);
  const initialProps = mapStateToProps(state);
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps,
    type: WRAP_STATUS_VIEW_TYPE_WRAP
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });


  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <WrapUnwrapStatusWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
