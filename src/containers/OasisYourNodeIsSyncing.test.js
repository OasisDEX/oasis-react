/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { fromJS } from 'immutable';

import {
  OasisYourNodeIsSyncingWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './OasisYourNodeIsSyncing';
import { shallow } from 'enzyme';

describe('(Container) OasisYourNodeIsSyncing', () => {
  const state = fromJS(global.storeMock);
  const initialProps = mapStateToProps(state);
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps,
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });


  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <OasisYourNodeIsSyncingWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
