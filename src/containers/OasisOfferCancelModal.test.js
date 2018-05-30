/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { fromJS } from 'immutable';

import {
  OasisOfferCancelModalWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './OasisOfferCancelModal';
import { shallow } from 'enzyme';

describe('(Container) OasisOfferCancelModal', () => {
  const state = fromJS(global.storeMock);
  const initialProps = mapStateToProps(state, {});
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps,
    offer: fromJS({}),
    canOfferBeCancelled: false,
    onModalClose: jest.fn
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });


  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <OasisOfferCancelModalWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
