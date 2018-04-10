/* global shallow describe it expect */
import React from 'react';
import { fromJS } from 'immutable';

import {
  OasisWrapUnwrapWrapper,
  mapStateToProps,
  mapDispatchToProps,
} from './OasisWrapUnwrap';
import { shallow } from 'enzyme';

describe('(Container) OasisWrapUnwrap', () => {
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
      <OasisWrapUnwrapWrapper {...props}/>,
    );
    expect(wrapper).toMatchSnapshot();
  });

});
