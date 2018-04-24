/* global shallow describe it expect */
/* eslint-disable import/first,no-undef */
import React from 'react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import OasisOfferMakeFormWrapper from './OasisOfferMakeForm';
import {
  mapStateToProps,
  mapDispatchToProps
} from './OasisOfferMakeForm';
import { shallow } from 'enzyme';
import { MAKE_BUY_OFFER } from '../constants';
import { combineReducers, createStore } from 'redux';
import { reducer as formReducer } from 'redux-form';

describe('(Container) OasisOfferMakeForm', () => {

  let store = null;
  beforeEach(() => {
    store = createStore(combineReducers({ form: formReducer }));
  });

  const state = fromJS(global.storeMock);
  const initialProps = mapStateToProps(state, { form: 'makeOffer', offerMakeType: MAKE_BUY_OFFER });
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps,
    offerMakeType: MAKE_BUY_OFFER
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });


  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <Provider store={store}>
        <OasisOfferMakeFormWrapper {...props}/>
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
