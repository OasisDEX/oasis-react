import timersReducer from './../store/reducers/timers';


const init = async (dispatch) => {
  dispatch(timersReducer.actions.InitEpic());
};

export default {
  init,
};