import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';

const initialState = Immutable.fromJS({
  OasisMarketWidget: {
    isExpanded: false
  }
});

const INIT = 'WIDGETS/INIT';
const CONTRACT_WIDGET = 'WIDGETS/CONTRACT_WIDGET';
const EXPAND_WIDGET = 'WIDGETS/EXPAND_WIDGET';

const init = createAction(
  INIT,
  () => null,
);

const expandWidget = createAction(
  EXPAND_WIDGET,
  widgetName => widgetName
);

const contractWidget = createAction(
  CONTRACT_WIDGET,
  widgetName => widgetName
);

const actions = {
  init,
  expandWidget,
  contractWidget
};

const reducer = handleActions({

}, initialState);

export default {
  actions,
  reducer,
};