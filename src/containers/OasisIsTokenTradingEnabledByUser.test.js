/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { fromJS } from 'immutable';

import {
  OasisIsTokenTradingEnabledByUserWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './OasisIsTokenTradingEnabledByUser';
import { shallow } from 'enzyme';
import { TOKEN_MAKER } from '../constants';

describe('(Container) OasisIsTokenTradingEnabledByUser', () => {
  const state = fromJS(global.storeMock);
  const initialProps = mapStateToProps(state, {});
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps,
    tokenName: TOKEN_MAKER
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });


  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <OasisIsTokenTradingEnabledByUserWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
