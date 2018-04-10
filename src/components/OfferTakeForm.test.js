/* global shallow describe it expect */
/* eslint-disable import/first,no-undef */
import React from 'react';
import { fromJS } from 'immutable';
import { shallow } from 'enzyme';
import { Provider } from 'react-redux';

import { reducer as formReducer } from 'redux-form'
import { createStore, combineReducers } from 'redux'

import OfferTakeForm from './OfferTakeForm';
import {
  mapStateToProps,
  mapDispatchToProps
} from './OfferTakeForm';

describe('(Container) OasisOfferMakeForm', () => {

  let store = null;
  beforeEach(() => {
    store = createStore(combineReducers({ form: formReducer }));
  });

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
      <Provider store={store}>
        <OfferTakeForm {...props}/>
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
